import {type IncomingMessage, type IncomingHttpHeaders} from 'node:http';

export type UncompressedIncomingHttpHeaders = {
	'content-encoding'?: never;
} & IncomingHttpHeaders;

export type UncompressedIncomingMessage = {
	headers: UncompressedIncomingHttpHeaders;
} & IncomingMessage;

/**
Decompress a HTTP response if needed.

@param response - The HTTP incoming stream with compressed data.
@returns The decompressed HTTP response stream.

@example
```
import http from 'node:http';
import decompressResponse from 'decompress-response';

http.get('https://sindresorhus.com', response => {
	response = decompressResponse(response);
});
```
*/
export default function decompressResponse(response: IncomingMessage): UncompressedIncomingMessage;
