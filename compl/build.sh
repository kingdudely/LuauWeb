#!/bin/bash
mkdir build
cd build
emcmake cmake .. -DCMAKE_BUILD_TYPE=RelWithDebInfo
cmake --build . --target LuauWeb --config RelWithDebInfo -j 2
