cmake_minimum_required(VERSION 3.19)
project(Luau.LuauWeb LANGUAGES C CXX)
set(CMAKE_CXX_STANDARD 17)

# Import Luau
option(LUAU_BUILD_CLI "Build CLI" OFF)
option(LUAU_BUILD_TESTS "Build tests" OFF)
option(LUAU_BUILD_WEB "Build Web module" OFF)
option(LUAU_WERROR "Warnings as errors" OFF)
option(LUAU_STATIC_CRT "Link with the static CRT (/MT)" OFF)
option(LUAU_EXTERN_C "Use extern C for all APIs" ON)
add_subdirectory(luau)

# some emscripten config
set(EMSCRIPTEN_OPTS)
list(APPEND EMSCRIPTEN_OPTS -fexceptions -sEXPORTED_RUNTIME_METHODS=['HEAP32','HEAPU8','getValue','setValue'] -sALLOW_MEMORY_GROWTH=1 -sSINGLE_FILE=1 -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=web)

# Compiler variant compile & link options
set(COMPILER_CC_OPTS)
list(APPEND COMPILER_CC_OPTS -Oz -flto)
set(COMPILER_LN_OPTS)
list(APPEND COMPILER_LN_OPTS -Oz -flto -sEVAL_CTORS=2 -sEXPORTED_FUNCTIONS=['_strlen','_malloc','_free'] -sBINARYEN_EXTRA_PASSES='vacuum,simplify-locals,simplify-globals,optimize-instructions,optimize-stack-ir,fast-math,strip-dwarf,code-folding,duplicate-function-elimination,duplicate-import-elimination,rse,type-ssa')

# VM variant compile & link options
set(VM_CC_OPTS)
list(APPEND VM_CC_OPTS -Oz -flto)
set(VM_LN_OPTS)
list(APPEND VM_LN_OPTS -Oz -flto -sEVAL_CTORS=2 -sEXPORTED_FUNCTIONS=['_strlen','_malloc','_free'] -sBINARYEN_EXTRA_PASSES='vacuum,simplify-locals,simplify-globals,optimize-instructions,optimize-stack-ir,fast-math,strip-dwarf,code-folding,duplicate-function-elimination,duplicate-import-elimination,rse,type-ssa')

# Definition to make Lua C APIs dynamically exported | __attribute__((used)) = EMSCRIPTEN_KEEPALIVE
set(EXPORTED_EXTERN "extern \"C\" __attribute__((used))")
target_compile_options(Luau.Compiler PUBLIC -U LUACODE_API -DLUACODE_API=${EXPORTED_EXTERN})
target_compile_options(Luau.VM PUBLIC -U LUA_API -DLUA_API=${EXPORTED_EXTERN})
target_compile_definitions(Luau.VM PUBLIC LUA_USE_LONGJMP=1)

# Compiler variant
add_executable(Luau.LuauWeb.Compiler)
target_sources(Luau.LuauWeb.Compiler PRIVATE src/Compiler.cpp)
target_link_libraries(Luau.LuauWeb.Compiler PUBLIC Luau.Compiler)

# VM variant
add_executable(Luau.LuauWeb.VM)
target_sources(Luau.LuauWeb.VM PRIVATE src/VM.cpp)
target_link_libraries(Luau.LuauWeb.VM PUBLIC Luau.VM)

# Compiler variant configuration
target_compile_features(Luau.LuauWeb.Compiler PUBLIC cxx_std_17)
target_compile_options(Luau.LuauWeb.Compiler PUBLIC ${COMPILER_CC_OPTS})
target_link_options(Luau.LuauWeb.Compiler PUBLIC ${COMPILER_LN_OPTS} ${EMSCRIPTEN_OPTS} -sEXPORT_NAME=LuauCompiler)

# VM variant configuration
target_compile_features(Luau.LuauWeb.VM PUBLIC cxx_std_17)
target_compile_options(Luau.LuauWeb.VM PUBLIC ${VM_CC_OPTS})
target_link_options(Luau.LuauWeb.VM PUBLIC ${VM_LN_OPTS} ${EMSCRIPTEN_OPTS} -sEXPORT_NAME=LuauVM)
