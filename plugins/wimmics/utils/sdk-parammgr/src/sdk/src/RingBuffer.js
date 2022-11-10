/** @typedef {import('@webaudiomodules/api').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('./types').WamSDKBaseModuleScope} WamSDKBaseModuleScope */
/** @typedef {import('./types').TypedArrayConstructor} TypedArrayConstructor */
/** @typedef {import('./types').TypedArray} TypedArray */
/** @typedef {import('./types').RingBuffer} IRingBuffer */
/** @typedef {typeof import('./types').RingBuffer} RingBufferConstructor */

/**
 * @param {string} [moduleId]
 * @returns {RingBufferConstructor}
 */
const getRingBuffer = (moduleId) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;

	/**
	 * A Single Producer - Single Consumer thread-safe wait-free ring buffer.
	 * The producer and the consumer can be on separate threads, but cannot change roles,
	 * except with external synchronization. Adapted from https://github.com/padenot/ringbuf.js
	 * MPL-2.0 License (see RingBuffer_LICENSE.txt)
	 *
	 * @implements {IRingBuffer}
	 * @author padenot
	 */
	class RingBuffer {
		/**
		 * @param {number} capacity
		 * @param {TypedArrayConstructor} Type
		 */
		static getStorageForCapacity(capacity, Type) {
			if (!Type.BYTES_PER_ELEMENT) {
				throw new Error('Pass in a ArrayBuffer subclass');
			}
			const bytes = 8 + (capacity + 1) * Type.BYTES_PER_ELEMENT;
			return new SharedArrayBuffer(bytes);
		}

		/**
		 * `sab` is a SharedArrayBuffer with a capacity calculated by calling
		 * `getStorageForCapacity` with the desired capacity.
		 *
		 * @param {SharedArrayBuffer} sab
		 * @param {TypedArrayConstructor} Type
		 */
		constructor(sab, Type) {
			// eslint-disable-next-line no-prototype-builtins
			if (!Type.BYTES_PER_ELEMENT) {
				throw new Error('Pass a concrete typed array class as second argument');
			}

			// Maximum usable size is 1<<32 - type.BYTES_PER_ELEMENT bytes in the ring
			// buffer for this version, easily changeable.
			// -4 for the write ptr (uint32_t offsets)
			// -4 for the read ptr (uint32_t offsets)
			// capacity counts the empty slot to distinguish between full and empty.
			this._Type = Type;
			this._capacity = (sab.byteLength - 8) / Type.BYTES_PER_ELEMENT;
			this.buf = sab;
			this.write_ptr = new Uint32Array(this.buf, 0, 1);
			this.read_ptr = new Uint32Array(this.buf, 4, 1);
			this.storage = new Type(this.buf, 8, this._capacity);
		}

		/**
		 * Returns the type of the underlying ArrayBuffer for this RingBuffer. This
		 * allows implementing crude type checking.
		 */
		get type() {
			return this._Type.name;
		}

		/**
		 * Push bytes to the ring buffer. `elements` is a typed array of the same type
		 * as passed in the ctor, to be written to the queue.
		 * Returns the number of elements written to the queue.
		 *
		 * @param {TypedArray} elements
		 */
		push(elements) {
			const rd = Atomics.load(this.read_ptr, 0);
			const wr = Atomics.load(this.write_ptr, 0);

			if ((wr + 1) % this._storageCapacity() === rd) {
				// full
				return 0;
			}

			const toWrite = Math.min(this._availableWrite(rd, wr), elements.length);
			const firstPart = Math.min(this._storageCapacity() - wr, toWrite);
			const secondPart = toWrite - firstPart;

			this._copy(elements, 0, this.storage, wr, firstPart);
			this._copy(elements, firstPart, this.storage, 0, secondPart);

			// publish the enqueued data to the other side
			Atomics.store(
				this.write_ptr,
				0,
				(wr + toWrite) % this._storageCapacity(),
			);

			return toWrite;
		}

		/**
		 * Read `elements.length` elements from the ring buffer if `elements` is a typed
		 * array of the same type as passed in the ctor. If `elements` is an integer,
		 * pop and discard that many elements from the ring buffer.
		 * Returns the number of elements read from the queue, they are placed at the
		 * beginning of the array passed as parameter if `elements` is not an integer.
		 *
		 * @param {TypedArray | number} elements
		 */
		pop(elements) {
			const rd = Atomics.load(this.read_ptr, 0);
			const wr = Atomics.load(this.write_ptr, 0);

			if (wr === rd) {
				return 0;
			}

			const isArray = !Number.isInteger(elements);
			// @ts-ignore
			const toRead = Math.min(this._availableRead(rd, wr), isArray ? elements.length : elements);

			if (isArray) {
				const firstPart = Math.min(this._storageCapacity() - rd, toRead);
				const secondPart = toRead - firstPart;

				// @ts-ignore
				this._copy(this.storage, rd, elements, 0, firstPart);
				// @ts-ignore
				this._copy(this.storage, 0, elements, firstPart, secondPart);
			}
			Atomics.store(this.read_ptr, 0, (rd + toRead) % this._storageCapacity());

			return toRead;
		}

		/**
		 * True if the ring buffer is empty false otherwise. This can be late on the
		 * reader side: it can return true even if something has just been pushed.
		 */
		get empty() {
			const rd = Atomics.load(this.read_ptr, 0);
			const wr = Atomics.load(this.write_ptr, 0);

			return wr === rd;
		}

		/**
		 * True if the ring buffer is full, false otherwise. This can be late on the
		 * write side: it can return true when something has just been popped.
		 */
		get full() {
			const rd = Atomics.load(this.read_ptr, 0);
			const wr = Atomics.load(this.write_ptr, 0);

			return (wr + 1) % this._capacity !== rd;
		}

		/**
		 * The usable capacity for the ring buffer: the number of elements that can be
		 * stored.
		 */
		get capacity() {
			return this._capacity - 1;
		}

		/**
		 * Number of elements available for reading. This can be late, and report less
		 * elements that is actually in the queue, when something has just been
		 * enqueued.
		 */
		get availableRead() {
			const rd = Atomics.load(this.read_ptr, 0);
			const wr = Atomics.load(this.write_ptr, 0);
			return this._availableRead(rd, wr);
		}

		/**
		 * Number of elements available for writing. This can be late, and report less
		 * elements that is actually available for writing, when something has just
		 * been dequeued.
		 */
		get availableWrite() {
			const rd = Atomics.load(this.read_ptr, 0);
			const wr = Atomics.load(this.write_ptr, 0);
			return this._availableWrite(rd, wr);
		}

		// private methods //

		/**
		 * Number of elements available for reading, given a read and write pointer..
		 *
		 * @param {number} rd
		 * @param {number} wr
		 */
		_availableRead(rd, wr) {
			if (wr > rd) {
				return wr - rd;
			}
			return wr + this._storageCapacity() - rd;
		}

		/**
		 * Number of elements available from writing, given a read and write pointer.
		 *
		 * @param {number} rd
		 * @param {number} wr
		 */
		_availableWrite(rd, wr) {
			let rv = rd - wr - 1;
			if (wr >= rd) {
				rv += this._storageCapacity();
			}
			return rv;
		}

		/**
		 * The size of the storage for elements not accounting the space for the index.
		 */
		_storageCapacity() {
			return this._capacity;
		}

		/**
		 * Copy `size` elements from `input`, starting at offset `offset_input`, to
		 * `output`, starting at offset `offset_output`.
		 *
		 * @param {TypedArray} input
		 * @param {number} offsetInput
		 * @param {TypedArray} output
		 * @param {number} offsetOutput
		 * @param {number} size
		 */
		_copy(input, offsetInput, output, offsetOutput, size) {
			for (let i = 0; i < size; i++) {
				output[offsetOutput + i] = input[offsetInput + i];
			}
		}
	}

	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		/** @type {WamSDKBaseModuleScope} */
		const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);

		if (!ModuleScope.RingBuffer) ModuleScope.RingBuffer = RingBuffer;
	}

	return RingBuffer;
};

export default getRingBuffer;

/* Usage in main thread:
import executable from 'RingBuffer.js';
const RingBuffer = executable();
*/

/* Usage in audio thread:
// in main thread:
audioWorklet.addModule('RingBuffer.js');
// in audio thread
const { RingBuffer } = globalThis;
*/

/* Usage in audio thread with a build system:
// in main thread:
import getRingBuffer from 'RingBuffer.js';
const blob = new Blob([`(${getRingBuffer.toString()})(JSON.stringify(moduleId));`], { type: 'text/javascript' });
const url = window.URL.createObjectURL(blob);
audioWorklet.addModule(url);
// in audio thread
const { RingBuffer } = globalThis.webAudioModules.dependencies[moduleId];
*/
