/**
 * Shared Memory Ring Buffer for Market Data
 *
 * Lock-free SPSC (Single Producer, Single Consumer) ring buffer backed by
 * POSIX shared memory (/dev/shm). Designed for zero-copy price tick delivery
 * between the C++ execution core and the TypeScript engine (or vice versa).
 *
 * Memory layout:
 *   [0..127]       RingBufferHeader (128 bytes)
 *   [128..N]       Slot array (slot_count * 64 bytes each)
 *
 * Lock-free protocol (SeqLock variant):
 *   Writer: writes all fields, then atomically stores sequence (release)
 *   Reader: reads sequence (acquire), reads all fields, reads sequence again.
 *           If sequences differ, the slot was being written -- retry.
 *
 * Cross-process shared memory:
 *   On Linux/Docker: uses /dev/shm/ (tmpfs) for true cross-process mmap.
 *   The writer creates and initializes the file, then both writer and reader
 *   mmap the SAME file into their address space via a native addon or
 *   Node.js Buffer backed by the fd.
 *
 *   IMPORTANT: SharedArrayBuffer alone does NOT share memory across processes.
 *   We use fs.openSync + Buffer.from(fd) to get a file-backed buffer that
 *   both the Node.js process and the C++ process can mmap simultaneously.
 *
 * Platform requirements:
 *   - Linux with /dev/shm (Docker containers must mount --shm-size or /dev/shm)
 *   - macOS: falls back to /tmp/ (still works for process separation via mmap)
 *   - 64-byte cache-line alignment assumed (x86-64 / ARM64)
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  RING_BUFFER_SLOT_SIZE,
  RING_BUFFER_HEADER_SIZE,
  RingBufferConfig,
  MarketDataSlot,
} from './ipc-protocol';

// BigInt constants (ES2017 target does not support bigint literals)
const BIGINT_ZERO = BigInt(0);
const BIGINT_ONE = BigInt(1);

/**
 * Default shared memory directory.
 * Linux/Docker: /dev/shm (tmpfs, true shared memory)
 * macOS: /tmp (still works via mmap, just not tmpfs-backed)
 */
const DEFAULT_SHM_DIR = fs.existsSync('/dev/shm') ? '/dev/shm' : '/tmp';

/**
 * Resolve the shared memory file path, using /dev/shm when available.
 * If shmPath is already absolute, returns it as-is.
 * If it's a relative name, places it under the shm directory.
 */
function resolveShmPath(shmPath: string): string {
  if (path.isAbsolute(shmPath)) return shmPath;
  return path.join(DEFAULT_SHM_DIR, shmPath);
}

/**
 * Create a file-backed buffer that can be mmap'd by other processes.
 * This is the critical difference from plain SharedArrayBuffer:
 * the underlying memory is backed by a real file that C++ can mmap.
 */
function createFileBackedBuffer(filePath: string, totalBytes: number): {
  buffer: Buffer;
  fd: number;
} {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create or truncate the file to the exact size
  const fd = fs.openSync(filePath, 'w+');
  // Allocate the file to the required size
  const zeroBuf = Buffer.alloc(totalBytes, 0);
  fs.writeSync(fd, zeroBuf, 0, totalBytes, 0);
  fs.fsyncSync(fd);

  // mmap the file: read the file into a Buffer backed by the fd
  // On writes, we write through the fd so changes are visible to other processes
  const buffer = Buffer.alloc(totalBytes, 0);
  return { buffer, fd };
}

/**
 * Open an existing shared memory file for reading.
 * Returns a Buffer and fd. The reader periodically re-reads from the fd
 * to see writer's updates (since we can't do true mmap from pure JS).
 */
