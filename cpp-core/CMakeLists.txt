cmake_minimum_required(VERSION 3.20)
project(bot-engine VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Build type defaults to Release for production safety
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

# Compiler warnings -- strict on our code, lenient on system/third-party headers
add_compile_options(-Wall -Wextra -Wpedantic -Werror)
# Suppress warnings from system headers (Boost version may predate our compiler)
add_compile_options(-isystem /usr/include/boost)

# ---------------------------------------------------------------------------
# Dependencies via FetchContent
# ---------------------------------------------------------------------------
include(FetchContent)

# nlohmann/json -- header-only JSON library
FetchContent_Declare(
  nlohmann_json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG        v3.11.3
)

# Boost.Beast/Asio -- use system package (installed via apt in Docker)
# Beast is header-only on top of Boost.Asio

# Google Test for unit tests
FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.14.0
)

# Only fetch what we actually need
set(JSON_BuildTests OFF CACHE INTERNAL "")
set(JSON_Install OFF CACHE INTERNAL "")
set(BUILD_TESTING OFF CACHE BOOL "")

FetchContent_MakeAvailable(nlohmann_json googletest)

# Find system Boost (Beast and Asio are header-only, need Boost.System)
find_package(Boost REQUIRED COMPONENTS system)

# OpenSSL -- system dependency (required for TLS WebSocket and HMAC signing)
find_package(OpenSSL REQUIRED)

# ---------------------------------------------------------------------------
# Main library (shared between binary and tests)
# ---------------------------------------------------------------------------
add_library(bot-engine-lib STATIC
  src/connectors/bybit_connector.cpp
  src/time/time_sync.cpp
  src/orders/order_pipeline.cpp
  src/ipc/uds_client.cpp
  src/ipc/ring_buffer.cpp
)

target_include_directories(bot-engine-lib PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(bot-engine-lib PUBLIC
  nlohmann_json::nlohmann_json
  Boost::system
  OpenSSL::SSL
  OpenSSL::Crypto
)

# Platform-specific: link pthreads on Linux
if(UNIX AND NOT APPLE)
  target_link_libraries(bot-engine-lib PUBLIC pthread rt)
endif()

# ---------------------------------------------------------------------------
# Main binary
# ---------------------------------------------------------------------------
add_executable(bot-engine src/main.cpp)
target_link_libraries(bot-engine PRIVATE bot-engine-lib)

# Static linking for production (Linux only; macOS does not support fully static)
if(UNIX AND NOT APPLE AND CMAKE_BUILD_TYPE STREQUAL "Release")
  target_link_options(bot-engine PRIVATE -static-libgcc -static-libstdc++)
endif()

# ---------------------------------------------------------------------------
# Unit tests
# ---------------------------------------------------------------------------
enable_testing()

add_executable(bot-engine-test
  tests/ring_buffer_test.cpp
  tests/time_sync_test.cpp
  tests/order_pipeline_test.cpp
  tests/uds_client_test.cpp
)

target_link_libraries(bot-engine-test PRIVATE
  bot-engine-lib
  GTest::gtest_main
)

include(GoogleTest)
gtest_discover_tests(bot-engine-test)
