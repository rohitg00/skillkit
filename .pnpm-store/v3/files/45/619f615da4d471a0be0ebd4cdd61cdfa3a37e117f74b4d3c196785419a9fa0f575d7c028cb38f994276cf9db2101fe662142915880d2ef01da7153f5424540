import {byteLength} from './utilities.js';

export default class ByteCounterStream {
	#count = 0;

	// eslint-disable-next-line @stylistic/lines-between-class-members
	#stream = new TransformStream({
		transform: (chunk, controller) => {
			this.#count += byteLength(chunk);
			controller.enqueue(chunk);
		},
	});

	get readable() {
		return this.#stream.readable;
	}

	get writable() {
		return this.#stream.writable;
	}

	get count() {
		return this.#count;
	}
}

export {byteLength} from './utilities.js';
