#!/bin/bash
mkdir -p build
cd build
emcmake cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --target LuauWeb --config Release -j$(nproc)
