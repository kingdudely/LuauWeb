#include <string>
#include "luacode.h"
#include "lua.h"
#include "lualib.h"

int main() {
    std::string src = ""; // print'Hello World'
    size_t bcs;
    luau_compile(src.c_str(), src.size(), nullptr, &bcs);

    lua_State* l = luaL_newstate();
    lua_close(l);

    return 0;
}
