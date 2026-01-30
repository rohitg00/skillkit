import WebSocket, { WebSocketServer } from 'ws';
import { createServer as createHttpsServer, type Server as HttpsServer } from 'node:https';
import { randomUUID } from 'node:crypto';
import type {
  TransportMessage,
  SecureTransportMessage,
  Host,
} from '../types.js';
import { DEFAULT_PORT } from '../types.js';
import { PeerIdentity } from '../crypto/identity.js';
import { MessageEncryption } from '../crypto/encryption.js';
import { AuthManager, type AuthChallengeRequest, type AuthChallengeResponse } from '../security/auth.js';
import { TLSManager, type CertificateInfo } from '../security/tls.js';
import { type MeshSecurityConfig, DEFAULT_SECURITY_CONFIG } from '../security/config.js';
import { SecureKeystore } from '../crypto/keystore.js';
import { hexToBytes } from '@noble/hashes/utils';

export interface SecureWebSocketOptions {
  timeout?: number;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  security?: MeshSecurityConfig;
  identity?: PeerIdentity;
  keystore?: SecureKeystore;
}

export type SecureMessageHandler = (
  message: TransportMessage,
  socket: WebSocket,
  senderFingerprint?: string
) => void;

interface AuthenticatedClient {
  socket: WebSocket;
  fingerprint: string;
  publicKey: string;
  encryption?: MessageEncryption;
}

export class SecureWebSocketTransport {
  private socket: WebSocket | null = null;
  private host: Host;
  private options: Required<Omit<SecureWebSocketOptions, 'identity' | 'keystore'>>;
  private identity: PeerIdentity | null = null;
  private keystore: SecureKeystore | null = null;
  private authManager: AuthManager | null = null;
  private encryption: MessageEncryption | null = null;
  private reconnectAttempts = 0;
  private messageHandlers: Set<SecureMessageHandler> = new Set();
  private connected = false;
  private authenticated = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(host: Host, options: SecureWebSocketOptions = {}) {
    this.host = host;
    this.options = {
      timeout: options.timeout ?? 5000,
      reconnect: options.reconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 5000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      security: options.security ?? DEFAULT_SECURITY_CONFIG,
    };
    this.identity = options.identity ?? null;
    this.keystore = options.keystore ?? null;
  }

  async initialize(): Promise<void> {
    if (!this.identity && this.keystore) {
      this.identity = await this.keystore.loadOrCreateIdentity();
    }
    if (!this.identity) {
      this.identity = await PeerIdentity.generate();
    }
    this.authManager = new AuthManager(this.identity);
  }

  private getUrl(): string {
    const protocol =
      this.options.security.transport.tls !== 'none' ? 'wss' : 'ws';
    return `${protocol}://${this.host.address}:${this.host.port}/ws`;
  }

