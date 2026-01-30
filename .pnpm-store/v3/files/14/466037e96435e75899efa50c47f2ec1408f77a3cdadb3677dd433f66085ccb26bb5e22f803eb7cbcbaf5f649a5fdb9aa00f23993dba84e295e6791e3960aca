import {Transform as TransformStream, PassThrough as PassThroughStream} from 'node:stream';
import zlib from 'node:zlib';
import mimicResponse from 'mimic-response';

// Detect zstd support (available in Node.js >= 22.15.0)
const supportsZstd = typeof zlib.createZstdDecompress === 'function';

export default function decompressResponse(response) {
	const contentEncoding = (response.headers['content-encoding'] || '').toLowerCase();
	const supportedEncodings = ['gzip', 'deflate', 'br'];
	if (supportsZstd) {
		supportedEncodings.push('zstd');
	}

	if (!supportedEncodings.includes(contentEncoding)) {
		return response;
	}

	let isEmpty = true;

	// Clone headers to avoid modifying the original response headers
	const headers = {...response.headers};

	const finalStream = new PassThroughStream({
		autoDestroy: false,
	});

	// Only destroy response on error, not on normal completion
	finalStream.once('error', () => {
		response.destroy();
	});

	function handleContentEncoding(data) {
		let decompressStream;

		if (contentEncoding === 'zstd') {
			decompressStream = zlib.createZstdDecompress();
		} else if (contentEncoding === 'br') {
			decompressStream = zlib.createBrotliDecompress();
		} else if (contentEncoding === 'deflate' && data.length > 0 && (data[0] & 0x08) === 0) { // eslint-disable-line no-bitwise
			decompressStream = zlib.createInflateRaw();
		} else {
			decompressStream = zlib.createUnzip();
		}

		decompressStream.once('error', error => {
			if (isEmpty && !response.readable) {
				finalStream.end();
				return;
			}

			finalStream.destroy(error);
		});

		checker.pipe(decompressStream).pipe(finalStream);
	}

	const checker = new TransformStream({
		transform(data, _encoding, callback) {
			if (isEmpty === false) {
				callback(null, data);
				return;
			}

			isEmpty = false;

			handleContentEncoding(data);

			callback(null, data);
		},

		flush(callback) {
			if (isEmpty) {
				finalStream.end();
			}

			callback();
		},
	});

	delete headers['content-encoding'];
	delete headers['content-length'];
	finalStream.headers = headers;

	mimicResponse(response, finalStream);

	response.pipe(checker);

	return finalStream;
}
