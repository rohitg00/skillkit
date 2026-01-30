# bun-webgpu

WebGPU ([Dawn](https://dawn.googlesource.com/dawn)) FFI bindings for Bun.

## Usage

```ts
import { setupGlobals } from 'bun-webgpu';

setupGlobals();

const adapter = navigator.gpu.requestAdapter();
const device = await adapter?.requestDevice();

// ... use WebGPU ...
```

Find out more about [WebGPU types here](https://gpuweb.github.io/types/).


## Building

_Note:_ There are prebuilt binaries in the pipeline artifacts.

### Prerequisites

*   **Bun**: Ensure you have BunJS installed. (https://bun.sh)
*   **Zig**: The native components of this library are written in Zig. Ensure Zig is installed and available in your PATH. (https://ziglang.org/learn/getting-started/)
*   **Pre-built Dawn Libraries**: This project relies on pre-built Dawn libraries.
    *   See [packages/bun-webgpu/dawn/README.md](https://github.com/kommander/bun-webgpu/blob/HEAD/dawn/README.md) for details on how to download the required Dawn shared libraries.
    * Basically just run `bun run ./dawn/download_artifacts.ts`

### Building the FFI Liberary

The `package.json` includes scripts to build the native library components.

*   `build:dev`
*   `build:prod`

## Conformance Test Suite (CTS)

To run the CTS, build the library first, then run the tests:

```bash
./run-cts.sh 'webgpu:api,operation,adapter,requestDevice:always_returns_device:*'
```

Run all webgpu tests for example with `./run-cts.sh 'webgpu:*'`

Current results for `webgpu:api,*` are:
```
** Summary **
Passed  w/o warnings = 39994 / 51160 =  78.17%
Passed with warnings =     0 / 51160 =   0.00%
Skipped              =  8290 / 51160 =  16.20%
Failed               =  2876 / 51160 =   5.62%
```

## Testing

To run tests, build the library first, then run the tests:

```bash
bun test
```
