import * as ed25519 from '@noble/ed25519';
import { x25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { randomBytes } from '@noble/ciphers/webcrypto';

export interface PeerKeypair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  fingerprint: string;
}

export interface SerializedIdentity {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
}

export class PeerIdentity {
  private keypair: PeerKeypair;

  private constructor(keypair: PeerKeypair) {
    this.keypair = keypair;
  }

  static async generate(): Promise<PeerIdentity> {
    const privateKey = randomBytes(32);
    const publicKey = await ed25519.getPublicKeyAsync(privateKey);
    const fingerprint = PeerIdentity.computeFingerprint(publicKey);

    return new PeerIdentity({
      publicKey,
      privateKey,
      fingerprint,
    });
  }

  static async fromPrivateKey(privateKey: Uint8Array): Promise<PeerIdentity> {
    if (privateKey.length !== 32) {
      throw new Error('Private key must be 32 bytes');
    }

    const publicKey = await ed25519.getPublicKeyAsync(privateKey);
    const fingerprint = PeerIdentity.computeFingerprint(publicKey);

    return new PeerIdentity({
      publicKey,
      privateKey,
      fingerprint,
    });
  }

  static fromSerialized(data: SerializedIdentity): PeerIdentity {
    const publicKey = hexToBytes(data.publicKey);
    const privateKey = hexToBytes(data.privateKey);
    const fingerprint = data.fingerprint;

    const computed = PeerIdentity.computeFingerprint(publicKey);
    if (computed !== fingerprint) {
      throw new Error('Fingerprint mismatch - corrupted identity');
    }

    return new PeerIdentity({
      publicKey,
      privateKey,
      fingerprint,
    });
  }

  static computeFingerprint(publicKey: Uint8Array): string {
    const hash = sha256(publicKey);
    return bytesToHex(hash.slice(0, 8));
  }

  static async verify(
    signature: Uint8Array,
    message: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> {
    try {
      return await ed25519.verifyAsync(signature, message, publicKey);
    } catch {
      return false;
    }
  }

  static async verifyHex(
    signatureHex: string,
    messageHex: string,
    publicKeyHex: string
  ): Promise<boolean> {
    try {
      const signature = hexToBytes(signatureHex);
      const message = hexToBytes(messageHex);
      const publicKey = hexToBytes(publicKeyHex);
      return await PeerIdentity.verify(signature, message, publicKey);
    } catch {
      return false;
    }
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return await ed25519.signAsync(message, this.keypair.privateKey);
  }

  async signString(message: string): Promise<string> {
    const messageBytes = new TextEncoder().encode(message);
    const signature = await this.sign(messageBytes);
    return bytesToHex(signature);
  }

  async signObject(obj: object): Promise<string> {
    const message = JSON.stringify(obj);
    return await this.signString(message);
  }

  deriveSharedSecret(peerPublicKey: Uint8Array): Uint8Array {
    const x25519PrivateKey = this.keypair.privateKey;
    return x25519.scalarMult(x25519PrivateKey, peerPublicKey);
  }

  deriveSharedSecretHex(peerPublicKeyHex: string): Uint8Array {
    const peerPublicKey = hexToBytes(peerPublicKeyHex);
    return this.deriveSharedSecret(peerPublicKey);
  }

  serialize(): SerializedIdentity {
    return {
      publicKey: bytesToHex(this.keypair.publicKey),
      privateKey: bytesToHex(this.keypair.privateKey),
      fingerprint: this.keypair.fingerprint,
    };
  }

  get publicKey(): Uint8Array {
    return this.keypair.publicKey;
  }

  get publicKeyHex(): string {
    return bytesToHex(this.keypair.publicKey);
  }

  get fingerprint(): string {
    return this.keypair.fingerprint;
  }

  toJSON(): { publicKey: string; fingerprint: string } {
    return {
      publicKey: this.publicKeyHex,
      fingerprint: this.fingerprint,
    };
  }
}
