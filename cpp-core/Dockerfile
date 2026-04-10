# Multi-stage build for C++ execution core
# Stage 1: Build with full toolchain
# Stage 2: Minimal runtime image with static binary

# ---------------------------------------------------------------------------
# Build stage
# ---------------------------------------------------------------------------
FROM gcc:13 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake \
    ninja-build \
    libssl-dev \
    libboost-system-dev \
    libboost-dev \
    pkg-config \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy source
COPY cpp-core/ /build/

# Configure and build
RUN cmake -B build \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_CXX_STANDARD=20 \
    && cmake --build build --target bot-engine -j$(nproc)

# Tests are run separately in CI (linking issue with GTest regex on this base image)
# RUN cmake --build build --target bot-engine-test -j$(nproc) \
#     && cd build && ctest --output-on-failure

# ---------------------------------------------------------------------------
# Runtime stage
# ---------------------------------------------------------------------------
FROM debian:bookworm-slim AS runtime

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    libboost-system1.74.0 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r botengine && useradd -r -g botengine botengine

# Copy binary from build stage
COPY --from=builder /build/build/bot-engine /usr/local/bin/bot-engine

# /tmp for UDS socket, /data/shm for ring buffer (mounted as tmpfs volume)
RUN mkdir -p /tmp /data/shm && chown botengine:botengine /tmp /data/shm

USER botengine

# Health check: verify the process is running
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD kill -0 $(cat /tmp/bot-engine.pid 2>/dev/null) 2>/dev/null || exit 1

ENTRYPOINT ["/usr/local/bin/bot-engine"]
