import WebSocket, { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import type { TransportMessage, TransportOptions, Host } from '../types.js';
import { DEFAULT_PORT } from '../types.js';

export interface WebSocketTransportOptions extends TransportOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export type MessageHandler = (message: TransportMessage, socket: WebSocket) => void;

export class WebSocketTransport {
  private socket: WebSocket | null = null;
  private options: Required<WebSocketTransportOptions>;
  private url: string;
  private reconnectAttempts = 0;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(host: Host, options: WebSocketTransportOptions = {}) {
    this.url = `ws://${host.address}:${host.port}/ws`;
    this.options = {
      timeout: options.timeout ?? 5000,
      retries: options.retries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      reconnect: options.reconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 5000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url, {
        handshakeTimeout: this.options.timeout,
      });

      const timeout = setTimeout(() => {
        this.socket?.close();
        reject(new Error('Connection timeout'));
      }, this.options.timeout);

      this.socket.on('open', () => {
        clearTimeout(timeout);
        this.connected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('message', data => {
        try {
          const message = JSON.parse(data.toString()) as TransportMessage;
          this.messageHandlers.forEach(handler => handler(message, this.socket!));
        } catch {
        }
      });

      this.socket.on('close', () => {
        this.connected = false;
        if (this.options.reconnect) {
          this.scheduleReconnect();
        }
      });

      this.socket.on('error', err => {
        clearTimeout(timeout);
        if (!this.connected) {
          reject(err);
        }
      });
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.connected = false;
  }

  async send(message: Omit<TransportMessage, 'id' | 'timestamp'>): Promise<void> {
    if (!this.socket || !this.connected) {
      throw new Error('Not connected');
    }

    const fullMessage: TransportMessage = {
      ...message,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      this.socket!.send(JSON.stringify(fullMessage), err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.connected;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      return;
    }

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++;
      try {
        await this.connect();
      } catch {
        this.scheduleReconnect();
      }
    }, this.options.reconnectInterval);
  }
}

export class WebSocketServer2 {
  private server: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private messageHandlers: Set<MessageHandler> = new Set();
  private port: number;
  private running = false;

  constructor(port = DEFAULT_PORT) {
    this.port = port;
  }

  async start(): Promise<void> {
    if (this.running) return;

    return new Promise((resolve, reject) => {
      this.server = new WebSocketServer({ port: this.port, path: '/ws' });

      this.server.on('listening', () => {
        this.running = true;
        resolve();
      });

      this.server.on('error', err => {
        reject(err);
      });

      this.server.on('connection', socket => {
        this.clients.add(socket);

        socket.on('message', data => {
          try {
            const message = JSON.parse(data.toString()) as TransportMessage;
            this.messageHandlers.forEach(handler => handler(message, socket));
          } catch {
          }
        });

        socket.on('close', () => {
          this.clients.delete(socket);
        });
      });
    });
  }

  stop(): void {
    if (!this.running) return;

    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();

    this.server?.close();
    this.server = null;
    this.running = false;
  }

  broadcast(message: Omit<TransportMessage, 'id' | 'timestamp'>): void {
    const fullMessage: TransportMessage = {
      ...message,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    const data = JSON.stringify(fullMessage);

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  sendTo(socket: WebSocket, message: Omit<TransportMessage, 'id' | 'timestamp'>): void {
    if (socket.readyState !== WebSocket.OPEN) return;

    const fullMessage: TransportMessage = {
      ...message,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    socket.send(JSON.stringify(fullMessage));
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  isRunning(): boolean {
    return this.running;
  }
}
