import got from "got";
import type { Message, MessageDeliveryResult } from "../types.js";

export interface RemoteTransportOptions {
  timeout?: number;
  retries?: number;
  useHttps?: boolean;
  rejectUnauthorized?: boolean;
}

export class RemoteTransport {
  private options: Required<RemoteTransportOptions>;

  constructor(options: RemoteTransportOptions = {}) {
    this.options = {
      timeout: options.timeout ?? 10000,
      retries: options.retries ?? 2,
      useHttps: options.useHttps ?? false,
      rejectUnauthorized: options.rejectUnauthorized ?? true,
    };
  }

  private getProtocol(hostAddress: string): string {
    const isLocalhost =
      hostAddress === "localhost" ||
      hostAddress === "127.0.0.1" ||
      hostAddress === "::1";
    return this.options.useHttps && !isLocalhost ? "https" : "http";
  }

  private formatHost(hostAddress: string): string {
    return hostAddress.includes(":") && !hostAddress.startsWith("[")
      ? `[${hostAddress}]`
      : hostAddress;
  }

  async deliver(
    message: Message,
    hostAddress: string,
    hostPort: number,
  ): Promise<MessageDeliveryResult> {
    const url = `${this.getProtocol(hostAddress)}://${this.formatHost(hostAddress)}:${hostPort}/message`;

    try {
      const response = await got.post(url, {
        json: message,
        timeout: { request: this.options.timeout },
        retry: { limit: this.options.retries },
        throwHttpErrors: false,
        ...(this.options.useHttps && {
          https: { rejectUnauthorized: this.options.rejectUnauthorized },
        }),
      });

      if (response.statusCode === 200 || response.statusCode === 201) {
        return {
          messageId: message.id,
          delivered: true,
          deliveredAt: new Date().toISOString(),
          via: "remote",
        };
      }

      return {
        messageId: message.id,
        delivered: false,
        error: `HTTP ${response.statusCode}: ${response.body}`,
        via: "remote",
      };
    } catch (err: any) {
      return {
        messageId: message.id,
        delivered: false,
        error: err.message || "Connection failed",
        via: "remote",
      };
    }
  }

  async deliverToAgent(
    message: Message,
    agentAddress: string,
  ): Promise<MessageDeliveryResult> {
    const parts = agentAddress.split("@");
    if (parts.length !== 2) {
      return {
        messageId: message.id,
        delivered: false,
        error: "Invalid agent address format. Expected: agentId@host:port",
        via: "remote",
      };
    }

    const [, hostPart] = parts;
    const lastColon = hostPart.lastIndexOf(":");
    const host = lastColon > 0 ? hostPart.slice(0, lastColon) : hostPart;
    const portStr = lastColon > 0 ? hostPart.slice(lastColon + 1) : undefined;
    const port = portStr ? parseInt(portStr, 10) : 9876;

    return this.deliver(message, host, port);
  }

  async broadcast(
    message: Message,
    hosts: Array<{ address: string; port: number }>,
  ): Promise<Map<string, MessageDeliveryResult>> {
    const results = new Map<string, MessageDeliveryResult>();

    await Promise.all(
      hosts.map(async ({ address, port }) => {
        const result = await this.deliver(message, address, port);
        results.set(`${address}:${port}`, result);
      }),
    );

    return results;
  }

  async ping(hostAddress: string, hostPort: number): Promise<boolean> {
    const url = `${this.getProtocol(hostAddress)}://${this.formatHost(hostAddress)}:${hostPort}/health`;

    try {
      const response = await got.get(url, {
        timeout: { request: 5000 },
        retry: { limit: 0 },
        throwHttpErrors: false,
        ...(this.options.useHttps && {
          https: { rejectUnauthorized: this.options.rejectUnauthorized },
        }),
      });

      return response.statusCode === 200;
    } catch {
      return false;
    }
  }
}
