import {Transform} from 'node:stream';
import {byteLength} from './utilities.js';

export default class ByteCounterStream extends Transform {
	#count = 0;

	get count() {
		return this.#count;
	}

	_transform(chunk, encoding, callback) {
		this.#count += byteLength(chunk);
		callback(null, chunk);
	}
}
