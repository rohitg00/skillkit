import got, { type Got } from 'got';
import { randomUUID } from 'node:crypto';
import type { TransportMessage, TransportOptions, Host } from '../types.js';
import { HEALTH_CHECK_TIMEOUT } from '../types.js';

export interface HttpTransportOptions extends TransportOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export class HttpTransport {
  private client: Got;
  private options: HttpTransportOptions;

  constructor(host: Host, options: HttpTransportOptions = {}) {
    this.options = {
      timeout: options.timeout ?? HEALTH_CHECK_TIMEOUT,
      retries: options.retries ?? 2,
      retryDelay: options.retryDelay ?? 1000,
      baseUrl: options.baseUrl ?? `http://${host.address}:${host.port}`,
      headers: options.headers ?? {},
    };

    this.client = got.extend({
      prefixUrl: this.options.baseUrl,
      timeout: { request: this.options.timeout },
      retry: {
        limit: this.options.retries,
        calculateDelay: () => this.options.retryDelay!,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-SkillKit-Transport': 'http',
        ...this.options.headers,
      },
    });
  }

  async send(path: string, payload: unknown): Promise<TransportMessage> {
    const message: TransportMessage = {
      id: randomUUID(),
      type: 'request',
      from: 'local',
      to: path,
      payload,
      timestamp: new Date().toISOString(),
    };

    const response = await this.client.post(path, {
      json: message,
    });

    return JSON.parse(response.body) as TransportMessage;
  }

  async sendMessage(to: string, type: string, payload: unknown): Promise<TransportMessage> {
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
    const response = await this.client.get('peers');
    return JSON.parse(response.body) as TransportMessage;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('health');
      return response.statusCode === 200;
    } catch {
      return false;
    }
  }
}

export async function sendToHost(
  host: Host,
  path: string,
  payload: unknown,
  options: HttpTransportOptions = {}
): Promise<TransportMessage> {
  const transport = new HttpTransport(host, options);
  return transport.send(path, payload);
}

export async function broadcastToHosts(
  hosts: Host[],
  path: string,
  payload: unknown,
  options: HttpTransportOptions = {}
): Promise<Map<string, TransportMessage | Error>> {
  const results = new Map<string, TransportMessage | Error>();

  await Promise.all(
    hosts.map(async host => {
      try {
        const response = await sendToHost(host, path, payload, options);
        results.set(host.id, response);
      } catch (err) {
        results.set(host.id, err as Error);
      }
    })
  );

  return results;
}
