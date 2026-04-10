#pragma once

/**
 * Shared Memory Ring Buffer Writer/Reader
 *
 * Binary-compatible with the TypeScript ring-buffer.ts implementation.
 * Uses mmap on the same /dev/shm file for true zero-copy cross-process
 * shared memory.
 *
 * Memory layout (must match TypeScript exactly):
 *
 * Header (128 bytes at offset 0):
 *   [0..3]   magic: uint32 LE  = 0x424F5442 ("BOTB")
 *   [4..7]   version: uint32 LE = 1
 *   [8..11]  slot_count: uint32 LE (power of 2)
 *   [12..15] slot_size: uint32 LE = 64
 *   [16..23] write_cursor: uint64 LE
 *   [24..31] read_cursor: uint64 LE
 *   [32..39] created_at_ns: uint64 LE
 *   [40..43] writer_pid: uint32 LE
 *   [44..47] reader_pid: uint32 LE
 *   [48..127] reserved (zero)
 *
 * Slot (64 bytes, cache-line aligned):
 *   [0..7]   sequence: uint64 LE
 *   [8..15]  timestamp_ns: uint64 LE
 *   [16..23] bid_price: float64 LE
 *   [24..31] ask_price: float64 LE
 *   [32..39] bid_qty: float64 LE
 *   [40..47] ask_qty: float64 LE
 *   [48..49] exchange_id: uint16 LE
 *   [50..51] symbol_id: uint16 LE
 *   [52..55] flags: uint32 LE
 *   [56..63] checksum: uint64 LE (XOR of first 7 uint64 values)
 *
 * Lock-free protocol: SeqLock variant (see ipc-protocol-spec.md Section 5.3)
 */

#include <atomic>
#include <chrono>
#include <cstdint>
#include <cstring>
#include <optional>
#include <string>

namespace bot {

// Constants matching TypeScript ipc-protocol.ts
constexpr uint32_t RING_BUFFER_MAGIC = 0x424F5442;   // "BOTB"
constexpr uint32_t RING_BUFFER_VERSION = 1;
constexpr uint32_t RING_BUFFER_SLOT_SIZE = 64;
constexpr uint32_t RING_BUFFER_HEADER_SIZE = 128;
constexpr uint32_t RING_BUFFER_DEFAULT_SLOTS = 4096;

// Slot field offsets (bytes from slot start)
constexpr uint32_t SLOT_OFF_SEQUENCE     = 0;
constexpr uint32_t SLOT_OFF_TIMESTAMP_NS = 8;
constexpr uint32_t SLOT_OFF_BID_PRICE    = 16;
constexpr uint32_t SLOT_OFF_ASK_PRICE    = 24;
constexpr uint32_t SLOT_OFF_BID_QTY      = 32;
constexpr uint32_t SLOT_OFF_ASK_QTY      = 40;
constexpr uint32_t SLOT_OFF_EXCHANGE_ID  = 48;
constexpr uint32_t SLOT_OFF_SYMBOL_ID    = 50;
constexpr uint32_t SLOT_OFF_FLAGS        = 52;
constexpr uint32_t SLOT_OFF_CHECKSUM     = 56;

// Header field offsets
constexpr uint32_t HDR_OFF_MAGIC         = 0;
constexpr uint32_t HDR_OFF_VERSION       = 4;
constexpr uint32_t HDR_OFF_SLOT_COUNT    = 8;
constexpr uint32_t HDR_OFF_SLOT_SIZE     = 12;
constexpr uint32_t HDR_OFF_WRITE_CURSOR  = 16;
constexpr uint32_t HDR_OFF_READ_CURSOR   = 24;
constexpr uint32_t HDR_OFF_CREATED_AT_NS = 32;
constexpr uint32_t HDR_OFF_WRITER_PID    = 40;
constexpr uint32_t HDR_OFF_READER_PID    = 44;

// Slot flag bits
constexpr uint32_t SLOT_FLAG_STALE                 = 1 << 0;
constexpr uint32_t SLOT_FLAG_EXCHANGE_DISCONNECTED  = 1 << 1;

// Market data tick (matches TypeScript MarketDataSlot)
struct MarketDataTick {
    uint64_t sequence = 0;
    uint64_t timestamp_ns = 0;
    double bid_price = 0.0;
    double ask_price = 0.0;
    double bid_qty = 0.0;
    double ask_qty = 0.0;
    uint16_t exchange_id = 0;
    uint16_t symbol_id = 0;
    uint32_t flags = 0;
};

// Read result status
enum class ReadStatus {
    Ok,
    Empty,
    Torn,
    ChecksumError,
    Overrun
};

struct ReadResult {
    ReadStatus status = ReadStatus::Empty;
    MarketDataTick tick;
    uint64_t skipped = 0;  // Only valid for Overrun status
};

// ---------------------------------------------------------------------------
// Ring Buffer Writer
// ---------------------------------------------------------------------------

class RingBufferWriter {
public:
    // Create a new ring buffer file at the given path
    // slot_count must be a power of 2
    RingBufferWriter(const std::string& shm_path, uint32_t slot_count);
    ~RingBufferWriter();

    RingBufferWriter(const RingBufferWriter&) = delete;
    RingBufferWriter& operator=(const RingBufferWriter&) = delete;

    // Write a market data tick to the next slot
    void write(const MarketDataTick& tick);

    // Get current write cursor
    uint64_t write_cursor() const;

    // Get the shared memory path
    const std::string& shm_path() const { return shm_path_; }

    // Clean up: unmap and optionally remove the file
    void cleanup(bool remove_file = true);

private:
    void initialize_header();
    uint64_t compute_checksum(const uint8_t* slot_ptr, uint64_t seq) const;

    // Write helpers for type-safe LE encoding
    template<typename T>
    void write_le(uint8_t* ptr, T value);

    std::string shm_path_;
    uint32_t slot_count_;
    uint32_t slot_mask_;
    uint64_t write_cursor_ = 0;
    size_t total_bytes_ = 0;

    // mmap'd memory
    uint8_t* mapped_ = nullptr;
    int fd_ = -1;
};

// ---------------------------------------------------------------------------
// Ring Buffer Reader
// ---------------------------------------------------------------------------

class RingBufferReader {
public:
    // Open an existing ring buffer file
    explicit RingBufferReader(const std::string& shm_path);
    ~RingBufferReader();

    RingBufferReader(const RingBufferReader&) = delete;
    RingBufferReader& operator=(const RingBufferReader&) = delete;

    // Try to read the next tick
    ReadResult try_read();

    // Read a batch of ticks (up to max_batch)
    struct BatchResult {
        std::vector<MarketDataTick> ticks;
        uint32_t torn_reads = 0;
        uint32_t checksum_errors = 0;
        uint64_t overrun_skipped = 0;
    };
    BatchResult read_batch(uint32_t max_batch);

    // Skip to latest data
    void seek_to_latest();

    // How many ticks are available
    uint64_t available() const;

    // Get read cursor
    uint64_t read_cursor() const { return read_cursor_; }

    // Clean up: unmap
    void cleanup();

private:
    uint64_t get_write_cursor() const;
    uint64_t compute_checksum(const uint8_t* slot_ptr, uint64_t seq) const;

    template<typename T>
    T read_le(const uint8_t* ptr) const;

    std::string shm_path_;
    uint32_t slot_count_ = 0;
    uint32_t slot_mask_ = 0;
    uint64_t read_cursor_ = 0;
    size_t total_bytes_ = 0;

    uint8_t* mapped_ = nullptr;
    int fd_ = -1;

    static constexpr uint32_t MAX_READ_RETRIES = 8;
};

}  // namespace bot
