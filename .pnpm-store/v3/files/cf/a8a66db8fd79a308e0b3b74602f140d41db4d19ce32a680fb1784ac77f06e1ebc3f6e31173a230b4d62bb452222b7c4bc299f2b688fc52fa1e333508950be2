# noble-ed25519

Fastest 4KB JS implementation of ed25519 signatures.

- ✍️ [EDDSA](https://en.wikipedia.org/wiki/EdDSA) signatures compliant with [RFC8032](https://tools.ietf.org/html/rfc8032),
  FIPS 186-5
- 🪢 Consensus-friendly, compliant with [ZIP215](https://zips.z.cash/zip-0215)
- 🔖 SUF-CMA (strong unforgeability under chosen message attacks) and SBS (non-repudiation / exclusive ownership)
- 🪶 4KB gzipped, 400 lines of pure ESM, bundler-less code

The module is a sister project of [noble-curves](https://github.com/paulmillr/noble-curves),
focusing on smaller attack surface & better auditability.
Curves are drop-in replacement and have more features: Common.js, ristretto255, X25519, curve25519, ed25519ph. To upgrade from v1 to v2, see [Upgrading](#upgrading).

### This library belongs to _noble_ cryptography

> **noble-cryptography** — high-security, easily auditable set of contained cryptographic libraries and tools.

- Zero or minimal dependencies
- Highly readable TypeScript / JS code
- PGP-signed releases and transparent NPM builds with provenance
- Check out [homepage](https://paulmillr.com/noble/) & all libraries:
  [ciphers](https://github.com/paulmillr/noble-ciphers),
  [curves](https://github.com/paulmillr/noble-curves),
  [hashes](https://github.com/paulmillr/noble-hashes),
  [post-quantum](https://github.com/paulmillr/noble-post-quantum),
  4kb [secp256k1](https://github.com/paulmillr/noble-secp256k1) /
  [ed25519](https://github.com/paulmillr/noble-ed25519)

## Usage

> `npm install @noble/ed25519`

> `deno add jsr:@noble/ed25519`

> `deno doc jsr:@noble/ed25519` # command-line documentation

We support all major platforms and runtimes. For node.js <= 18 and React Native, additional polyfills are needed: see below.

```js
import * as ed from '@noble/ed25519';
(async () => {
  // Uint8Arrays or hex strings are accepted:
  // Uint8Array.from([0xde, 0xad, 0xbe, 0xef]) is equal to 'deadbeef'
  const privKey = ed.utils.randomPrivateKey();
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const pubKey = await ed.getPublicKeyAsync(privKey); // Sync methods below
  const signature = await ed.signAsync(message, privKey);
  const isValid = await ed.verifyAsync(signature, message, pubKey);
})();
```

### Enabling synchronous methods

Only async methods are available by default, to keep the library dependency-free.
To enable sync methods:

```ts
import { sha512 } from '@noble/hashes/sha512';
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
// Sync methods can be used now:
// ed.getPublicKey(privKey);
// ed.sign(msg, privKey);
// ed.verify(signature, msg, pubKey);
```

### React Native: polyfill getRandomValues and sha512

```ts
import 'react-native-get-random-values';
import { sha512 } from '@noble/hashes/sha512';
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) => Promise.resolve(ed.etc.sha512Sync(...m));
```

## API

There are 3 main methods:

- `getPublicKey(privateKey)` and `getPublicKeyAsync(privateKey)`
- `sign(message, privateKey)` and `signAsync(message, privateKey)`
- `verify(signature, message, publicKey)` and `verifyAsync(signature, message, publicKey)`

Functions accept Uint8Array. There are utilities which convert hex strings, utf8 strings or bigints to u8a.

### getPublicKey

```typescript
import * as ed from '@noble/ed25519';
(async () => {
  const privKeyA = ed.utils.hexToBytes(
    '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
  );
  const pubKeyA = ed.getPublicKey(privKeyA);

  const privKeyB = ed.utils.randomPrivateKey();
  const pubKeyB = await ed.getPublicKeyAsync(privKeyB);
  const privKey64Byte = ed.etc.concatBytes(privKeyB, pubKeyB);
  const pubKeyPoint = ed.ExtendedPoint.fromHex(pubKeyB);
  const pubKeyExt = ed.utils.getExtendedPublicKey(privKeyB);
})();
```

Generates 32-byte public key from 32-byte private key.

- Some libraries have 64-byte private keys - those are just priv+pub concatenated
- Use `ExtendedPoint.fromHex(publicKey)` if you want to convert hex / bytes into Point.
  It will use decompression algorithm 5.1.3 of RFC 8032.
- Use `utils.getExtendedPublicKey` if you need full SHA512 hash of seed

### sign

```ts
import * as ed from '@noble/ed25519';
(async () => {
  const privKey = ed.utils.hexToBytes(
    '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
  );
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const signature = ed.sign(message, privKey);

  const messageB = new TextEncoder().encode('hello noble');
  const signatureB = await ed.signAsync(messageB, privKey);
})();
```

Generates deterministic EdDSA signature.

Assumes unhashed `message`: it would be hashed by ed25519 internally.
For prehashed ed25519ph, switch to noble-curves.

### verify

```ts
import * as ed from '@noble/ed25519';
(async () => {
  const privKey = ed.utils.randomPrivateKey();
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const pubKey = await ed.getPublicKeyAsync(privKey);
  const signature = await ed.signAsync(message, privKey);

  const isValidA = ed.verify(signature, message, pubKey);

  const isValidB = await ed.verifyAsync(signature, message, pubKey);
  const isValidC = ed.verify(signature, message, pubKey, { zip215: false });
})();
```

Verifies EdDSA signature. Has SUF-CMA (strong unforgeability under chosen message attacks).
By default, follows ZIP215 [^1] and can be used in consensus-critical apps [^2].
`zip215: false` option switches verification criteria to strict
RFC8032 / FIPS 186-5 and provides non-repudiation with SBS (Strongly Binding Signatures) [^3].

### utils

A bunch of useful **utilities** are also exposed:

```typescript
const etc: {
  bytesToHex: (b: Bytes) => string;
  hexToBytes: (hex: string) => Bytes;
  concatBytes: (...arrs: Bytes[]) => Uint8Array;
  mod: (a: bigint, b?: bigint) => bigint;
  invert: (num: bigint, md?: bigint) => bigint;
  randomBytes: (len: number) => Bytes;
  sha512Async: (...messages: Bytes[]) => Promise<Bytes>;
  sha512Sync: Sha512FnSync;
};
const utils: {
  getExtendedPublicKeyAsync: (priv: Hex) => Promise<ExtK>;
  getExtendedPublicKey: (priv: Hex) => ExtK;
  precompute(p: Point, w?: number): Point;
  randomPrivateKey: () => Bytes; // Uses CSPRNG https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
};

class ExtendedPoint {
  // Elliptic curve point in Extended (x, y, z, t) coordinates.
  constructor(ex: bigint, ey: bigint, ez: bigint, et: bigint);
  static readonly BASE: Point;
  static readonly ZERO: Point;
  static fromAffine(point: AffinePoint): ExtendedPoint;
  static fromHex(hash: string);
  get x(): bigint;
  get y(): bigint;
  // Note: It does not check whether the `other` point is valid point on curve.
  add(other: ExtendedPoint): ExtendedPoint;
  equals(other: ExtendedPoint): boolean;
  isTorsionFree(): boolean; // Multiplies the point by curve order
  multiply(scalar: bigint): ExtendedPoint;
  subtract(other: ExtendedPoint): ExtendedPoint;
  toAffine(): Point;
  toRawBytes(): Uint8Array;
  toHex(): string; // Compact representation of a Point
}
// Curve params
ed25519.CURVE.p; // 2 ** 255 - 19
ed25519.CURVE.n; // 2 ** 252 + 27742317777372353535851937790883648493
ed25519.ExtendedPoint.BASE; // new ed25519.Point(Gx, Gy) where
// Gx=15112221349535400772501151409588531511454012693041857206046113283949847762202n
// Gy=46316835694926478169428394003475163141307993866256225615783033603165251855960n;
```

## Security

The module is production-ready.

We cross-test against sister project [noble-curves](https://github.com/paulmillr/noble-curves), which was audited and provides improved security.

- The current version has not been independently audited. It is a rewrite of v1, which has been audited by cure53 in Feb 2022:
  [PDF](https://cure53.de/pentest-report_ed25519.pdf).
- It's being fuzzed [in a separate repository](https://github.com/paulmillr/fuzzing)

If you see anything unusual: investigate and report.

### Constant-timeness

We're targetting algorithmic constant time. _JIT-compiler_ and _Garbage Collector_ make "constant time"
extremely hard to achieve [timing attack](https://en.wikipedia.org/wiki/Timing_attack) resistance
in a scripting language. Which means _any other JS library can't have
constant-timeness_. Even statically typed Rust, a language without GC,
[makes it harder to achieve constant-time](https://www.chosenplaintext.ca/open-source/rust-timing-shield/security)
for some cases. If your goal is absolute security, don't use any JS lib — including bindings to native ones.
Use low-level libraries & languages.

### Supply chain security

- **Commits** are signed with PGP keys, to prevent forgery. Make sure to verify commit signatures
- **Releases** are transparent and built on GitHub CI.
  Check out [attested checksums of single-file builds](https://github.com/paulmillr/noble-ed25519/attestations)
  and [provenance logs](https://github.com/paulmillr/noble-ed25519/actions/workflows/release.yml)
- **Rare releasing** is followed to ensure less re-audit need for end-users
- **Dependencies** are minimized and locked-down: any dependency could get hacked and users will be downloading malware with every install.
  - We make sure to use as few dependencies as possible
  - Automatic dep updates are prevented by locking-down version ranges; diffs are checked with `npm-diff`
- **Dev Dependencies** are disabled for end-users; they are only used to develop / build the source code

For this package, there are 0 dependencies; and a few dev dependencies:

- [noble-hashes](https://github.com/paulmillr/noble-hashes) provides cryptographic hashing functionality
- micro-bmark, micro-should and jsbt are used for benchmarking / testing / build tooling and developed by the same author
- prettier, fast-check and typescript are used for code quality / test generation / ts compilation. It's hard to audit their source code thoroughly and fully because of their size

### Randomness

We're deferring to built-in
[crypto.getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
which is considered cryptographically secure (CSPRNG).

In the past, browsers had bugs that made it weak: it may happen again.
Implementing a userspace CSPRNG to get resilient to the weakness
is even worse: there is no reliable userspace source of quality entropy.

### Quantum computers

Cryptographically relevant quantum computer, if built, will allow to
break elliptic curve cryptography (both ECDSA / EdDSA & ECDH) using Shor's algorithm.

Consider switching to newer / hybrid algorithms, such as SPHINCS+. They are available in
[noble-post-quantum](https://github.com/paulmillr/noble-post-quantum).

NIST prohibits classical cryptography (RSA, DSA, ECDSA, ECDH) [after 2035](https://nvlpubs.nist.gov/nistpubs/ir/2024/NIST.IR.8547.ipd.pdf). Australian ASD prohibits it [after 2030](https://www.cyber.gov.au/resources-business-and-government/essential-cyber-security/ism/cyber-security-guidelines/guidelines-cryptography).

## Speed

Benchmarks done with Apple M2 on macOS 13 with Node.js 20.

    getPublicKey(utils.randomPrivateKey()) x 9,173 ops/sec @ 109μs/op
    sign x 4,567 ops/sec @ 218μs/op
    verify x 994 ops/sec @ 1ms/op
    Point.fromHex decompression x 16,164 ops/sec @ 61μs/op

Compare to alternative implementations:

    tweetnacl@1.0.3 getPublicKey x 1,808 ops/sec @ 552μs/op ± 1.64%
    tweetnacl@1.0.3 sign x 651 ops/sec @ 1ms/op
    ristretto255@0.1.2 getPublicKey x 640 ops/sec @ 1ms/op ± 1.59%
    sodium-native#sign x 83,654 ops/sec @ 11μs/op

## Upgrading

noble-ed25519 v2 features improved security and smaller attack surface.
The goal of v2 is to provide minimum possible JS library which is safe and fast.

That means the library was reduced 4x, to just over 300 lines. In order to
achieve the goal, **some features were moved** to
[noble-curves](https://github.com/paulmillr/noble-curves), which is
even safer and faster drop-in replacement library with same API.
Switch to curves if you intend to keep using these features:

- x25519 / curve25519 / getSharedSecret
- ristretto255 / RistrettoPoint
- Using `utils.precompute()` for non-base point
- Support for environments which don't support bigint literals
- Common.js support
- Support for node.js 18 and older without [shim](#usage)

Other changes for upgrading from @noble/ed25519 1.7 to 2.0:

- Methods are now sync by default; use `getPublicKeyAsync`, `signAsync`, `verifyAsync` for async versions
- `bigint` is no longer allowed in `getPublicKey`, `sign`, `verify`. Reason: ed25519 is LE, can lead to bugs
- `Point` (2d xy) has been changed to `ExtendedPoint` (xyzt)
- `Signature` was removed: just use raw bytes or hex now
- `utils` were split into `utils` (same api as in noble-curves) and
  `etc` (`sha512Sync` and others)

## Contributing & testing

- `npm install && npm run build && npm test` will build the code and run tests.
- `npm run bench` will run benchmarks, which may need their deps first (`npm run bench:install`)
- `npm run loc` will count total output size, important to be less than 4KB

Check out [github.com/paulmillr/guidelines](https://github.com/paulmillr/guidelines)
for general coding practices and rules.

See [paulmillr.com/noble](https://paulmillr.com/noble/)
for useful resources, articles, documentation and demos
related to the library.

## License

MIT (c) 2019 Paul Miller [(https://paulmillr.com)](https://paulmillr.com), see LICENSE file.

[^1]: https://zips.z.cash/zip-0215

[^2]: https://hdevalence.ca/blog/2020-10-04-its-25519am

[^3]: https://eprint.iacr.org/2020/1244
