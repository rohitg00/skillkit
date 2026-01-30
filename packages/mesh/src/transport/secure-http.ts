import got, { type Got } from 'got';
import { randomUUID } from 'node:crypto';
import type {
  TransportMessage,
  SecureTransportMessage,
  Host,
} from '../types.js';
import { HEALTH_CHECK_TIMEOUT } from '../types.js';
import { PeerIdentity } from '../crypto/identity.js';
import {
  AuthManager,
  createBearerHeader,
} from '../security/auth.js';
import { type MeshSecurityConfig, DEFAULT_SECURITY_CONFIG } from '../security/config.js';
import { SecureKeystore } from '../crypto/keystore.js';

export interface SecureHttpTransportOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  security?: MeshSecurityConfig;
  identity?: PeerIdentity;
  keystore?: SecureKeystore;
  authToken?: string;
}

export class SecureHttpTransport {
  private client: Got;
  private options: SecureHttpTransportOptions;
  private identity: PeerIdentity | null = null;
  private keystore: SecureKeystore | null = null;
  private authManager: AuthManager | null = null;
  private authToken: string | null = null;
  private host: Host;
  private security: MeshSecurityConfig;

  constructor(host: Host, options: SecureHttpTransportOptions = {}) {
    this.host = host;
    this.options = {
      timeout: options.timeout ?? HEALTH_CHECK_TIMEOUT,
      retries: options.retries ?? 2,
      retryDelay: options.retryDelay ?? 1000,
      headers: options.headers ?? {},
    };
    this.identity = options.identity ?? null;
    this.keystore = options.keystore ?? null;
    this.authToken = options.authToken ?? null;
    this.security = options.security ?? DEFAULT_SECURITY_CONFIG;

    const protocol =
      this.security.transport.tls !== 'none' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host.address}:${host.port}`;

    this.client = got.extend({
      prefixUrl: baseUrl,
      timeout: { request: this.options.timeout },
      retry: {
        limit: this.options.retries,
        calculateDelay: () => this.options.retryDelay!,
      },
      https: {
        rejectUnauthorized: false,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-SkillKit-Transport': 'secure-http',
        ...this.options.headers,
      },
    });
  }

  async initialize(): Promise<void> {
    if (!this.identity && this.keystore) {
      this.identity = await this.keystore.loadOrCreateIdentity();
    }
    if (!this.identity) {
      this.identity = await PeerIdentity.generate();
    }
    this.authManager = new AuthManager(this.identity);

    if (this.security.transport.requireAuth && !this.authToken) {
      this.authToken = await this.authManager.createToken(this.host.id);
    }
  }

  private async getSecureHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    if (this.authToken) {
      headers['Authorization'] = createBearerHeader(this.authToken);
    }

    if (this.identity) {
      headers['X-SkillKit-Fingerprint'] = this.identity.fingerprint;
    }

    return headers;
  }

  async send(path: string, payload: unknown): Promise<TransportMessage> {
    if (!this.identity) {
      await this.initialize();
    }

    const message: TransportMessage = {
      id: randomUUID(),
      type: 'request',
      from: this.identity?.fingerprint ?? 'local',
      to: path,
      payload,
      timestamp: new Date().toISOString(),
    };

    let body: TransportMessage | SecureTransportMessage = message;

    if (this.identity) {
      const signature = await this.identity.signObject(message);
      body = {
        ...message,
        signature,
        senderFingerprint: this.identity.fingerprint,
        senderPublicKey: this.identity.publicKeyHex,
        nonce: randomUUID(),
      } as SecureTransportMessage;
    }

    const secureHeaders = await this.getSecureHeaders();

    const response = await this.client.post(path, {
      json: body,
      headers: secureHeaders,
    });

    return JSON.parse(response.body) as TransportMessage;
  }

  async sendMessage(
    to: string,
    type: string,
    payload: unknown
  ): Promise<TransportMessage> {
    return this.send('message', {
      to,
      type,
      payload,
    });
  }

  async registerPeer(registration: unknown): Promise<TransportMessage> {
    return this.send('peer/register', registration);
  }

  async getPeers(): Promise<TransportMessage> {
    if (!this.identity) {
      await this.initialize();
    }

    const secureHeaders = await this.getSecureHeaders();

    const response = await this.client.get('peers', {
      headers: secureHeaders,
    });

    return JSON.parse(response.body) as TransportMessage;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('health', {
        headers: await this.getSecureHeaders(),
      });
      return response.statusCode === 200;
    } catch {
      return false;
    }
  }

  getFingerprint(): string | null {
    return this.identity?.fingerprint ?? null;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }
}

export async function sendToHostSecure(
  host: Host,
  path: string,
  payload: unknown,
  options: SecureHttpTransportOptions = {}
): Promise<TransportMessage> {
  const transport = new SecureHttpTransport(host, options);
  await transport.initialize();
  return transport.send(path, payload);
}

export async function broadcastToHostsSecure(
  hosts: Host[],
  path: string,
  payload: unknown,
  options: SecureHttpTransportOptions = {}
): Promise<Map<string, TransportMessage | Error>> {
  const results = new Map<string, TransportMessage | Error>();

  await Promise.all(
    hosts.map(async (host) => {
      try {
        const response = await sendToHostSecure(host, path, payload, options);
        results.set(host.id, response);
      } catch (err) {
        results.set(host.id, err as Error);
      }
    })
  );

  return results;
}

export function verifySecureMessage(
  message: SecureTransportMessage
): { valid: boolean; error?: string } {
  if (!message.signature || !message.senderPublicKey || !message.senderFingerprint) {
    return { valid: false, error: 'Missing signature fields' };
  }

  const computedFingerprint = PeerIdentity.computeFingerprint(
    Buffer.from(message.senderPublicKey, 'hex')
  );

  if (computedFingerprint !== message.senderFingerprint) {
    return { valid: false, error: 'Fingerprint mismatch' };
  }

  return { valid: true };
}
