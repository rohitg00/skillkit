import { createSocket, Socket } from 'node:dgram';
import { networkInterfaces } from 'node:os';
import type { DiscoveryMessage, Host } from '../types.js';
import { DEFAULT_DISCOVERY_PORT, MESH_VERSION } from '../types.js';
import { getLocalHostConfig, addKnownHost } from '../config/hosts-config.js';

const MULTICAST_ADDR = '239.255.255.250';
const DISCOVERY_INTERVAL_MS = 30000;

export interface LocalDiscoveryOptions {
  port?: number;
  interval?: number;
  onDiscover?: (host: Host) => void;
}

export class LocalDiscovery {
  private socket: Socket | null = null;
  private announceInterval: NodeJS.Timeout | null = null;
  private running = false;
  private options: Required<LocalDiscoveryOptions>;
  private discoveredHosts: Map<string, Host> = new Map();

  constructor(options: LocalDiscoveryOptions = {}) {
    this.options = {
      port: options.port ?? DEFAULT_DISCOVERY_PORT,
      interval: options.interval ?? DISCOVERY_INTERVAL_MS,
      onDiscover: options.onDiscover ?? (() => {}),
    };
  }

  async start(): Promise<void> {
    if (this.running) return;

    this.socket = createSocket({ type: 'udp4', reuseAddr: true });

    this.socket.on('message', (msg, rinfo) => {
      this.handleMessage(msg, rinfo);
    });

    this.socket.on('error', err => {
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

    const message: DiscoveryMessage = {
      type: 'announce',
      hostId: localConfig.id,
      hostName: localConfig.name,
      address: localAddress,
      port: localConfig.port,
      tailscaleIP: localConfig.tailscaleIP,
      version: MESH_VERSION,
      timestamp: new Date().toISOString(),
    };

    const buffer = Buffer.from(JSON.stringify(message));

    this.socket.send(buffer, 0, buffer.length, this.options.port, MULTICAST_ADDR);
  }

  async query(): Promise<void> {
    if (!this.socket || !this.running) return;

    const localConfig = await getLocalHostConfig();
    const localAddress = getLocalIPAddress();

    const message: DiscoveryMessage = {
      type: 'query',
      hostId: localConfig.id,
      hostName: localConfig.name,
      address: localAddress,
      port: localConfig.port,
      version: MESH_VERSION,
      timestamp: new Date().toISOString(),
    };

    const buffer = Buffer.from(JSON.stringify(message));

    this.socket.send(buffer, 0, buffer.length, this.options.port, MULTICAST_ADDR);
  }

  getDiscoveredHosts(): Host[] {
    return Array.from(this.discoveredHosts.values());
  }

  isRunning(): boolean {
    return this.running;
  }

  private async handleMessage(msg: Buffer, rinfo: { address: string; port: number }): Promise<void> {
    try {
      const message = JSON.parse(msg.toString()) as DiscoveryMessage;

      const localConfig = await getLocalHostConfig();
      if (message.hostId === localConfig.id) return;

      const host: Host = {
        id: message.hostId,
        name: message.hostName,
        address: message.address || rinfo.address,
        port: message.port,
        tailscaleIP: message.tailscaleIP,
        status: 'online',
        lastSeen: new Date().toISOString(),
        version: message.version,
      };

      this.discoveredHosts.set(host.id, host);

      await addKnownHost(host);

      this.options.onDiscover(host);

      if (message.type === 'query') {
        await this.announce();
      }
    } catch {
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

export function getAllLocalIPAddresses(): string[] {
  const addresses: string[] = [];
  const interfaces = networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        addresses.push(addr.address);
      }
    }
  }

  return addresses;
}

export async function discoverOnce(timeout = 5000): Promise<Host[]> {
  const discovery = new LocalDiscovery();
  await discovery.start();
  await discovery.query();

  await new Promise(resolve => setTimeout(resolve, timeout));

  const hosts = discovery.getDiscoveredHosts();
  await discovery.stop();

  return hosts;
}
