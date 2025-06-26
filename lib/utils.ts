import type { CommonRuntime } from "./types.ts"

const _ENCODER = new TextEncoder()
const _DECODER = new TextDecoder()

const write_cstring = (Module: CommonRuntime, value: string): number => {
	const encoded = _ENCODER.encode(value)
	const ptr = Module._malloc(encoded.length + 1)

	Module.HEAPU8.set(encoded, ptr)
    Module.HEAPU8[ptr + encoded.length] = 0
	return ptr
}

const write_cstrings = (Module: CommonRuntime, strings: string[]): number => {
	if (strings.length < 1) {
		return 0
	}

	const array_ptr = Module._malloc((strings.length + 1) * 4)

	for (let idx = 0; idx < strings.length; idx += 1) {
		const encoded = _ENCODER.encode(strings[idx])
		const str_ptr = Module._malloc(encoded.length + 1)

		Module.HEAPU8.set(encoded, str_ptr)
        Module.HEAPU8[str_ptr + encoded.length] = 0
		Module.HEAP32[(array_ptr >> 2) + idx] = str_ptr
	}
	return array_ptr
}

const read_cstring = (Module: CommonRuntime, ptr: number, length: number): string => {
	const packed = new Uint8Array(Module.HEAPU8.buffer, ptr, length)
	return _DECODER.decode(packed)
}

const free_array = (Module: CommonRuntime, ptr: number) => {
    let position = 0

    while (Module.HEAP32[(ptr >> 2) + position] !== 0) {
        Module._free(Module.HEAP32[(ptr >> 2) + position])
        position += 1
    }
    Module._free(ptr)
}

export { read_cstring, write_cstring, write_cstrings, free_array }
