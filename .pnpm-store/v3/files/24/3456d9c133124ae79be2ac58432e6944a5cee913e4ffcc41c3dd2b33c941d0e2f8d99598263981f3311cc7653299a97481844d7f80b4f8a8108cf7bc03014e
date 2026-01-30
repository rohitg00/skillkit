/**
A TransformStream that counts bytes passing through without modifying the data.

@example
```
import ByteCounterStream from 'byte-counter';

const counter = new ByteCounterStream();
const response = await fetch('https://example.com/large-file.zip');

await response.body
	.pipeThrough(counter)
	.pipeTo(new WritableStream({
		write(chunk) {
			// Process chunk
		},
		close() {
			console.log(`Downloaded ${counter.count} bytes`);
		}
	}));
```

@example
```
import ByteCounterStream from 'byte-counter';

const counter = new ByteCounterStream();
const encoder = new TextEncoder();

const writer = counter.writable.getWriter();
await writer.write(encoder.encode('Hello '));
await writer.write(encoder.encode('World'));
await writer.close();

console.log(counter.count);
//=> 11
```
*/
export default class ByteCounterStream implements ReadableWritablePair<Uint8Array, Uint8Array> {
	readonly readable: ReadableStream<Uint8Array>;
	readonly writable: WritableStream<Uint8Array>;

	/**
	The number of bytes that have passed through the stream.
	*/
	readonly count: number;
}

/**
Calculate the byte length of some data.

Strings are measured as UTF-8 bytes.

@param data - The data to measure.
@returns The byte length of the data.

@example
```
import {byteLength} from 'byte-counter';

byteLength('Hello');
//=> 5

byteLength('Hello 👋');
//=> 10

byteLength(new Uint8Array([1, 2, 3]));
//=> 3
```
*/
export function byteLength(data: string | ArrayBuffer | SharedArrayBuffer | ArrayBufferView): number;
