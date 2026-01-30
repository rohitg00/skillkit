import {type Transform} from 'node:stream';

/**
A Transform stream that counts bytes passing through without modifying the data.

@example
```
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

@example
```
import ByteCounterStream from 'byte-counter/node';

const counter = new ByteCounterStream();
const encoder = new TextEncoder();

counter.write(encoder.encode('Hello '));
counter.write(encoder.encode('World'));
counter.end();

console.log(counter.count);
//=> 11
```
*/
export default class ByteCounterStream extends Transform {
	/**
	The number of bytes that have passed through the stream.
	*/
	readonly count: number;
}
