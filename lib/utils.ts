import type { CommonRuntime } from "./types.ts"

const _ENCODER = new TextEncoder()

const write_cstring = (Module: CommonRuntime, value: string): number => {
	const encoded = _ENCODER.encode(value + "\0")
	const ptr = Module._malloc(encoded.length + 1) * 8

	Module.HEAPU8.set(encoded, ptr)
	return ptr
}

const write_cstrings = (Module: CommonRuntime, strings: string[]): number => {
	if (strings.length < 1) {
		return 0
	}

	const array_ptr = Module._malloc((strings.length + 1) * 4)

	for (let idx = 0; idx < strings.length; idx += 1) {
		const value = _ENCODER.encode(strings[idx] + "\0")
		const str_ptr = Module._malloc(value.length + 1)

		Module.HEAPU8.set(value, str_ptr)
		Module.HEAP32[(array_ptr >> 2) + idx] = str_ptr
	}
	return array_ptr
}

const read_cstring = (Module: CommonRuntime, ptr: number, length: number): string => {
	const result = new Uint8Array(Module.HEAPU8.buffer, ptr, length)
	return String.fromCharCode(...result)
}

export { read_cstring, write_cstring, write_cstrings }
