import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { randomBytes } from '@noble/ciphers/webcrypto';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { x25519 } from '@noble/curves/ed25519';

export interface EncryptedMessage {
  nonce: string;
  ciphertext: string;
}

export interface PublicKeyEncryptedMessage {
  ephemeralPublicKey: string;
  nonce: string;
  ciphertext: string;
}

export class MessageEncryption {
  private key: Uint8Array;

  constructor(sharedSecret: Uint8Array) {
    this.key = hkdf(sha256, sharedSecret, undefined, 'skillkit-mesh-v1', 32);
  }

  encrypt(plaintext: string | Uint8Array): EncryptedMessage {
    const nonce = randomBytes(24);
    const data =
      typeof plaintext === 'string'
        ? new TextEncoder().encode(plaintext)
        : plaintext;

    const cipher = xchacha20poly1305(this.key, nonce);
    const ciphertext = cipher.encrypt(data);

    return {
      nonce: bytesToHex(nonce),
      ciphertext: bytesToHex(ciphertext),
    };
  }

  decrypt(encrypted: EncryptedMessage): Uint8Array {
    const nonce = hexToBytes(encrypted.nonce);
    const ciphertext = hexToBytes(encrypted.ciphertext);

    const cipher = xchacha20poly1305(this.key, nonce);
    return cipher.decrypt(ciphertext);
  }

  decryptToString(encrypted: EncryptedMessage): string {
    const plaintext = this.decrypt(encrypted);
    return new TextDecoder().decode(plaintext);
  }

  decryptToObject<T = unknown>(encrypted: EncryptedMessage): T {
    const plaintext = this.decryptToString(encrypted);
    return JSON.parse(plaintext) as T;
  }

  encryptObject(obj: unknown): EncryptedMessage {
    return this.encrypt(JSON.stringify(obj));
  }

  static fromSharedSecret(sharedSecret: Uint8Array): MessageEncryption {
    return new MessageEncryption(sharedSecret);
  }
}

export class PublicKeyEncryption {
  static encrypt(
    message: Uint8Array,
    recipientPublicKey: Uint8Array
  ): PublicKeyEncryptedMessage {
    const ephemeralPrivateKey = randomBytes(32);
    const ephemeralPublicKey = x25519.scalarMultBase(ephemeralPrivateKey);
    const sharedSecret = x25519.scalarMult(ephemeralPrivateKey, recipientPublicKey);
    const key = hkdf(sha256, sharedSecret, undefined, 'skillkit-mesh-pk-v1', 32);
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(key, nonce);
    const ciphertext = cipher.encrypt(message);

    return {
      ephemeralPublicKey: bytesToHex(ephemeralPublicKey),
      nonce: bytesToHex(nonce),
      ciphertext: bytesToHex(ciphertext),
    };
  }

  static encryptString(
    message: string,
    recipientPublicKey: Uint8Array
  ): PublicKeyEncryptedMessage {
    const messageBytes = new TextEncoder().encode(message);
    return PublicKeyEncryption.encrypt(messageBytes, recipientPublicKey);
  }

  static encryptStringHex(
    message: string,
    recipientPublicKeyHex: string
  ): PublicKeyEncryptedMessage {
    const recipientPublicKey = hexToBytes(recipientPublicKeyHex);
    return PublicKeyEncryption.encryptString(message, recipientPublicKey);
  }

  static decrypt(
    encrypted: PublicKeyEncryptedMessage,
    recipientPrivateKey: Uint8Array
  ): Uint8Array {
    const ephemeralPublicKey = hexToBytes(encrypted.ephemeralPublicKey);
    const nonce = hexToBytes(encrypted.nonce);
    const ciphertext = hexToBytes(encrypted.ciphertext);
    const sharedSecret = x25519.scalarMult(recipientPrivateKey, ephemeralPublicKey);
    const key = hkdf(sha256, sharedSecret, undefined, 'skillkit-mesh-pk-v1', 32);
    const cipher = xchacha20poly1305(key, nonce);

    return cipher.decrypt(ciphertext);
  }

  static decryptToString(
    encrypted: PublicKeyEncryptedMessage,
    recipientPrivateKey: Uint8Array
  ): string {
    const plaintext = PublicKeyEncryption.decrypt(encrypted, recipientPrivateKey);
    return new TextDecoder().decode(plaintext);
  }

  static decryptToObject<T = unknown>(
    encrypted: PublicKeyEncryptedMessage,
    recipientPrivateKey: Uint8Array
  ): T {
    const plaintext = PublicKeyEncryption.decryptToString(
      encrypted,
      recipientPrivateKey
    );
    return JSON.parse(plaintext) as T;
  }
}

export function generateNonce(): string {
  return bytesToHex(randomBytes(24));
}

export function generateMessageId(): string {
  return bytesToHex(randomBytes(16));
}
