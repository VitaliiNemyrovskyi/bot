#include "ipc/ring_buffer.hpp"

#include <cerrno>
#include <cstring>
#include <iostream>
#include <stdexcept>

#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

namespace bot {

// ---------------------------------------------------------------------------
// Type-safe little-endian read/write helpers
// These ensure binary compatibility with TypeScript's Buffer.writeXXXLE()
// ---------------------------------------------------------------------------

template<typename T>
void RingBufferWriter::write_le(uint8_t* ptr, T value) {
    std::memcpy(ptr, &value, sizeof(T));
    // x86-64 and ARM64 (in LE mode) are natively little-endian,
    // so memcpy produces LE encoding. On big-endian platforms
    // this would need byte-swapping.
}

template<typename T>
T RingBufferReader::read_le(const uint8_t* ptr) const {
    T value;
    std::memcpy(&value, ptr, sizeof(T));
    return value;
}

// ---------------------------------------------------------------------------
// Ring Buffer Writer
// ---------------------------------------------------------------------------

RingBufferWriter::RingBufferWriter(
    const std::string& shm_path,
    uint32_t slot_count
)
    : shm_path_(shm_path)
    , slot_count_(slot_count)
    , slot_mask_(slot_count - 1)
{
    // Validate slot_count is a power of 2
    if (slot_count == 0 || (slot_count & (slot_count - 1)) != 0) {
        throw std::invalid_argument(
            "slot_count must be a power of 2, got " + std::to_string(slot_count));
    }

    total_bytes_ = RING_BUFFER_HEADER_SIZE +
        static_cast<size_t>(slot_count) * RING_BUFFER_SLOT_SIZE;

    // Create or truncate the shared memory file
    fd_ = open(shm_path_.c_str(), O_RDWR | O_CREAT | O_TRUNC, 0644);
    if (fd_ < 0) {
        throw std::runtime_error(
            "Failed to create shm file " + shm_path_ + ": " + strerror(errno));
    }

    // Set file size
    if (ftruncate(fd_, static_cast<off_t>(total_bytes_)) != 0) {
        close(fd_);
        throw std::runtime_error(
            "Failed to truncate shm file: " + std::string(strerror(errno)));
    }

    // mmap the file
    mapped_ = static_cast<uint8_t*>(mmap(
        nullptr, total_bytes_,
        PROT_READ | PROT_WRITE,
        MAP_SHARED,
        fd_, 0));

    if (mapped_ == MAP_FAILED) {
        close(fd_);
        throw std::runtime_error(
            "Failed to mmap shm file: " + std::string(strerror(errno)));
    }

    // Zero-initialize
    std::memset(mapped_, 0, total_bytes_);

    // Write header
    initialize_header();

    std::cout << "[RingBufferWriter] Created " << total_bytes_
              << " byte ring buffer at " << shm_path_ << std::endl;
}

RingBufferWriter::~RingBufferWriter() {
    cleanup(false);
}

void RingBufferWriter::initialize_header() {
    write_le<uint32_t>(mapped_ + HDR_OFF_MAGIC, RING_BUFFER_MAGIC);
    write_le<uint32_t>(mapped_ + HDR_OFF_VERSION, RING_BUFFER_VERSION);
    write_le<uint32_t>(mapped_ + HDR_OFF_SLOT_COUNT, slot_count_);
    write_le<uint32_t>(mapped_ + HDR_OFF_SLOT_SIZE, RING_BUFFER_SLOT_SIZE);
    write_le<uint64_t>(mapped_ + HDR_OFF_WRITE_CURSOR, 0);
    write_le<uint64_t>(mapped_ + HDR_OFF_READ_CURSOR, 0);

    // created_at_ns: nanoseconds from steady_clock
    auto now = std::chrono::steady_clock::now();
    uint64_t ns = static_cast<uint64_t>(
        std::chrono::duration_cast<std::chrono::nanoseconds>(
            now.time_since_epoch()
        ).count());
    write_le<uint64_t>(mapped_ + HDR_OFF_CREATED_AT_NS, ns);

    write_le<uint32_t>(mapped_ + HDR_OFF_WRITER_PID,
        static_cast<uint32_t>(getpid()));
}

void RingBufferWriter::write(const MarketDataTick& tick) {
    uint32_t slot_index = static_cast<uint32_t>(write_cursor_ & slot_mask_);
    uint8_t* slot_ptr = mapped_ + RING_BUFFER_HEADER_SIZE +
        slot_index * RING_BUFFER_SLOT_SIZE;

    uint64_t seq = write_cursor_ + 1;

    // Write all data fields (sequence written LAST for SeqLock protocol)
    write_le<uint64_t>(slot_ptr + SLOT_OFF_TIMESTAMP_NS, tick.timestamp_ns);
    write_le<double>(slot_ptr + SLOT_OFF_BID_PRICE, tick.bid_price);
    write_le<double>(slot_ptr + SLOT_OFF_ASK_PRICE, tick.ask_price);
    write_le<double>(slot_ptr + SLOT_OFF_BID_QTY, tick.bid_qty);
    write_le<double>(slot_ptr + SLOT_OFF_ASK_QTY, tick.ask_qty);
    write_le<uint16_t>(slot_ptr + SLOT_OFF_EXCHANGE_ID, tick.exchange_id);
    write_le<uint16_t>(slot_ptr + SLOT_OFF_SYMBOL_ID, tick.symbol_id);
    write_le<uint32_t>(slot_ptr + SLOT_OFF_FLAGS, tick.flags);

    // Compute checksum: XOR of sequence and fields at offsets 8..48 as uint64
    uint64_t checksum = compute_checksum(slot_ptr, seq);
    write_le<uint64_t>(slot_ptr + SLOT_OFF_CHECKSUM, checksum);

    // Write sequence LAST with release semantics
    // This is the critical store that signals to the reader that the slot is valid
    std::atomic_ref<uint64_t> seq_atomic(
        *reinterpret_cast<uint64_t*>(slot_ptr + SLOT_OFF_SEQUENCE));
    seq_atomic.store(seq, std::memory_order_release);

    // Update write cursor in header with release semantics
    write_cursor_ = seq;
    std::atomic_ref<uint64_t> cursor_atomic(
        *reinterpret_cast<uint64_t*>(mapped_ + HDR_OFF_WRITE_CURSOR));
    cursor_atomic.store(seq, std::memory_order_release);
}

uint64_t RingBufferWriter::write_cursor() const {
    return write_cursor_;
}

void RingBufferWriter::cleanup(bool remove_file) {
    if (mapped_ && mapped_ != MAP_FAILED) {
        munmap(mapped_, total_bytes_);
        mapped_ = nullptr;
    }
    if (fd_ >= 0) {
        close(fd_);
        fd_ = -1;
    }
    if (remove_file && !shm_path_.empty()) {
        unlink(shm_path_.c_str());
    }
}

uint64_t RingBufferWriter::compute_checksum(
    const uint8_t* slot_ptr,
    uint64_t seq
) const {
    // XOR of sequence (as if written) and the 6 uint64 values at offsets 8..48
    // This matches the TypeScript implementation:
    //   let xor = seq;
    //   for (let i = 1; i < 7; i++) { xor ^= readBigUInt64LE(slot + i*8); }
    uint64_t xor_val = seq;
    for (int i = 1; i < 7; ++i) {
        uint64_t v;
        std::memcpy(&v, slot_ptr + i * 8, sizeof(uint64_t));
        xor_val ^= v;
    }
    return xor_val;
}

// ---------------------------------------------------------------------------
// Ring Buffer Reader
// ---------------------------------------------------------------------------

RingBufferReader::RingBufferReader(const std::string& shm_path)
    : shm_path_(shm_path)
{
    // Open existing file
    fd_ = open(shm_path_.c_str(), O_RDONLY);
    if (fd_ < 0) {
        throw std::runtime_error(
            "Failed to open shm file " + shm_path_ + ": " + strerror(errno));
    }

    // Get file size
    struct stat st{};
    if (fstat(fd_, &st) != 0) {
        close(fd_);
        throw std::runtime_error(
            "Failed to stat shm file: " + std::string(strerror(errno)));
    }
    total_bytes_ = static_cast<size_t>(st.st_size);

    if (total_bytes_ < RING_BUFFER_HEADER_SIZE) {
        close(fd_);
        throw std::runtime_error("shm file too small for ring buffer header");
    }

    // mmap the file read-only
    mapped_ = static_cast<uint8_t*>(mmap(
        nullptr, total_bytes_,
        PROT_READ,
        MAP_SHARED,
        fd_, 0));

    if (mapped_ == MAP_FAILED) {
        close(fd_);
        throw std::runtime_error(
            "Failed to mmap shm file: " + std::string(strerror(errno)));
    }

    // Validate header
    uint32_t magic = read_le<uint32_t>(mapped_ + HDR_OFF_MAGIC);
    if (magic != RING_BUFFER_MAGIC) {
        cleanup();
        throw std::runtime_error(
            "Invalid ring buffer magic: expected 0x424F5442, got 0x"
            + std::to_string(magic));
    }

    uint32_t version = read_le<uint32_t>(mapped_ + HDR_OFF_VERSION);
    if (version != RING_BUFFER_VERSION) {
        cleanup();
        throw std::runtime_error(
            "Unsupported ring buffer version: " + std::to_string(version));
    }

    slot_count_ = read_le<uint32_t>(mapped_ + HDR_OFF_SLOT_COUNT);
    if (slot_count_ == 0 || (slot_count_ & (slot_count_ - 1)) != 0) {
        cleanup();
        throw std::runtime_error(
            "Corrupt ring buffer: slot_count is not a power of 2");
    }
    slot_mask_ = slot_count_ - 1;

    uint32_t slot_size = read_le<uint32_t>(mapped_ + HDR_OFF_SLOT_SIZE);
    if (slot_size != RING_BUFFER_SLOT_SIZE) {
        cleanup();
        throw std::runtime_error(
            "Unsupported slot size: " + std::to_string(slot_size));
    }

    // Initialize read cursor to current write cursor (start from latest)
    read_cursor_ = get_write_cursor();

    std::cout << "[RingBufferReader] Opened ring buffer at " << shm_path_
              << " (slots=" << slot_count_ << ")" << std::endl;
}

RingBufferReader::~RingBufferReader() {
    cleanup();
}

void RingBufferReader::cleanup() {
    if (mapped_ && mapped_ != MAP_FAILED) {
        munmap(mapped_, total_bytes_);
        mapped_ = nullptr;
    }
    if (fd_ >= 0) {
        close(fd_);
        fd_ = -1;
    }
}

uint64_t RingBufferReader::get_write_cursor() const {
    // Load with acquire semantics to see the writer's latest stores
    std::atomic_ref<const uint64_t> cursor_atomic(
        *reinterpret_cast<const uint64_t*>(mapped_ + HDR_OFF_WRITE_CURSOR));
    return cursor_atomic.load(std::memory_order_acquire);
}

uint64_t RingBufferReader::available() const {
    uint64_t wc = get_write_cursor();
    return (wc > read_cursor_) ? (wc - read_cursor_) : 0;
}

void RingBufferReader::seek_to_latest() {
    read_cursor_ = get_write_cursor();
}

ReadResult RingBufferReader::try_read() {
    ReadResult result;

    uint64_t write_cursor = get_write_cursor();

    if (read_cursor_ >= write_cursor) {
        result.status = ReadStatus::Empty;
        return result;
    }

    // Check for overrun
    uint64_t behind = write_cursor - read_cursor_;
    if (behind > slot_count_) {
        result.status = ReadStatus::Overrun;
        result.skipped = behind - slot_count_;
        read_cursor_ = write_cursor - slot_count_;
        return result;
    }

    uint64_t next_seq = read_cursor_ + 1;
    uint32_t slot_index = static_cast<uint32_t>(read_cursor_ & slot_mask_);
    const uint8_t* slot_ptr = mapped_ + RING_BUFFER_HEADER_SIZE +
        slot_index * RING_BUFFER_SLOT_SIZE;

    for (uint32_t attempt = 0; attempt < MAX_READ_RETRIES; ++attempt) {
        // Read sequence with acquire semantics
        std::atomic_ref<const uint64_t> seq_atomic(
            *reinterpret_cast<const uint64_t*>(slot_ptr + SLOT_OFF_SEQUENCE));
        uint64_t seq1 = seq_atomic.load(std::memory_order_acquire);

        if (seq1 < next_seq) {
            result.status = ReadStatus::Empty;
            return result;
        }

        // Read all data fields
        MarketDataTick& tick = result.tick;
        tick.timestamp_ns = read_le<uint64_t>(slot_ptr + SLOT_OFF_TIMESTAMP_NS);
        tick.bid_price = read_le<double>(slot_ptr + SLOT_OFF_BID_PRICE);
        tick.ask_price = read_le<double>(slot_ptr + SLOT_OFF_ASK_PRICE);
        tick.bid_qty = read_le<double>(slot_ptr + SLOT_OFF_BID_QTY);
        tick.ask_qty = read_le<double>(slot_ptr + SLOT_OFF_ASK_QTY);
        tick.exchange_id = read_le<uint16_t>(slot_ptr + SLOT_OFF_EXCHANGE_ID);
        tick.symbol_id = read_le<uint16_t>(slot_ptr + SLOT_OFF_SYMBOL_ID);
        tick.flags = read_le<uint32_t>(slot_ptr + SLOT_OFF_FLAGS);
        uint64_t checksum = read_le<uint64_t>(slot_ptr + SLOT_OFF_CHECKSUM);

        // Re-read sequence to detect torn write
        uint64_t seq2 = seq_atomic.load(std::memory_order_acquire);
        if (seq1 != seq2) {
            continue;  // Torn read, retry
        }

        // Verify checksum
        uint64_t expected_checksum = compute_checksum(slot_ptr, seq1);
        if (checksum != expected_checksum) {
            result.status = ReadStatus::ChecksumError;
            return result;
        }

        tick.sequence = seq1;
        read_cursor_ = seq1;
        result.status = ReadStatus::Ok;
        return result;
    }

    result.status = ReadStatus::Torn;
    return result;
}

RingBufferReader::BatchResult RingBufferReader::read_batch(uint32_t max_batch) {
    BatchResult batch;

    for (uint32_t i = 0; i < max_batch; ++i) {
        auto result = try_read();
        switch (result.status) {
            case ReadStatus::Ok:
                batch.ticks.push_back(result.tick);
                break;
            case ReadStatus::Empty:
                return batch;
            case ReadStatus::Torn:
                batch.torn_reads++;
                break;
            case ReadStatus::ChecksumError:
                batch.checksum_errors++;
                break;
            case ReadStatus::Overrun:
                batch.overrun_skipped += result.skipped;
                break;
        }
    }

    return batch;
}

uint64_t RingBufferReader::compute_checksum(
    const uint8_t* slot_ptr,
    uint64_t seq
) const {
    // Must match writer's checksum: XOR of seq and uint64 values at offsets 8..48
    uint64_t xor_val = seq;
    for (int i = 1; i < 7; ++i) {
        uint64_t v;
        std::memcpy(&v, slot_ptr + i * 8, sizeof(uint64_t));
        xor_val ^= v;
    }
    return xor_val;
}

}  // namespace bot
