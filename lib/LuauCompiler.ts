import LuauCompilerModule from "../dist/LuauWeb.Compiler.js"

import { write_cstring, write_cstrings, free_array } from "./utils.ts"
import type { LuauCompileOptions, LuauCompilerRuntime } from "./types.ts"

const _ENCODER = new TextEncoder()

const DEFAULT_COMPILE_OPTIONS: LuauCompileOptions = {
	OptimizationLevel: 1,
	DebugLevel: 1,
	TypeInfoLevel: 1,
	CoverageLevel: 1,

	VectorLibName: "vector",
	VectorLibConstructor: "create",
	VectorType: "vector",
}

const [ luau_compile ] = await LuauCompilerModule().then((_Module) => {
	const Module = _Module as LuauCompilerRuntime

	const _memfree = Module["_free"]
	const _malloc = Module["_malloc"]

	const _luau_compile = Module["_luau_compile"]

	const create_luau_options = (options: LuauCompileOptions): [number, () => void] => {
		// lua_compileOptions struct (from: luau/Compiler/include/luacode.h)
		const option_ptr = _malloc(52)
		const vectorlibname_ptr = write_cstring(
			Module,
			(options.VectorLibName || DEFAULT_COMPILE_OPTIONS.VectorLibName) as string,
		)
		const vectorlibcons_ptr = write_cstring(
			Module,
			(options.VectorLibConstructor || DEFAULT_COMPILE_OPTIONS.VectorLibConstructor) as string,
		)
		const vectortype_ptr = write_cstring(
			Module,
			(options.VectorType || DEFAULT_COMPILE_OPTIONS.VectorType) as string,
		)

		const mutable_globals_ptrarr = write_cstrings(Module, options.MutableGlobals || [])
		const disabledbuiltins_ptrarr = write_cstrings(Module, options.DisabledBuiltins || [])

		Module.HEAP32[(option_ptr >> 2) + 0] = options.OptimizationLevel // int
		Module.HEAP32[(option_ptr >> 2) + 1] = options.DebugLevel // int
		Module.HEAP32[(option_ptr >> 2) + 2] = options.TypeInfoLevel // int
		Module.HEAP32[(option_ptr >> 2) + 3] = options.CoverageLevel // int
		Module.HEAP32[(option_ptr >> 2) + 4] = vectorlibname_ptr // const char*
		Module.HEAP32[(option_ptr >> 2) + 5] = vectorlibcons_ptr // const char*
		Module.HEAP32[(option_ptr >> 2) + 6] = vectortype_ptr // const char*
		Module.HEAP32[(option_ptr >> 2) + 7] = mutable_globals_ptrarr // const char* const*
		Module.HEAP32[(option_ptr >> 2) + 8] = 0 // const char* const* userdataTypes;
		Module.HEAP32[(option_ptr >> 2) + 9] = 0 // const char* const* librariesWithKnownMembers;
		Module.HEAP32[(option_ptr >> 2) + 10] = 0 // lua_LibraryMemberTypeCallback libraryMemberTypeCb;
		Module.HEAP32[(option_ptr >> 2) + 11] = 0 // lua_LibraryMemberConstantCallback libraryMemberConstantCb;
		Module.HEAP32[(option_ptr >> 2) + 12] = disabledbuiltins_ptrarr // const char* const*

		const _free_func = () => {
			_memfree(option_ptr)
			_memfree(vectorlibname_ptr)
			_memfree(vectorlibcons_ptr)
			_memfree(vectortype_ptr)
			free_array(Module, mutable_globals_ptrarr)
			free_array(Module, disabledbuiltins_ptrarr)
		}
		return [option_ptr, _free_func]
	}

	const luau_compile = (source: string, options: LuauCompileOptions): [boolean, Uint8Array] => {
		const [option_ptr, option_free] = create_luau_options(options)

		const source_length = _ENCODER.encode(source).length
		const src_ptr = write_cstring(Module, source)
		const bc_size_ptr = _malloc(8)

		const bytecode_ptr = _luau_compile(src_ptr, source_length, option_ptr, bc_size_ptr)
		const bytecode_size = Module.HEAP32[bc_size_ptr >> 2]
		const bytecode = (new Uint8Array(Module.HEAPU8.buffer, bytecode_ptr, bytecode_size)).slice()
		const compile_success = (bytecode[0] != 0)

		option_free()
		_memfree(src_ptr)
		_memfree(bc_size_ptr)
		_memfree(bytecode_ptr)
		return [compile_success, bytecode]
	}

	return [luau_compile]
})

export abstract class LuauCompiler {
	public static Compile(source: string, options: LuauCompileOptions = DEFAULT_COMPILE_OPTIONS): [boolean, Uint8Array] {
		return luau_compile(source, options)
	}
}
