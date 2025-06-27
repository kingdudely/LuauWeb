type PointerType = "i8" | "i16" | "i32" | "i64" | "float" | "double" | "*"

export interface CommonRuntime {
	HEAPU8: Uint8Array
	HEAP32: Int32Array
	getValue: (ptr: string, type: PointerType) => number
	setValue: (ptr: string, value: number | bigint, type: PointerType) => void

	_strlen: (string_ptr: number) => number
	_free: (ptr: number) => void
	_malloc: (size: number) => number
}

interface LuauCompilerDefinitions {
	_luau_compile: (source_ptr: number, source_len: number, option_ptr: number, bytecode_size_ptr: number) => number
}

export type LuauCompilerRuntime = CommonRuntime & LuauCompilerDefinitions

type LuauOptimizationLevel = 0 | 1 | 2
type LuauDebugLevel = 0 | 1 | 2
type LuauTypeInfoLevel = 0 | 1
type LuauCoverageLevel = 0 | 1 | 2

export type LuauCompileOptions = {
	OptimizationLevel: LuauOptimizationLevel
	DebugLevel: LuauDebugLevel
	TypeInfoLevel: LuauTypeInfoLevel
	CoverageLevel: LuauCoverageLevel

	VectorLibName?: string
	VectorLibConstructor?: string
	VectorType?: string

	MutableGlobals?: string[]
	DisabledBuiltins?: string[]
}
