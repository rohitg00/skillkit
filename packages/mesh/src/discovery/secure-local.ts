import { createSocket, Socket } from 'node:dgram';
import { networkInterfaces } from 'node:os';
import type { DiscoveryMessage, SignedDiscoveryMessage, Host } from '../types.js';
import { DEFAULT_DISCOVERY_PORT, MESH_VERSION } from '../types.js';
import { getLocalHostConfig, addKnownHost } from '../config/hosts-config.js';
import { PeerIdentity } from '../crypto/identity.js';
import { SecureKeystore } from '../crypto/keystore.js';
import {
  type MeshSecurityConfig,
  DEFAULT_SECURITY_CONFIG,
  type DiscoverySecurityMode,
} from '../security/config.js';
import { hexToBytes } from '@noble/hashes/utils';

const MULTICAST_ADDR = '239.255.255.250';
const DISCOVERY_INTERVAL_MS = 30000;

export interface SecureLocalDiscoveryOptions {
  port?: number;
  interval?: number;
  onDiscover?: (host: Host, fingerprint?: string) => void;
  security?: MeshSecurityConfig;
  identity?: PeerIdentity;
  keystore?: SecureKeystore;
}

export class SecureLocalDiscovery {
  private socket: Socket | null = null;
  private announceInterval: NodeJS.Timeout | null = null;
  private running = false;
  private options: Required<Omit<SecureLocalDiscoveryOptions, 'identity' | 'keystore'>>;
  private discoveredHosts: Map<string, Host> = new Map();
  private identity: PeerIdentity | null = null;
  private keystore: SecureKeystore | null = null;
  private securityMode: DiscoverySecurityMode;

  constructor(options: SecureLocalDiscoveryOptions = {}) {
    this.options = {
      port: options.port ?? DEFAULT_DISCOVERY_PORT,
      interval: options.interval ?? DISCOVERY_INTERVAL_MS,
      onDiscover: options.onDiscover ?? (() => {}),
      security: options.security ?? DEFAULT_SECURITY_CONFIG,
    };
    this.identity = options.identity ?? null;
    this.keystore = options.keystore ?? null;
    this.securityMode = this.options.security.discovery.mode;
  }

  async initialize(): Promise<void> {
    if (!this.identity && this.keystore) {
      this.identity = await this.keystore.loadOrCreateIdentity();
    }
    if (!this.identity && this.securityMode !== 'open') {
      this.identity = await PeerIdentity.generate();
    }
  }

