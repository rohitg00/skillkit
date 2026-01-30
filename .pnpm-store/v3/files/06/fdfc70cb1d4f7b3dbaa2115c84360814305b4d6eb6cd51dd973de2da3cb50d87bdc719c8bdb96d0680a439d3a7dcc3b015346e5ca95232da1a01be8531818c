# byte-counter

> Count bytes passing through a stream

A transform stream that counts bytes passing through without modifying the data. Useful for tracking data transfer size, monitoring progress, or validating `content-length` headers.

The main export uses [Web Streams](https://developer.mozilla.org/docs/Web/API/Streams_API). For Node.js streams, use the `/node` subexport.

## Install

```sh
npm install byte-counter
```

## Usage

### Web Streams (default)

```js
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

```js
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

## API

### ByteCounterStream

A [`TransformStream`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream) that counts bytes passing through without modifying the data.

#### count

Type: `number` <sup>(read-only)</sup>

The number of bytes that have passed through the stream.

### byteLength(data)

Calculate the byte length of some data.

Strings are measured as UTF-8 bytes.

```js
import {byteLength} from 'byte-counter';

byteLength('Hello');
//=> 5

byteLength('Hello 👋');
//=> 10

byteLength(new Uint8Array([1, 2, 3]));
//=> 3
```

#### data

Type: `string | Uint8Array | ArrayBuffer | SharedArrayBuffer | ArrayBufferView`

The data to measure.

Returns: `number` - The byte length of the data.

### ByteCounterStream (`byte-counter/node`)

A Node.js [`Transform` stream](https://nodejs.org/api/stream.html#class-streamtransform) that counts bytes passing through without modifying the data.

```js
import fs from 'node:fs';
import ByteCounterStream from 'byte-counter/node';

const counter = new ByteCounterStream();

fs.createReadStream('file.txt')
	.pipe(counter)
	.pipe(fs.createWriteStream('output.txt'))
	.on('finish', () => {
		console.log(`Transferred ${counter.count} bytes`);
	});
```

```js
import ByteCounterStream from 'byte-counter/node';

const counter = new ByteCounterStream();
const encoder = new TextEncoder();

counter.write(encoder.encode('Hello '));
counter.write(encoder.encode('World'));
counter.end();

console.log(counter.count);
//=> 11
```

#### count

Type: `number` <sup>(read-only)</sup>

The number of bytes that have passed through the stream.
