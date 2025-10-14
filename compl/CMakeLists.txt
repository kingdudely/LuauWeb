# I love CHATGPT
cmake_minimum_required(VERSION 3.20)
project(LuauWeb LANGUAGES C CXX)

# ---------------------------------------------------------------------
# C++ Standard
# ---------------------------------------------------------------------
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ---------------------------------------------------------------------
# Luau submodule
# ---------------------------------------------------------------------
option(LUAU_BUILD_CLI "Build CLI" OFF)
option(LUAU_BUILD_TESTS "Build tests" OFF)
option(LUAU_BUILD_WEB "Build Web module" OFF)
option(LUAU_WERROR "Warnings as errors" OFF)
option(LUAU_STATIC_CRT "Link with the static CRT (/MT)" OFF)
option(LUAU_EXTERN_C "Use extern C for all APIs" ON)
add_subdirectory(luau)

# ---------------------------------------------------------------------
# Generate Luau API header to avoid macro quoting issues
# ---------------------------------------------------------------------
set(LUAU_WEB_API_HEADER "${CMAKE_CURRENT_BINARY_DIR}/luau_web_api.h")
file(WRITE ${LUAU_WEB_API_HEADER}
"#pragma once\n\
#define LUACODE_API extern \"C\" __attribute__((used))\n\
#define LUA_API      extern \"C\" __attribute__((used))\n"
)

# Force-include the header for Luau targets
target_compile_options(Luau.Compiler PUBLIC "-include" "${LUAU_WEB_API_HEADER}")
target_compile_options(Luau.VM       PUBLIC "-include" "${LUAU_WEB_API_HEADER}")

# ---------------------------------------------------------------------
# Emscripten flags
# ---------------------------------------------------------------------
if(EMSCRIPTEN)
    message(STATUS "Building LuauWeb with Emscripten (${CMAKE_CXX_COMPILER})")

    # Compile-time flags
    set(EMSCRIPTEN_COMPILE_FLAGS
        -fexceptions
        -flto
        -Os
    )

    # Link-time flags
    set(EMSCRIPTEN_LINK_FLAGS
        -sALLOW_MEMORY_GROWTH=1
        -sMODULARIZE=1
        -sEXPORT_ES6=1
        -sENVIRONMENT=web
        -sSINGLE_FILE=1
        -sFILESYSTEM=0
        -sEVAL_CTORS=0
        -sNO_EXIT_RUNTIME=1
        -sEXIT_RUNTIME=0
        -sDYNAMIC_EXECUTION=0
        -sASSERTIONS=0
        -sERROR_ON_UNDEFINED_SYMBOLS=0
        -sSTRICT=1
        -sINVOKE_RUN=0
        -sMINIFY_HTML=1
        -sWASM_BIGINT=0
        -sWASM=1
        -sBINARYEN_EXTRA_PASSES="--dce,--strip-debug,--vacuum,--merge-blocks,--precompute-propagate,--reorder-functions,--strip-producers,--flatten"
        --bind
    )
endif()

# ---------------------------------------------------------------------
# LuauWeb executable
# ---------------------------------------------------------------------
add_executable(LuauWeb
    src/main.cpp
)

# Include Luau headers
target_include_directories(LuauWeb PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/luau/VM/include
    ${CMAKE_CURRENT_SOURCE_DIR}/luau/Compiler/include
    ${CMAKE_CURRENT_SOURCE_DIR}/luau/Ast/include
)

# Link Luau libraries
target_link_libraries(LuauWeb
    PRIVATE
        Luau.Compiler
        Luau.VM
        Luau.Ast
)

# Apply Emscripten flags if building with Emscripten
if(EMSCRIPTEN)
    target_compile_options(LuauWeb PRIVATE ${EMSCRIPTEN_COMPILE_FLAGS})
    target_link_options(LuauWeb PRIVATE ${EMSCRIPTEN_LINK_FLAGS})
endif()

# ---------------------------------------------------------------------
# Output info
# ---------------------------------------------------------------------
message(STATUS "LuauWeb build configured successfully!")