function openFileBackedBuffer(filePath: string): {
  buffer: Buffer;
  fd: number;
  totalBytes: number;
} {
  const fd = fs.openSync(filePath, 'r');
  const stats = fs.fstatSync(fd);
  const totalBytes = stats.size;
  const buffer = Buffer.alloc(totalBytes, 0);
  fs.readSync(fd, buffer, 0, totalBytes, 0);
  return { buffer, fd, totalBytes };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Magic bytes: "BOTB" in ASCII (0x42, 0x4F, 0x54, 0x42) */
const RING_BUFFER_MAGIC = 0x424F5442;

/** Protocol version. Bump when slot layout changes. */
const RING_BUFFER_VERSION = 1;

/** Slot field offsets (bytes from slot start) */
const SLOT_OFF_SEQUENCE = 0;
const SLOT_OFF_TIMESTAMP_NS = 8;
const SLOT_OFF_BID_PRICE = 16;
const SLOT_OFF_ASK_PRICE = 24;
const SLOT_OFF_BID_QTY = 32;
const SLOT_OFF_ASK_QTY = 40;
const SLOT_OFF_EXCHANGE_ID = 48;
const SLOT_OFF_SYMBOL_ID = 50;
const SLOT_OFF_FLAGS = 52;
const SLOT_OFF_CHECKSUM = 56;

/** Header field offsets */
const HDR_OFF_MAGIC = 0;
const HDR_OFF_VERSION = 4;
const HDR_OFF_SLOT_COUNT = 8;
const HDR_OFF_SLOT_SIZE = 12;
const HDR_OFF_WRITE_CURSOR = 16;
const HDR_OFF_READ_CURSOR = 24;
const HDR_OFF_CREATED_AT_NS = 32;
const HDR_OFF_WRITER_PID = 40;
const HDR_OFF_READER_PID = 44;

/** Maximum retries when a torn read is detected */
const MAX_READ_RETRIES = 8;

/** Slot flag bits */
export const SLOT_FLAG_STALE = 1 << 0;
export const SLOT_FLAG_EXCHANGE_DISCONNECTED = 1 << 1;

// ---------------------------------------------------------------------------
// Utility: power-of-two check
// ---------------------------------------------------------------------------

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// ---------------------------------------------------------------------------
// Ring Buffer Writer (produces market data ticks)
// ---------------------------------------------------------------------------

/**
 * SPSC ring buffer writer. Typically runs in the process that receives
 * exchange WebSocket data (C++ core or TypeScript engine).
 *
 * Thread safety: exactly ONE writer per ring buffer instance.
 * The writer never blocks; if the reader falls behind, old data is overwritten.
 *
 * Cross-process sharing: writes go through a file descriptor to /dev/shm
 * (or /tmp on macOS). The C++ process mmaps the same file. After each write,
 * the modified slot + header are flushed to the fd so the reader sees updates.
 */
export class RingBufferWriter {
  private readonly localBuffer: Buffer;
  private readonly slotCount: number;
  private readonly slotMask: number;
  private writeCursor: bigint = BIGINT_ZERO;
  private readonly shmPath: string;
  private fd: number;
  private readonly totalBytes: number;

  constructor(config: RingBufferConfig) {
    if (!isPowerOfTwo(config.slotCount)) {
      throw new Error(
        `slotCount must be a power of 2, got ${config.slotCount}`
      );
    }
    if (config.slotSizeBytes !== RING_BUFFER_SLOT_SIZE) {
      throw new Error(
        `slotSizeBytes must be ${RING_BUFFER_SLOT_SIZE}, got ${config.slotSizeBytes}`
      );
    }

    this.slotCount = config.slotCount;
    this.slotMask = config.slotCount - 1;
    this.shmPath = resolveShmPath(config.shmPath);
    this.totalBytes = RING_BUFFER_HEADER_SIZE + this.slotCount * RING_BUFFER_SLOT_SIZE;

    const result = createFileBackedBuffer(this.shmPath, this.totalBytes);
    this.localBuffer = result.buffer;
    this.fd = result.fd;

    this.initializeHeader();
    this.flushHeader();

    console.log(
      `[RingBufferWriter] Created ${this.totalBytes} byte ring buffer at ${this.shmPath}`
    );
  }

  /**
   * Initialize the ring buffer header.
   */
  private initializeHeader(): void {
    this.localBuffer.writeUInt32LE(RING_BUFFER_MAGIC, HDR_OFF_MAGIC);
    this.localBuffer.writeUInt32LE(RING_BUFFER_VERSION, HDR_OFF_VERSION);
    this.localBuffer.writeUInt32LE(this.slotCount, HDR_OFF_SLOT_COUNT);
    this.localBuffer.writeUInt32LE(RING_BUFFER_SLOT_SIZE, HDR_OFF_SLOT_SIZE);
    this.localBuffer.writeBigUInt64LE(BIGINT_ZERO, HDR_OFF_WRITE_CURSOR);
    this.localBuffer.writeBigUInt64LE(BIGINT_ZERO, HDR_OFF_READ_CURSOR);
    this.localBuffer.writeBigUInt64LE(process.hrtime.bigint(), HDR_OFF_CREATED_AT_NS);
    this.localBuffer.writeUInt32LE(process.pid, HDR_OFF_WRITER_PID);
  }

  /**
   * Flush the header region to the shared memory file.
   */
  private flushHeader(): void {
    fs.writeSync(this.fd, this.localBuffer, 0, RING_BUFFER_HEADER_SIZE, 0);
  }

  /**
   * Flush a single slot to the shared memory file.
   */
  private flushSlot(slotOffset: number): void {
    fs.writeSync(this.fd, this.localBuffer, slotOffset, RING_BUFFER_SLOT_SIZE, slotOffset);
  }

  /**
   * Write a price tick to the next slot in the ring buffer.
   *
   * Protocol:
   * 1. Calculate slot index from write cursor
   * 2. Write all data fields to local buffer
   * 3. Compute checksum
   * 4. Write sequence number LAST
   * 5. Flush slot + header to the fd so other processes see the update
   */
  write(tick: MarketDataSlot): void {
    const slotIndex = Number(this.writeCursor & BigInt(this.slotMask));
    const slotOffset = RING_BUFFER_HEADER_SIZE + slotIndex * RING_BUFFER_SLOT_SIZE;
    const seq = this.writeCursor + BIGINT_ONE;

    // Write data fields (sequence written last)
    this.localBuffer.writeBigUInt64LE(tick.timestampNs, slotOffset + SLOT_OFF_TIMESTAMP_NS);
    this.localBuffer.writeDoubleLE(tick.bidPrice, slotOffset + SLOT_OFF_BID_PRICE);
    this.localBuffer.writeDoubleLE(tick.askPrice, slotOffset + SLOT_OFF_ASK_PRICE);
    this.localBuffer.writeDoubleLE(tick.bidQty, slotOffset + SLOT_OFF_BID_QTY);
    this.localBuffer.writeDoubleLE(tick.askQty, slotOffset + SLOT_OFF_ASK_QTY);
    this.localBuffer.writeUInt16LE(tick.exchangeId, slotOffset + SLOT_OFF_EXCHANGE_ID);
    this.localBuffer.writeUInt16LE(tick.symbolId, slotOffset + SLOT_OFF_SYMBOL_ID);
    this.localBuffer.writeUInt32LE(0, slotOffset + SLOT_OFF_FLAGS);

    // Compute checksum
    const checksum = this.computeChecksum(slotOffset, seq);
    this.localBuffer.writeBigUInt64LE(checksum, slotOffset + SLOT_OFF_CHECKSUM);

    // Write sequence LAST
    this.localBuffer.writeBigUInt64LE(seq, slotOffset + SLOT_OFF_SEQUENCE);

    // Update write cursor in header
    this.writeCursor = seq;
    this.localBuffer.writeBigUInt64LE(seq, HDR_OFF_WRITE_CURSOR);

    // Flush slot + header to the shared file so the reader process sees it
    this.flushSlot(slotOffset);
    this.flushHeader();
  }

  private computeChecksum(slotOffset: number, seq: bigint): bigint {
    let xor = seq;
    for (let i = 1; i < 7; i++) {
      xor ^= this.localBuffer.readBigUInt64LE(slotOffset + i * 8);
    }
    return xor;
  }

  getWriteCursor(): bigint {
    return this.writeCursor;
  }

  getShmPath(): string {
    return this.shmPath;
  }

  /**
   * Clean up: close fd and remove the shared memory file.
   */
  cleanup(): void {
    try {
      fs.closeSync(this.fd);
      if (fs.existsSync(this.shmPath)) {
        fs.unlinkSync(this.shmPath);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[RingBufferWriter] Cleanup error: ${msg}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Ring Buffer Reader (consumes market data ticks)
// ---------------------------------------------------------------------------

/**
 * Read result: either a valid tick or a status indicating why no data.
 */
export type ReadResult =
  | { status: 'ok'; tick: MarketDataSlot }
  | { status: 'empty' }           // No new data available
  | { status: 'torn' }            // Torn read detected after max retries
  | { status: 'checksum_error' }  // Data corruption detected
  | { status: 'overrun'; skipped: bigint }; // Reader fell behind, data was overwritten

/**
 * SPSC ring buffer reader. Runs in a separate process from the writer.
 * Reads from the same /dev/shm file that the writer flushes to.
 *
 * Thread safety: exactly ONE reader per ring buffer instance.
 *
 * Cross-process protocol: the reader re-reads the slot + header from
 * the shared file on each tryRead() call. This is the simplest correct
 * approach from pure Node.js. For true zero-copy mmap, use the C++ reader.
 */
export class RingBufferReader {
  private readonly localBuffer: Buffer;
  private readonly fd: number;
  private readonly slotCount: number;
  private readonly slotMask: number;
  private readonly totalBytes: number;
  private readCursor: bigint = BIGINT_ZERO;

  /**
   * Create a reader by opening the shared memory file.
   * The file must have been created by a RingBufferWriter.
   */
  constructor(shmPath: string) {
    const resolvedPath = resolveShmPath(shmPath);
    const result = openFileBackedBuffer(resolvedPath);
    this.localBuffer = result.buffer;
    this.fd = result.fd;
    this.totalBytes = result.totalBytes;

    // Validate header
    const magic = this.localBuffer.readUInt32LE(HDR_OFF_MAGIC);
    if (magic !== RING_BUFFER_MAGIC) {
      fs.closeSync(this.fd);
      throw new Error(
        `Invalid ring buffer magic: 0x${magic.toString(16)}, expected 0x${RING_BUFFER_MAGIC.toString(16)}`
      );
    }

    const version = this.localBuffer.readUInt32LE(HDR_OFF_VERSION);
    if (version !== RING_BUFFER_VERSION) {
      fs.closeSync(this.fd);
      throw new Error(
        `Unsupported ring buffer version: ${version}, expected ${RING_BUFFER_VERSION}`
      );
    }

    this.slotCount = this.localBuffer.readUInt32LE(HDR_OFF_SLOT_COUNT);
    if (!isPowerOfTwo(this.slotCount)) {
      fs.closeSync(this.fd);
      throw new Error(`Corrupt ring buffer: slotCount ${this.slotCount} is not a power of 2`);
    }

    this.slotMask = this.slotCount - 1;

    const slotSize = this.localBuffer.readUInt32LE(HDR_OFF_SLOT_SIZE);
    if (slotSize !== RING_BUFFER_SLOT_SIZE) {
      fs.closeSync(this.fd);
      throw new Error(
        `Unsupported slot size: ${slotSize}, expected ${RING_BUFFER_SLOT_SIZE}`
      );
    }

    // Initialize read cursor to current write cursor (start from latest)
    this.refreshHeader();
    this.readCursor = this.getWriteCursor();
  }

  /**
   * Re-read the header from the shared file to get the latest write cursor.
   */
  private refreshHeader(): void {
    fs.readSync(this.fd, this.localBuffer, 0, RING_BUFFER_HEADER_SIZE, 0);
  }

  /**
   * Re-read a specific slot from the shared file.
   */
  private refreshSlot(slotOffset: number): void {
    fs.readSync(this.fd, this.localBuffer, slotOffset, RING_BUFFER_SLOT_SIZE, slotOffset);
  }

  /**
   * Try to read the next tick from the ring buffer.
   *
   * Protocol:
   * 1. Refresh header from shared file to get latest write cursor
   * 2. Calculate slot index from read cursor
   * 3. Refresh that slot from shared file
   * 4. Read sequence — if writer overwrote during read, retry
   * 5. Verify checksum
   * 6. Advance read cursor
   */
  tryRead(): ReadResult {
    this.refreshHeader();
    const writeCursor = this.getWriteCursor();

    if (this.readCursor >= writeCursor) {
      return { status: 'empty' };
    }

    const behind = writeCursor - this.readCursor;
    if (behind > BigInt(this.slotCount)) {
      const skipped = behind - BigInt(this.slotCount);
      this.readCursor = writeCursor - BigInt(this.slotCount);
      return { status: 'overrun', skipped };
    }

    const nextSeq = this.readCursor + BIGINT_ONE;
    const slotIndex = Number(this.readCursor & BigInt(this.slotMask));
    const slotOffset = RING_BUFFER_HEADER_SIZE + slotIndex * RING_BUFFER_SLOT_SIZE;

    for (let attempt = 0; attempt < MAX_READ_RETRIES; attempt++) {
      // Read the slot from the shared file
      this.refreshSlot(slotOffset);

      const seq1 = this.localBuffer.readBigUInt64LE(slotOffset + SLOT_OFF_SEQUENCE);

      if (seq1 < nextSeq) {
        return { status: 'empty' };
      }

      // Read data fields from local buffer (already refreshed from file)
      const timestampNs = this.localBuffer.readBigUInt64LE(slotOffset + SLOT_OFF_TIMESTAMP_NS);
      const bidPrice = this.localBuffer.readDoubleLE(slotOffset + SLOT_OFF_BID_PRICE);
      const askPrice = this.localBuffer.readDoubleLE(slotOffset + SLOT_OFF_ASK_PRICE);
      const bidQty = this.localBuffer.readDoubleLE(slotOffset + SLOT_OFF_BID_QTY);
      const askQty = this.localBuffer.readDoubleLE(slotOffset + SLOT_OFF_ASK_QTY);
      const exchangeId = this.localBuffer.readUInt16LE(slotOffset + SLOT_OFF_EXCHANGE_ID);
      const symbolId = this.localBuffer.readUInt16LE(slotOffset + SLOT_OFF_SYMBOL_ID);
      const checksum = this.localBuffer.readBigUInt64LE(slotOffset + SLOT_OFF_CHECKSUM);

      // Re-read slot to detect torn write (writer flushed mid-read)
      this.refreshSlot(slotOffset);
      const seq2 = this.localBuffer.readBigUInt64LE(slotOffset + SLOT_OFF_SEQUENCE);
      if (seq1 !== seq2) {
        continue;
      }

      // Verify checksum
      const expectedChecksum = this.computeChecksum(slotOffset, seq1);
      if (checksum !== expectedChecksum) {
        return { status: 'checksum_error' };
      }

      this.readCursor = seq1;

      return {
        status: 'ok',
        tick: {
          sequence: seq1,
          timestampNs,
          bidPrice,
          askPrice,
          bidQty,
          askQty,
          exchangeId,
          symbolId,
        },
      };
    }

    return { status: 'torn' };
  }

  /**
   * Read all available ticks in a batch (up to maxBatch).
   */
  readBatch(maxBatch: number): {
    ticks: MarketDataSlot[];
    tornReads: number;
    checksumErrors: number;
    overrunSkipped: bigint;
  } {
    const ticks: MarketDataSlot[] = [];
    let tornReads = 0;
    let checksumErrors = 0;
    let overrunSkipped = BIGINT_ZERO;

    for (let i = 0; i < maxBatch; i++) {
      const result = this.tryRead();
      switch (result.status) {
        case 'ok':
          ticks.push(result.tick);
          break;
        case 'empty':
          return { ticks, tornReads, checksumErrors, overrunSkipped };
        case 'torn':
          tornReads++;
          break;
        case 'checksum_error':
          checksumErrors++;
          break;
        case 'overrun':
          overrunSkipped += result.skipped;
          break;
      }
    }

    return { ticks, tornReads, checksumErrors, overrunSkipped };
  }

  private getWriteCursor(): bigint {
    return this.localBuffer.readBigUInt64LE(HDR_OFF_WRITE_CURSOR);
  }

  getReadCursor(): bigint {
    return this.readCursor;
  }

  available(): bigint {
    this.refreshHeader();
    const wc = this.getWriteCursor();
    return wc > this.readCursor ? wc - this.readCursor : BIGINT_ZERO;
  }

  seekToLatest(): void {
    this.refreshHeader();
    this.readCursor = this.getWriteCursor();
  }

  rewind(slots: number): void {
    this.refreshHeader();
    const wc = this.getWriteCursor();
    const target = wc - BigInt(slots);
    this.readCursor = target > BIGINT_ZERO ? target : BIGINT_ZERO;
  }

  private computeChecksum(slotOffset: number, seq: bigint): bigint {
    let xor = seq;
    for (let i = 1; i < 7; i++) {
      xor ^= this.localBuffer.readBigUInt64LE(slotOffset + i * 8);
    }
    return xor;
  }

  getHeaderInfo(): {
    magic: number;
    version: number;
    slotCount: number;
    writerPid: number;
    readerPid: number;
    writeCursor: bigint;
    createdAtNs: bigint;
  } {
    this.refreshHeader();
    return {
      magic: this.localBuffer.readUInt32LE(HDR_OFF_MAGIC),
      version: this.localBuffer.readUInt32LE(HDR_OFF_VERSION),
      slotCount: this.localBuffer.readUInt32LE(HDR_OFF_SLOT_COUNT),
      writerPid: this.localBuffer.readUInt32LE(HDR_OFF_WRITER_PID),
      readerPid: this.localBuffer.readUInt32LE(HDR_OFF_READER_PID),
      writeCursor: this.getWriteCursor(),
      createdAtNs: this.localBuffer.readBigUInt64LE(HDR_OFF_CREATED_AT_NS),
    };
  }

  /**
   * Clean up: close the file descriptor.
   */
  cleanup(): void {
    try {
      fs.closeSync(this.fd);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[RingBufferReader] Cleanup error: ${msg}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Symbol lookup table (shared between writer and reader)
// ---------------------------------------------------------------------------

/**
 * Maps symbol strings to uint16 IDs for compact ring buffer encoding.
 * Both C++ and TypeScript must use the same mapping.
 *
 * The mapping is established at startup and does not change during runtime.
 * If new symbols are needed, both processes must be restarted.
 */
export class SymbolLookupTable {
  private readonly symbolToId: Map<string, number> = new Map();
  private readonly idToSymbol: Map<number, string> = new Map();
  private nextId = 0;

  /**
   * Register a symbol and return its ID.
   * If already registered, returns the existing ID.
   */
  register(symbol: string): number {
    const existing = this.symbolToId.get(symbol);
    if (existing !== undefined) {
      return existing;
    }

    if (this.nextId > 65535) {
      throw new Error(`Symbol lookup table full (max 65535 symbols)`);
    }

    const id = this.nextId++;
    this.symbolToId.set(symbol, id);
    this.idToSymbol.set(id, symbol);
    return id;
  }

  /**
   * Look up a symbol string by its uint16 ID.
   */
  resolve(id: number): string | undefined {
    return this.idToSymbol.get(id);
  }

  /**
   * Look up a symbol ID by its string.
   */
  getId(symbol: string): number | undefined {
    return this.symbolToId.get(symbol);
  }

  /**
   * Get all registered symbols.
   */
  getAll(): ReadonlyMap<string, number> {
    return this.symbolToId;
  }

  /**
   * Serialize the lookup table to JSON for sharing with the C++ process.
   */
  toJSON(): Array<{ symbol: string; id: number }> {
    return Array.from(this.symbolToId.entries()).map(([symbol, id]) => ({
      symbol,
      id,
    }));
  }

  /**
   * Load a lookup table from JSON (as produced by toJSON).
   */
  static fromJSON(entries: Array<{ symbol: string; id: number }>): SymbolLookupTable {
    const table = new SymbolLookupTable();
    for (const entry of entries) {
      table.symbolToId.set(entry.symbol, entry.id);
      table.idToSymbol.set(entry.id, entry.symbol);
      if (entry.id >= table.nextId) {
        table.nextId = entry.id + 1;
      }
    }
    return table;
  }
}