  async connect(): Promise<void> {
    if (!this.identity) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const url = this.getUrl();
      const wsOptions: WebSocket.ClientOptions = {
        handshakeTimeout: this.options.timeout,
        rejectUnauthorized: false,
      };

      this.socket = new WebSocket(url, wsOptions);

      const timeout = setTimeout(() => {
        this.socket?.close();
        reject(new Error('Connection timeout'));
      }, this.options.timeout);

      this.socket.on('open', async () => {
        clearTimeout(timeout);
        this.connected = true;
        this.reconnectAttempts = 0;

        if (this.options.security.transport.requireAuth) {
          try {
            await this.performClientHandshake();
            this.authenticated = true;
          } catch (err) {
            this.socket?.close();
            reject(new Error(`Authentication failed: ${err}`));
            return;
          }
        } else {
          this.authenticated = true;
        }

        resolve();
      });

      this.socket.on('message', async (data) => {
        try {
          const raw = JSON.parse(data.toString());

          if (raw.type === 'auth:challenge') {
            return;
          }

          let message: TransportMessage;
          let senderFingerprint: string | undefined;

          if (this.encryption && raw.ciphertext) {
            const decrypted = this.encryption.decryptToObject<TransportMessage>({
              nonce: raw.nonce,
              ciphertext: raw.ciphertext,
            });
            message = decrypted;
            senderFingerprint = raw.senderFingerprint;
          } else if (raw.signature) {
            const secure = raw as SecureTransportMessage;
            senderFingerprint = secure.senderFingerprint;
            message = {
              id: secure.id,
              type: secure.type,
              from: secure.from,
              to: secure.to,
              payload: secure.payload,
              timestamp: secure.timestamp,
            };
          } else {
            message = raw as TransportMessage;
          }

          this.messageHandlers.forEach((handler) =>
            handler(message, this.socket!, senderFingerprint)
          );
        } catch {
        }
      });

      this.socket.on('close', () => {
        this.connected = false;
        this.authenticated = false;
        if (this.options.reconnect) {
          this.scheduleReconnect();
        }
      });

      this.socket.on('error', (err) => {
        clearTimeout(timeout);
        if (!this.connected) {
          reject(err);
        }
      });
    });
  }

  private async performClientHandshake(): Promise<void> {
    return new Promise((resolve, reject) => {
      const handleChallenge = async (data: WebSocket.Data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'auth:challenge') {
            const challenge: AuthChallengeRequest = {
              challenge: msg.challenge,
              timestamp: msg.timestamp,
            };

            const response = await this.authManager!.respondToChallenge(challenge);
            this.socket!.send(
              JSON.stringify({
                type: 'auth:response',
                ...response,
              })
            );
          } else if (msg.type === 'auth:success') {
            this.socket!.off('message', handleChallenge);

            if (msg.serverPublicKey) {
              const serverPubKey = hexToBytes(msg.serverPublicKey);
              const sharedSecret = this.identity!.deriveSharedSecret(serverPubKey);
              this.encryption = new MessageEncryption(sharedSecret);
            }

            resolve();
          } else if (msg.type === 'auth:failed') {
            this.socket!.off('message', handleChallenge);
            reject(new Error(msg.error || 'Authentication failed'));
          }
        } catch (err) {
          reject(err);
        }
      };

      this.socket!.on('message', handleChallenge);

      setTimeout(() => {
        this.socket!.off('message', handleChallenge);
        reject(new Error('Authentication timeout'));
      }, this.options.timeout);
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
    this.authenticated = false;
    this.encryption = null;
  }

  async send(
    message: Omit<TransportMessage, 'id' | 'timestamp'>
  ): Promise<void> {
    if (!this.socket || !this.connected) {
      throw new Error('Not connected');
    }

    if (!this.authenticated) {
      throw new Error('Not authenticated');
    }

    const fullMessage: TransportMessage = {
      ...message,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    let dataToSend: string;

    if (
      this.encryption &&
      this.options.security.transport.encryption === 'required'
    ) {
      const encrypted = this.encryption.encryptObject(fullMessage);
      dataToSend = JSON.stringify({
        id: fullMessage.id,
        senderFingerprint: this.identity!.fingerprint,
        nonce: encrypted.nonce,
        ciphertext: encrypted.ciphertext,
        timestamp: fullMessage.timestamp,
      });
    } else if (this.identity) {
      const signature = await this.identity.signObject(fullMessage);
      const secureMessage: SecureTransportMessage = {
        ...fullMessage,
        signature,
        senderFingerprint: this.identity.fingerprint,
        senderPublicKey: this.identity.publicKeyHex,
        nonce: randomUUID(),
      };
      dataToSend = JSON.stringify(secureMessage);
    } else {
      dataToSend = JSON.stringify(fullMessage);
    }

    return new Promise((resolve, reject) => {
      this.socket!.send(dataToSend, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  onMessage(handler: SecureMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.connected;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  getFingerprint(): string | null {
    return this.identity?.fingerprint ?? null;
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

export class SecureWebSocketServer {
  private wss: WebSocketServer | null = null;
  private httpsServer: HttpsServer | null = null;
  private clients: Map<WebSocket, AuthenticatedClient> = new Map();
  private messageHandlers: Set<SecureMessageHandler> = new Set();
  private port: number;
  private running = false;
  private identity: PeerIdentity | null = null;
  private keystore: SecureKeystore | null = null;
  private authManager: AuthManager | null = null;
  private tlsManager: TLSManager | null = null;
  private certInfo: CertificateInfo | null = null;
  private security: MeshSecurityConfig;
  private hostId: string;

  constructor(
    port = DEFAULT_PORT,
    options: {
      security?: MeshSecurityConfig;
      identity?: PeerIdentity;
      keystore?: SecureKeystore;
      hostId?: string;
    } = {}
  ) {
    this.port = port;
    this.security = options.security ?? DEFAULT_SECURITY_CONFIG;
    this.identity = options.identity ?? null;
    this.keystore = options.keystore ?? null;
    this.hostId = options.hostId ?? randomUUID();
  }

  async initialize(): Promise<void> {
    if (!this.identity && this.keystore) {
      this.identity = await this.keystore.loadOrCreateIdentity();
    }
    if (!this.identity) {
      this.identity = await PeerIdentity.generate();
    }
    this.authManager = new AuthManager(this.identity);

    if (this.security.transport.tls !== 'none') {
      this.tlsManager = new TLSManager();
      this.certInfo = await this.tlsManager.loadOrCreateCertificate(
        this.hostId,
        'localhost'
      );
    }
  }

  async start(): Promise<void> {
    if (this.running) return;

    await this.initialize();

    return new Promise((resolve, reject) => {
      if (this.security.transport.tls !== 'none' && this.certInfo) {
        this.httpsServer = createHttpsServer({
          cert: this.certInfo.cert,
          key: this.certInfo.key,
        });

        this.wss = new WebSocketServer({
          server: this.httpsServer,
          path: '/ws',
        });

        this.httpsServer.listen(this.port, () => {
          this.running = true;
          resolve();
        });

        this.httpsServer.on('error', reject);
      } else {
        this.wss = new WebSocketServer({ port: this.port, path: '/ws' });

        this.wss.on('listening', () => {
          this.running = true;
          resolve();
        });

        this.wss.on('error', reject);
      }

      this.wss.on('connection', (socket) => {
        this.handleConnection(socket);
      });
    });
  }

  private async handleConnection(socket: WebSocket): Promise<void> {
    if (this.security.transport.requireAuth) {
      try {
        const client = await this.performServerHandshake(socket);
        this.clients.set(socket, client);
      } catch {
        socket.close();
        return;
      }
    } else {
      this.clients.set(socket, {
        socket,
        fingerprint: 'anonymous',
        publicKey: '',
      });
    }

    socket.on('message', async (data) => {
      try {
        const raw = JSON.parse(data.toString());

        if (raw.type === 'auth:response') {
          return;
        }

        const client = this.clients.get(socket);
        if (!client) return;

        let message: TransportMessage;
        let senderFingerprint: string | undefined = client.fingerprint;

        if (client.encryption && raw.ciphertext) {
          const decrypted = client.encryption.decryptToObject<TransportMessage>({
            nonce: raw.nonce,
            ciphertext: raw.ciphertext,
          });
          message = decrypted;
        } else if (raw.signature) {
          const secure = raw as SecureTransportMessage;
          senderFingerprint = secure.senderFingerprint;
          message = {
            id: secure.id,
            type: secure.type,
            from: secure.from,
            to: secure.to,
            payload: secure.payload,
            timestamp: secure.timestamp,
          };
        } else {
          message = raw as TransportMessage;
        }

        this.messageHandlers.forEach((handler) =>
          handler(message, socket, senderFingerprint)
        );
      } catch {
      }
    });

    socket.on('close', () => {
      this.clients.delete(socket);
    });
  }

  private async performServerHandshake(
    socket: WebSocket
  ): Promise<AuthenticatedClient> {
    return new Promise((resolve, reject) => {
      const challenge = this.authManager!.createChallenge();

      socket.send(
        JSON.stringify({
          type: 'auth:challenge',
          ...challenge,
        })
      );

      const timeout = setTimeout(() => {
        socket.off('message', handleResponse);
        reject(new Error('Handshake timeout'));
      }, 10000);

      const handleResponse = async (data: WebSocket.Data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'auth:response') {
            clearTimeout(timeout);
            socket.off('message', handleResponse);

            const response: AuthChallengeResponse = {
              challenge: msg.challenge,
              signature: msg.signature,
              publicKey: msg.publicKey,
              fingerprint: msg.fingerprint,
              timestamp: msg.timestamp,
            };

            const result =
              await this.authManager!.verifyChallengeResponse(response);

            if (!result.authenticated) {
              socket.send(
                JSON.stringify({
                  type: 'auth:failed',
                  error: result.error,
                })
              );
              reject(new Error(result.error));
              return;
            }

            if (this.keystore) {
              const isRevoked = await this.keystore.isRevoked(result.fingerprint!);
              if (isRevoked) {
                socket.send(
                  JSON.stringify({
                    type: 'auth:failed',
                    error: 'Peer is revoked',
                  })
                );
                reject(new Error('Peer is revoked'));
                return;
              }
            }

            let encryption: MessageEncryption | undefined;
            if (this.security.transport.encryption === 'required') {
              const clientPubKey = hexToBytes(response.publicKey);
              const sharedSecret = this.identity!.deriveSharedSecret(clientPubKey);
              encryption = new MessageEncryption(sharedSecret);
            }

            socket.send(
              JSON.stringify({
                type: 'auth:success',
                serverFingerprint: this.identity!.fingerprint,
                serverPublicKey: this.identity!.publicKeyHex,
              })
            );

            resolve({
              socket,
              fingerprint: result.fingerprint!,
              publicKey: response.publicKey,
              encryption,
            });
          }
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      };

      socket.on('message', handleResponse);
    });
  }

  stop(): void {
    if (!this.running) return;

    for (const [socket] of this.clients) {
      socket.close();
    }
    this.clients.clear();

    this.wss?.close();
    this.httpsServer?.close();
    this.wss = null;
    this.httpsServer = null;
    this.running = false;
  }

  async broadcast(
    message: Omit<TransportMessage, 'id' | 'timestamp'>
  ): Promise<void> {
    const fullMessage: TransportMessage = {
      ...message,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    for (const [socket, client] of this.clients) {
      if (socket.readyState !== WebSocket.OPEN) continue;

      let dataToSend: string;

      if (client.encryption) {
        const encrypted = client.encryption.encryptObject(fullMessage);
        dataToSend = JSON.stringify({
          id: fullMessage.id,
          senderFingerprint: this.identity!.fingerprint,
          nonce: encrypted.nonce,
          ciphertext: encrypted.ciphertext,
          timestamp: fullMessage.timestamp,
        });
      } else if (this.identity) {
        const signature = await this.identity.signObject(fullMessage);
        const secureMessage: SecureTransportMessage = {
          ...fullMessage,
          signature,
          senderFingerprint: this.identity.fingerprint,
          senderPublicKey: this.identity.publicKeyHex,
          nonce: randomUUID(),
        };
        dataToSend = JSON.stringify(secureMessage);
      } else {
        dataToSend = JSON.stringify(fullMessage);
      }

      socket.send(dataToSend);
    }
  }

  async sendTo(
    socket: WebSocket,
    message: Omit<TransportMessage, 'id' | 'timestamp'>
  ): Promise<void> {
    if (socket.readyState !== WebSocket.OPEN) return;

    const client = this.clients.get(socket);
    if (!client) return;

    const fullMessage: TransportMessage = {
      ...message,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    let dataToSend: string;

    if (client.encryption) {
      const encrypted = client.encryption.encryptObject(fullMessage);
      dataToSend = JSON.stringify({
        id: fullMessage.id,
        senderFingerprint: this.identity!.fingerprint,
        nonce: encrypted.nonce,
        ciphertext: encrypted.ciphertext,
        timestamp: fullMessage.timestamp,
      });
    } else if (this.identity) {
      const signature = await this.identity.signObject(fullMessage);
      const secureMessage: SecureTransportMessage = {
        ...fullMessage,
        signature,
        senderFingerprint: this.identity.fingerprint,
        senderPublicKey: this.identity.publicKeyHex,
        nonce: randomUUID(),
      };
      dataToSend = JSON.stringify(secureMessage);
    } else {
      dataToSend = JSON.stringify(fullMessage);
    }

    socket.send(dataToSend);
  }

  onMessage(handler: SecureMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  isRunning(): boolean {
    return this.running;
  }

  getFingerprint(): string | null {
    return this.identity?.fingerprint ?? null;
  }

  getAuthenticatedClients(): Array<{ fingerprint: string; publicKey: string }> {
    return Array.from(this.clients.values()).map((c) => ({
      fingerprint: c.fingerprint,
      publicKey: c.publicKey,
    }));
  }
}
