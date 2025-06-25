#!/bin/bash
mkdir build
cd build
emcmake cmake .. -DCMAKE_BUILD_TYPE=RelWithDebInfo
cmake --build . --target Luau.LuauWeb.Compiler Luau.LuauWeb.VM --config RelWithDebInfo -j 2
