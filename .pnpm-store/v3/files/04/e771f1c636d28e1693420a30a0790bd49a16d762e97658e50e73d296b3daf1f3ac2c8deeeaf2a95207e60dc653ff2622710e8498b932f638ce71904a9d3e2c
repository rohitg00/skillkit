/*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
/**
 * 4KB JS implementation of ed25519 EdDSA signatures.
 * Compliant with RFC8032, FIPS 186-5 & ZIP215.
 * @module
 * @example
 * ```js
import * as ed from '@noble/ed25519';
(async () => {
  const privKey = ed.utils.randomPrivateKey();
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const pubKey = await ed.getPublicKeyAsync(privKey); // Sync methods are also present
  const signature = await ed.signAsync(message, privKey);
  const isValid = await ed.verifyAsync(signature, message, pubKey);
})();
```
 */
/**
 * Curve params. ed25519 is twisted edwards curve. Equation is −x² + y² = -a + dx²y².
 * * P = `2n**255n - 19n` // field over which calculations are done
 * * N = `2n**252n + 27742317777372353535851937790883648493n` // group order, amount of curve points
 * * h = 8 // cofactor
 * * a = `Fp.create(BigInt(-1))` // equation param
 * * d = -121665/121666 a.k.a. `Fp.neg(121665 * Fp.inv(121666))` // equation param
 * * Gx, Gy are coordinates of Generator / base point
 */
declare const ed25519_CURVE: EdwardsOpts;
/** Alias to Uint8Array. */
export type Bytes = Uint8Array;
/** Hex-encoded string or Uint8Array. */
export type Hex = Bytes | string;
/** Edwards elliptic curve options. */
export type EdwardsOpts = Readonly<{
    p: bigint;
    n: bigint;
    h: bigint;
    a: bigint;
    d: bigint;
    Gx: bigint;
    Gy: bigint;
}>;
/** WebCrypto OS-level CSPRNG (random number generator). Will throw when not available. */
declare const randomBytes: (len?: number) => Bytes;
/** Point in 2d xy affine coordinates. */
export interface AffinePoint {
    x: bigint;
    y: bigint;
}
/** Point in XYZT extended coordinates. */
declare class Point {
    static BASE: Point;
    static ZERO: Point;
    readonly ex: bigint;
    readonly ey: bigint;
    readonly ez: bigint;
    readonly et: bigint;
    constructor(ex: bigint, ey: bigint, ez: bigint, et: bigint);
    static fromAffine(p: AffinePoint): Point;
    /** RFC8032 5.1.3: Uint8Array to Point. */
    static fromBytes(hex: Bytes, zip215?: boolean): Point;
    /** Checks if the point is valid and on-curve. */
    assertValidity(): this;
    /** Equality check: compare points P&Q. */
    equals(other: Point): boolean;
    is0(): boolean;
    /** Flip point over y coordinate. */
    negate(): Point;
    /** Point doubling. Complete formula. Cost: `4M + 4S + 1*a + 6add + 1*2`. */
    double(): Point;
    /** Point addition. Complete formula. Cost: `8M + 1*k + 8add + 1*2`. */
    add(other: Point): Point;
    /**
     * Point-by-scalar multiplication. Scalar must be in range 1 <= n < CURVE.n.
     * Uses {@link wNAF} for base point.
     * Uses fake point to mitigate side-channel leakage.
     * @param n scalar by which point is multiplied
     * @param safe safe mode guards against timing attacks; unsafe mode is faster
     */
    multiply(n: bigint, safe?: boolean): Point;
    /** Convert point to 2d xy affine point. (X, Y, Z) ∋ (x=X/Z, y=Y/Z) */
    toAffine(): AffinePoint;
    toBytes(): Bytes;
    toHex(): string;
    clearCofactor(): Point;
    isSmallOrder(): boolean;
    isTorsionFree(): boolean;
    static fromHex(hex: Hex, zip215?: boolean): Point;
    get x(): bigint;
    get y(): bigint;
    toRawBytes(): Bytes;
}
/** etc.sha512Sync should conform to the interface. */
export type Sha512FnSync = undefined | ((...messages: Bytes[]) => Bytes);
type ExtK = {
    head: Bytes;
    prefix: Bytes;
    scalar: bigint;
    point: Point;
    pointBytes: Bytes;
};
/** Creates 32-byte ed25519 public key from 32-byte private key. Async. */
declare const getPublicKeyAsync: (priv: Hex) => Promise<Bytes>;
/** Creates 32-byte ed25519 public key from 32-byte private key. To use, set `etc.sha512Sync` first. */
declare const getPublicKey: (priv: Hex) => Bytes;
/**
 * Signs message (NOT message hash) using private key. Async.
 * Follows RFC8032 5.1.6.
 */
declare const signAsync: (msg: Hex, privKey: Hex) => Promise<Bytes>;
/**
 * Signs message (NOT message hash) using private key. To use, set `hashes.sha512` first.
 * Follows RFC8032 5.1.6.
 */
declare const sign: (msg: Hex, privKey: Hex) => Bytes;
/** Verification options. zip215: true (default) follows ZIP215 spec. false would follow RFC8032. */
export type VerifOpts = {
    zip215?: boolean;
};
/** Verifies signature on message and public key. Async. Follows RFC8032 5.1.7. */
declare const verifyAsync: (s: Hex, m: Hex, p: Hex, opts?: VerifOpts) => Promise<boolean>;
/** Verifies signature on message and public key. To use, set `hashes.sha512` first. Follows RFC8032 5.1.7. */
declare const verify: (s: Hex, m: Hex, p: Hex, opts?: VerifOpts) => boolean;
/** Math, hex, byte helpers. Not in `utils` because utils share API with noble-curves. */
declare const etc: {
    sha512Async: (...messages: Bytes[]) => Promise<Bytes>;
    sha512Sync: Sha512FnSync;
    bytesToHex: (b: Bytes) => string;
    hexToBytes: (hex: string) => Bytes;
    concatBytes: (...arrs: Bytes[]) => Uint8Array;
    mod: (a: bigint, b?: bigint) => bigint;
    invert: (num: bigint, md: bigint) => bigint;
    randomBytes: typeof randomBytes;
};
/** ed25519-specific key utilities. */
declare const utils: {
    getExtendedPublicKeyAsync: (priv: Hex) => Promise<ExtK>;
    getExtendedPublicKey: (priv: Hex) => ExtK;
    randomPrivateKey: () => Bytes;
    precompute: (w?: number, p?: Point) => Point;
};
export { ed25519_CURVE as CURVE, etc, Point as ExtendedPoint, getPublicKey, getPublicKeyAsync, Point, sign, signAsync, utils, verify, verifyAsync, };