  async start(): Promise<void> {
    if (this.running) return;

    await this.initialize();

    this.socket = createSocket({ type: 'udp4', reuseAddr: true });

    this.socket.on('message', (msg, rinfo) => {
      this.handleMessage(msg, rinfo);
    });

    this.socket.on('error', (err) => {
      console.error('Discovery socket error:', err);
    });

    await new Promise<void>((resolve, reject) => {
      this.socket!.bind(this.options.port, () => {
        try {
          this.socket!.addMembership(MULTICAST_ADDR);
          this.socket!.setBroadcast(true);
          this.socket!.setMulticastTTL(128);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });

    this.running = true;

    await this.announce();

    this.announceInterval = setInterval(() => {
      this.announce();
    }, this.options.interval);
  }

  async stop(): Promise<void> {
    if (!this.running) return;

    if (this.announceInterval) {
      clearInterval(this.announceInterval);
      this.announceInterval = null;
    }

    if (this.socket) {
      try {
        this.socket.dropMembership(MULTICAST_ADDR);
      } catch {
      }
      this.socket.close();
      this.socket = null;
    }

    this.running = false;
  }

  async announce(): Promise<void> {
    if (!this.socket || !this.running) return;

    const localConfig = await getLocalHostConfig();
    const localAddress = getLocalIPAddress();

    const baseMessage: DiscoveryMessage = {
      type: 'announce',
      hostId: localConfig.id,
      hostName: localConfig.name,
      address: localAddress,
      port: localConfig.port,
      tailscaleIP: localConfig.tailscaleIP,
      version: MESH_VERSION,
      timestamp: new Date().toISOString(),
    };

    let message: DiscoveryMessage | SignedDiscoveryMessage = baseMessage;

    if (this.identity && this.securityMode !== 'open') {
      const signature = await this.identity.signObject(baseMessage);
      message = {
        ...baseMessage,
        signature,
        publicKey: this.identity.publicKeyHex,
        fingerprint: this.identity.fingerprint,
      } as SignedDiscoveryMessage;
    }

    const buffer = Buffer.from(JSON.stringify(message));
    this.socket.send(buffer, 0, buffer.length, this.options.port, MULTICAST_ADDR);
  }

  async query(): Promise<void> {
    if (!this.socket || !this.running) return;

    const localConfig = await getLocalHostConfig();
    const localAddress = getLocalIPAddress();

    const baseMessage: DiscoveryMessage = {
      type: 'query',
      hostId: localConfig.id,
      hostName: localConfig.name,
      address: localAddress,
      port: localConfig.port,
      version: MESH_VERSION,
      timestamp: new Date().toISOString(),
    };

    let message: DiscoveryMessage | SignedDiscoveryMessage = baseMessage;

    if (this.identity && this.securityMode !== 'open') {
      const signature = await this.identity.signObject(baseMessage);
      message = {
        ...baseMessage,
        signature,
        publicKey: this.identity.publicKeyHex,
        fingerprint: this.identity.fingerprint,
      } as SignedDiscoveryMessage;
    }

    const buffer = Buffer.from(JSON.stringify(message));
    this.socket.send(buffer, 0, buffer.length, this.options.port, MULTICAST_ADDR);
  }

  getDiscoveredHosts(): Host[] {
    return Array.from(this.discoveredHosts.values());
  }

  isRunning(): boolean {
    return this.running;
  }

  getFingerprint(): string | null {
    return this.identity?.fingerprint ?? null;
  }

  private async handleMessage(
    msg: Buffer,
    rinfo: { address: string; port: number }
  ): Promise<void> {
    try {
      const raw = JSON.parse(msg.toString());

      const localConfig = await getLocalHostConfig();
      if (raw.hostId === localConfig.id) return;

      let message: DiscoveryMessage;
      let fingerprint: string | undefined;

      if (this.isSignedMessage(raw)) {
        const signedMsg = raw as SignedDiscoveryMessage;
        fingerprint = signedMsg.fingerprint;

        if (this.securityMode === 'signed' || this.securityMode === 'trusted-only') {
          const isValid = await this.verifySignedMessage(signedMsg);
          if (!isValid) {
            return;
          }
        }

        if (this.securityMode === 'trusted-only' && this.keystore) {
          const isTrusted = await this.keystore.isTrusted(fingerprint);
          const isRevoked = await this.keystore.isRevoked(fingerprint);

          if (isRevoked) {
            return;
          }

          if (!isTrusted) {
            if (this.options.security.trust.autoTrustFirst) {
              await this.keystore.addTrustedPeer(
                fingerprint,
                signedMsg.publicKey,
                signedMsg.hostName
              );
            } else {
              return;
            }
          }
        }

        message = {
          type: signedMsg.type,
          hostId: signedMsg.hostId,
          hostName: signedMsg.hostName,
          address: signedMsg.address,
          port: signedMsg.port,
          tailscaleIP: signedMsg.tailscaleIP,
          version: signedMsg.version,
          timestamp: signedMsg.timestamp,
        };
      } else {
        if (this.securityMode !== 'open') {
          return;
        }
        message = raw as DiscoveryMessage;
      }

      const host: Host = {
        id: message.hostId,
        name: message.hostName,
        address: message.address || rinfo.address,
        port: message.port,
        tailscaleIP: message.tailscaleIP,
        status: 'online',
        lastSeen: new Date().toISOString(),
        version: message.version,
        metadata: fingerprint ? { fingerprint } : undefined,
      };

      this.discoveredHosts.set(host.id, host);
      await addKnownHost(host);
      this.options.onDiscover(host, fingerprint);

      if (message.type === 'query') {
        await this.announce();
      }
    } catch {
    }
  }

  private isSignedMessage(msg: unknown): msg is SignedDiscoveryMessage {
    if (typeof msg !== 'object' || msg === null) return false;
    const obj = msg as Record<string, unknown>;
    return (
      typeof obj.signature === 'string' &&
      typeof obj.publicKey === 'string' &&
      typeof obj.fingerprint === 'string'
    );
  }

  private async verifySignedMessage(
    msg: SignedDiscoveryMessage
  ): Promise<boolean> {
    try {
      const publicKey = hexToBytes(msg.publicKey);

      const computedFingerprint = PeerIdentity.computeFingerprint(publicKey);
      if (computedFingerprint !== msg.fingerprint) {
        return false;
      }

      const baseMessage: DiscoveryMessage = {
        type: msg.type,
        hostId: msg.hostId,
        hostName: msg.hostName,
        address: msg.address,
        port: msg.port,
        tailscaleIP: msg.tailscaleIP,
        version: msg.version,
        timestamp: msg.timestamp,
      };

      const messageBytes = new TextEncoder().encode(JSON.stringify(baseMessage));
      const signature = hexToBytes(msg.signature);
      return await PeerIdentity.verify(signature, messageBytes, publicKey);
    } catch {
      return false;
    }
  }
}

export function getLocalIPAddress(): string {
  const interfaces = networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }

  return '127.0.0.1';
}

export async function discoverOnceSecure(
  timeout = 5000,
  options: SecureLocalDiscoveryOptions = {}
): Promise<Host[]> {
  const discovery = new SecureLocalDiscovery(options);
  await discovery.start();
  await discovery.query();

  await new Promise((resolve) => setTimeout(resolve, timeout));

  const hosts = discovery.getDiscoveredHosts();
  await discovery.stop();

  return hosts;
}
