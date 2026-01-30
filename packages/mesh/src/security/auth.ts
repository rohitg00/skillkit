import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'node:crypto';
import { PeerIdentity } from '../crypto/identity.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

export interface AuthToken {
  hostId: string;
  fingerprint: string;
  capabilities: string[];
  iat: number;
  exp: number;
}

export interface AuthChallengeRequest {
  challenge: string;
  timestamp: string;
}

export interface AuthChallengeResponse {
  challenge: string;
  signature: string;
  publicKey: string;
  fingerprint: string;
  timestamp: string;
}

export interface AuthResult {
  authenticated: boolean;
  fingerprint?: string;
  publicKey?: string;
  error?: string;
}

const DEFAULT_TOKEN_TTL = 24 * 60 * 60;
const CHALLENGE_SIZE = 32;
const CHALLENGE_EXPIRY_MS = 30 * 1000;

export class AuthManager {
  private identity: PeerIdentity;
  private jwtSecret: Uint8Array;
  private pendingChallenges: Map<string, { expected: string; expires: number }> =
    new Map();

  constructor(identity: PeerIdentity, jwtSecret?: Uint8Array) {
    this.identity = identity;
    this.jwtSecret = jwtSecret || randomBytes(32);
  }

  async createToken(
    hostId: string,
    capabilities: string[] = [],
    ttlSeconds: number = DEFAULT_TOKEN_TTL
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({
      hostId,
      fingerprint: this.identity.fingerprint,
      capabilities,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + ttlSeconds)
      .setIssuer('skillkit-mesh')
      .sign(this.jwtSecret);

    return token;
  }

  async verifyToken(token: string): Promise<AuthToken | null> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret, {
        issuer: 'skillkit-mesh',
      });

      return {
        hostId: payload.hostId as string,
        fingerprint: payload.fingerprint as string,
        capabilities: (payload.capabilities as string[]) || [],
        iat: payload.iat as number,
        exp: payload.exp as number,
      };
    } catch {
      return null;
    }
  }

  createChallenge(): AuthChallengeRequest {
    const challengeBytes = randomBytes(CHALLENGE_SIZE);
    const challenge = bytesToHex(challengeBytes);
    const timestamp = new Date().toISOString();

    this.pendingChallenges.set(challenge, {
      expected: challenge,
      expires: Date.now() + CHALLENGE_EXPIRY_MS,
    });

    this.cleanupExpiredChallenges();

    return {
      challenge,
      timestamp,
    };
  }

  async respondToChallenge(
    challengeRequest: AuthChallengeRequest
  ): Promise<AuthChallengeResponse> {
    const message = `${challengeRequest.challenge}:${challengeRequest.timestamp}`;
    const signature = await this.identity.signString(message);

    return {
      challenge: challengeRequest.challenge,
      signature,
      publicKey: this.identity.publicKeyHex,
      fingerprint: this.identity.fingerprint,
      timestamp: challengeRequest.timestamp,
    };
  }

  async verifyChallengeResponse(
    response: AuthChallengeResponse
  ): Promise<AuthResult> {
    const pending = this.pendingChallenges.get(response.challenge);

    if (!pending) {
      return {
        authenticated: false,
        error: 'Unknown or expired challenge',
      };
    }

    if (Date.now() > pending.expires) {
      this.pendingChallenges.delete(response.challenge);
      return {
        authenticated: false,
        error: 'Challenge expired',
      };
    }

    try {
      const publicKey = hexToBytes(response.publicKey);
      const computedFingerprint = PeerIdentity.computeFingerprint(publicKey);

      if (computedFingerprint !== response.fingerprint) {
        return {
          authenticated: false,
          error: 'Fingerprint mismatch',
        };
      }

      const message = `${response.challenge}:${response.timestamp}`;
      const messageBytes = new TextEncoder().encode(message);
      const signature = hexToBytes(response.signature);
      const valid = await PeerIdentity.verify(signature, messageBytes, publicKey);

      if (!valid) {
        return {
          authenticated: false,
          error: 'Invalid signature',
        };
      }

      this.pendingChallenges.delete(response.challenge);

      return {
        authenticated: true,
        fingerprint: response.fingerprint,
        publicKey: response.publicKey,
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  private cleanupExpiredChallenges(): void {
    const now = Date.now();
    for (const [challenge, data] of this.pendingChallenges) {
      if (now > data.expires) {
        this.pendingChallenges.delete(challenge);
      }
    }
  }

  async createSignedMessage(payload: unknown): Promise<{
    payload: unknown;
    signature: string;
    fingerprint: string;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    const toSign = JSON.stringify({ payload, timestamp });
    const signature = await this.identity.signString(toSign);

    return {
      payload,
      signature,
      fingerprint: this.identity.fingerprint,
      timestamp,
    };
  }

  async verifySignedMessage(message: {
    payload: unknown;
    signature: string;
    fingerprint: string;
    timestamp: string;
    publicKey?: string;
  }): Promise<{ valid: boolean; fingerprint?: string; error?: string }> {
    try {
      if (!message.publicKey) {
        return { valid: false, error: 'Missing public key' };
      }

      const publicKey = hexToBytes(message.publicKey);
      const computedFingerprint = PeerIdentity.computeFingerprint(publicKey);

      if (computedFingerprint !== message.fingerprint) {
        return { valid: false, error: 'Fingerprint mismatch' };
      }

      const toSign = JSON.stringify({
        payload: message.payload,
        timestamp: message.timestamp,
      });
      const messageBytes = new TextEncoder().encode(toSign);
      const signature = hexToBytes(message.signature);
      const valid = await PeerIdentity.verify(signature, messageBytes, publicKey);

      if (!valid) {
        return { valid: false, error: 'Invalid signature' };
      }

      return { valid: true, fingerprint: message.fingerprint };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  get fingerprint(): string {
    return this.identity.fingerprint;
  }

  get publicKey(): string {
    return this.identity.publicKeyHex;
  }
}

export function extractBearerToken(
  authHeader: string | undefined
): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export function createBearerHeader(token: string): string {
  return `Bearer ${token}`;
}
