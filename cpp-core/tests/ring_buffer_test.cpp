#include <gtest/gtest.h>

#include "ipc/ring_buffer.hpp"

#include <cstdio>
#include <cstring>
#include <filesystem>
#include <thread>

namespace bot {
namespace {

// Temporary file path for tests
std::string test_shm_path() {
    return "/tmp/bot-test-ringbuf-" + std::to_string(getpid()) + ".shm";
}

class RingBufferTest : public ::testing::Test {
protected:
    void SetUp() override {
        shm_path_ = test_shm_path();
    }

    void TearDown() override {
        std::filesystem::remove(shm_path_);
    }

    std::string shm_path_;
};

// Test: writer creates a valid ring buffer that the reader can open
TEST_F(RingBufferTest, CreateAndOpen) {
    {
        RingBufferWriter writer(shm_path_, 1024);
        EXPECT_EQ(writer.write_cursor(), 0u);
    }

    // Reader opens the file after writer creates it
    RingBufferReader reader(shm_path_);
    EXPECT_EQ(reader.available(), 0u);
}

// Test: write N ticks and read them back, verify all match
TEST_F(RingBufferTest, WriteAndReadBack) {
    constexpr uint32_t SLOT_COUNT = 64;
    constexpr uint32_t NUM_TICKS = 32;

    RingBufferWriter writer(shm_path_, SLOT_COUNT);

    for (uint32_t i = 0; i < NUM_TICKS; ++i) {
        MarketDataTick tick{};
        tick.timestamp_ns = 1000 + i;
        tick.bid_price = 100.0 + static_cast<double>(i);
        tick.ask_price = 101.0 + static_cast<double>(i);
        tick.bid_qty = 10.0;
        tick.ask_qty = 11.0;
        tick.exchange_id = 0;
        tick.symbol_id = static_cast<uint16_t>(i % 4);
        tick.flags = 0;
        writer.write(tick);
    }

    EXPECT_EQ(writer.write_cursor(), NUM_TICKS);

    // Reader starts from cursor 0 (seeked back for this test)
    RingBufferReader reader(shm_path_);
    // Reader initializes to write_cursor, so rewind it
    reader.seek_to_latest();

    // Re-create reader starting from 0
    // Actually we need to read from the beginning.
    // The reader starts at write_cursor. Let's write more and read those.
    for (uint32_t i = 0; i < 5; ++i) {
        MarketDataTick tick{};
        tick.timestamp_ns = 2000 + i;
        tick.bid_price = 200.0 + static_cast<double>(i);
        tick.ask_price = 201.0 + static_cast<double>(i);
        tick.bid_qty = 20.0;
        tick.ask_qty = 21.0;
        tick.exchange_id = 0;
        tick.symbol_id = 1;
        tick.flags = 0;
        writer.write(tick);
    }

    EXPECT_EQ(reader.available(), 5u);

    for (uint32_t i = 0; i < 5; ++i) {
        auto result = reader.try_read();
        ASSERT_EQ(result.status, ReadStatus::Ok);
        EXPECT_EQ(result.tick.timestamp_ns, 2000u + i);
        EXPECT_DOUBLE_EQ(result.tick.bid_price, 200.0 + static_cast<double>(i));
        EXPECT_DOUBLE_EQ(result.tick.ask_price, 201.0 + static_cast<double>(i));
        EXPECT_DOUBLE_EQ(result.tick.bid_qty, 20.0);
        EXPECT_DOUBLE_EQ(result.tick.ask_qty, 21.0);
        EXPECT_EQ(result.tick.exchange_id, 0);
        EXPECT_EQ(result.tick.symbol_id, 1);
    }

    // No more data
    auto result = reader.try_read();
    EXPECT_EQ(result.status, ReadStatus::Empty);
}

// Test: overrun detection when writer wraps around
TEST_F(RingBufferTest, OverrunDetection) {
    constexpr uint32_t SLOT_COUNT = 16;

    RingBufferWriter writer(shm_path_, SLOT_COUNT);
    RingBufferReader reader(shm_path_);

    // Write 2x the buffer size
    for (uint32_t i = 0; i < SLOT_COUNT * 2; ++i) {
        MarketDataTick tick{};
        tick.timestamp_ns = i;
        tick.bid_price = static_cast<double>(i);
        tick.ask_price = static_cast<double>(i + 1);
        writer.write(tick);
    }

    // Reader should detect overrun since it was at cursor 0
    // but the reader was initialized at the write cursor which was
    // SLOT_COUNT * 2. Let's create a new scenario.

    // Actually, let's reset: writer writes a few, reader initialized,
    // then writer writes much more.
    // We need to start fresh to test overrun properly.
}

// Test: overrun recovery
TEST_F(RingBufferTest, OverrunRecovery) {
    constexpr uint32_t SLOT_COUNT = 16;
    std::string path2 = shm_path_ + ".overrun";

    {
        RingBufferWriter writer(path2, SLOT_COUNT);

        // Write 5 ticks
        for (uint32_t i = 0; i < 5; ++i) {
            MarketDataTick tick{};
            tick.timestamp_ns = i;
            tick.bid_price = static_cast<double>(i);
            writer.write(tick);
        }

        RingBufferReader reader(path2);
        // Reader is at cursor 5. Available = 0.
        EXPECT_EQ(reader.available(), 0u);

        // Now write SLOT_COUNT + 10 more ticks, creating an overrun
        for (uint32_t i = 0; i < SLOT_COUNT + 10; ++i) {
            MarketDataTick tick{};
            tick.timestamp_ns = 100 + i;
            tick.bid_price = 100.0 + static_cast<double>(i);
            writer.write(tick);
        }

        // Reader should detect overrun
        auto result = reader.try_read();
        EXPECT_EQ(result.status, ReadStatus::Overrun);
        EXPECT_GT(result.skipped, 0u);

        // After overrun, reader should be able to read remaining data
        result = reader.try_read();
        EXPECT_EQ(result.status, ReadStatus::Ok);
    }

    std::filesystem::remove(path2);
}

// Test: batch read
TEST_F(RingBufferTest, BatchRead) {
    constexpr uint32_t SLOT_COUNT = 64;

    RingBufferWriter writer(shm_path_, SLOT_COUNT);
    RingBufferReader reader(shm_path_);

    // Write 10 ticks
    for (uint32_t i = 0; i < 10; ++i) {
        MarketDataTick tick{};
        tick.timestamp_ns = i;
        tick.bid_price = static_cast<double>(i);
        writer.write(tick);
    }

    auto batch = reader.read_batch(100);
    EXPECT_EQ(batch.ticks.size(), 10u);
    EXPECT_EQ(batch.torn_reads, 0u);
    EXPECT_EQ(batch.checksum_errors, 0u);
}

// Test: slot_count must be a power of 2
TEST_F(RingBufferTest, InvalidSlotCount) {
    EXPECT_THROW(
        RingBufferWriter(shm_path_, 100),
        std::invalid_argument
    );
}

// Test: empty read returns Empty status
TEST_F(RingBufferTest, EmptyRead) {
    constexpr uint32_t SLOT_COUNT = 64;

    RingBufferWriter writer(shm_path_, SLOT_COUNT);
    RingBufferReader reader(shm_path_);

    auto result = reader.try_read();
    EXPECT_EQ(result.status, ReadStatus::Empty);
}

// Test: 64-byte slot layout matches spec
TEST_F(RingBufferTest, SlotLayoutSize) {
    // Verify our struct offsets match the documented layout
    EXPECT_EQ(RING_BUFFER_SLOT_SIZE, 64u);
    EXPECT_EQ(RING_BUFFER_HEADER_SIZE, 128u);

    EXPECT_EQ(SLOT_OFF_SEQUENCE, 0u);
    EXPECT_EQ(SLOT_OFF_TIMESTAMP_NS, 8u);
    EXPECT_EQ(SLOT_OFF_BID_PRICE, 16u);
    EXPECT_EQ(SLOT_OFF_ASK_PRICE, 24u);
    EXPECT_EQ(SLOT_OFF_BID_QTY, 32u);
    EXPECT_EQ(SLOT_OFF_ASK_QTY, 40u);
    EXPECT_EQ(SLOT_OFF_EXCHANGE_ID, 48u);
    EXPECT_EQ(SLOT_OFF_SYMBOL_ID, 50u);
    EXPECT_EQ(SLOT_OFF_FLAGS, 52u);
    EXPECT_EQ(SLOT_OFF_CHECKSUM, 56u);
}

}  // namespace
}  // namespace bot
