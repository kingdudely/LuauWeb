#!/bin/bash
set -e

git clone https://github.com/emscripten-core/emsdk.git $HOME/emsdk
cd $HOME/emsdk
./emsdk install latest
./emsdk activate latest

source $HOME/emsdk/emsdk_env.sh

rm -rf ./luau
git clone https://github.com/Roblox/luau.git ./luau

rm -rf ./build
mkdir -p build
cd build
emcmake cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --target LuauWeb --config Release -j$(nproc)
