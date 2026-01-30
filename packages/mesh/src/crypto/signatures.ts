import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
import { PeerIdentity } from './identity.js';

export interface SignedData<T> {
  data: T;
  signature: string;
  senderFingerprint: string;
  senderPublicKey: string;
  timestamp: string;
  nonce: string;
}

export interface SignatureVerificationResult {
  valid: boolean;
  fingerprint?: string;
  error?: string;
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function canonicalize(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalize).join(',') + ']';
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map((key) => {
    const value = (obj as Record<string, unknown>)[key];
    return JSON.stringify(key) + ':' + canonicalize(value);
  });

  return '{' + pairs.join(',') + '}';
}

function hashData(data: unknown): Uint8Array {
  const canonical = canonicalize(data);
  return sha256(new TextEncoder().encode(canonical));
}

export async function signData<T>(
  data: T,
  identity: PeerIdentity
): Promise<SignedData<T>> {
  const timestamp = new Date().toISOString();
  const nonce = generateNonce();

  const toSign = {
    data,
    timestamp,
    nonce,
    senderFingerprint: identity.fingerprint,
  };

  const hash = hashData(toSign);
  const signature = await identity.sign(hash);

  return {
    data,
    signature: bytesToHex(signature),
    senderFingerprint: identity.fingerprint,
    senderPublicKey: identity.publicKeyHex,
    timestamp,
    nonce,
  };
}

export async function verifySignedData<T>(
  signed: SignedData<T>,
  trustedPublicKey?: Uint8Array
): Promise<SignatureVerificationResult> {
  try {
    const publicKey = trustedPublicKey || hexToBytes(signed.senderPublicKey);

    const computedFingerprint = PeerIdentity.computeFingerprint(publicKey);
    if (computedFingerprint !== signed.senderFingerprint) {
      return {
        valid: false,
        error: 'Fingerprint mismatch',
      };
    }

    const toSign = {
      data: signed.data,
      timestamp: signed.timestamp,
      nonce: signed.nonce,
      senderFingerprint: signed.senderFingerprint,
    };

    const hash = hashData(toSign);
    const signature = hexToBytes(signed.signature);
    const valid = await PeerIdentity.verify(signature, hash, publicKey);

    if (!valid) {
      return {
        valid: false,
        error: 'Invalid signature',
      };
    }

    return {
      valid: true,
      fingerprint: signed.senderFingerprint,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function isSignedDataExpired(
  signed: SignedData<unknown>,
  maxAgeMs: number = 5 * 60 * 1000
): boolean {
  const timestamp = new Date(signed.timestamp).getTime();
  const now = Date.now();
  return now - timestamp > maxAgeMs;
}

export function extractSignerFingerprint(
  signed: SignedData<unknown>
): string | null {
  try {
    const publicKey = hexToBytes(signed.senderPublicKey);
    const computed = PeerIdentity.computeFingerprint(publicKey);
    if (computed === signed.senderFingerprint) {
      return signed.senderFingerprint;
    }
    return null;
  } catch {
    return null;
  }
}
