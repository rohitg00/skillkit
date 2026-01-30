import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { Peer, PeerRegistration, Host } from '../types.js';
import { getKnownHosts, getLocalHostConfig } from '../config/hosts-config.js';

const PEERS_DIR = join(homedir(), '.skillkit', 'mesh', 'peers');

export interface PeerRegistry {
  peers: Map<string, Peer>;
  localPeers: Map<string, Peer>;
}

export class PeerRegistryManager {
  private registry: PeerRegistry = {
    peers: new Map(),
    localPeers: new Map(),
  };

  async initialize(): Promise<void> {
    await mkdir(PEERS_DIR, { recursive: true });
    await this.loadLocalPeers();
  }

  async registerLocalPeer(registration: PeerRegistration): Promise<Peer> {
    const localConfig = await getLocalHostConfig();

    const peer: Peer = {
      hostId: localConfig.id,
      agentId: registration.agentId,
      agentName: registration.agentName,
      aliases: registration.aliases,
      capabilities: registration.capabilities,
      status: 'online',
      lastSeen: new Date().toISOString(),
    };

    this.registry.localPeers.set(peer.agentId, peer);
    await this.saveLocalPeers();

    return peer;
  }

  async unregisterLocalPeer(agentId: string): Promise<boolean> {
    const deleted = this.registry.localPeers.delete(agentId);
    if (deleted) {
      await this.saveLocalPeers();
    }
    return deleted;
  }

  registerRemotePeer(peer: Peer): void {
    const key = `${peer.hostId}:${peer.agentId}`;
    this.registry.peers.set(key, peer);
  }

  unregisterRemotePeer(hostId: string, agentId: string): boolean {
    const key = `${hostId}:${agentId}`;
    return this.registry.peers.delete(key);
  }

  getPeer(hostId: string, agentId: string): Peer | undefined {
    const key = `${hostId}:${agentId}`;
    return this.registry.peers.get(key);
  }

  getLocalPeer(agentId: string): Peer | undefined {
    return this.registry.localPeers.get(agentId);
  }

  getAllPeers(): Peer[] {
    return [
      ...Array.from(this.registry.localPeers.values()),
      ...Array.from(this.registry.peers.values()),
    ];
  }

  getLocalPeers(): Peer[] {
    return Array.from(this.registry.localPeers.values());
  }

  getRemotePeers(): Peer[] {
    return Array.from(this.registry.peers.values());
  }

  getPeersByHost(hostId: string): Peer[] {
    return this.getAllPeers().filter(p => p.hostId === hostId);
  }

  findPeerByName(name: string): Peer | undefined {
    const lowerName = name.toLowerCase();

    for (const peer of this.getAllPeers()) {
      if (peer.agentName.toLowerCase() === lowerName) {
        return peer;
      }
      if (peer.aliases.some(a => a.toLowerCase() === lowerName)) {
        return peer;
      }
    }

    return undefined;
  }

  findPeersByCapability(capability: string): Peer[] {
    return this.getAllPeers().filter(p => p.capabilities.includes(capability));
  }

  async resolvePeerAddress(nameOrId: string): Promise<{ host: Host; peer: Peer } | null> {
    const parts = nameOrId.split('@');
    const peerName = parts[0];
    const hostName = parts[1];

    if (hostName) {
      const hosts = await getKnownHosts();
      const host = hosts.find(
        h => h.name.toLowerCase() === hostName.toLowerCase() || h.id === hostName
      );

      if (!host) return null;

      const peer = this.getPeersByHost(host.id).find(
        p =>
          p.agentName.toLowerCase() === peerName.toLowerCase() ||
          p.agentId === peerName ||
          p.aliases.some(a => a.toLowerCase() === peerName.toLowerCase())
      );

      if (!peer) return null;

      return { host, peer };
    }

    const peer = this.findPeerByName(peerName);
    if (!peer) return null;

    const hosts = await getKnownHosts();
    const host = hosts.find(h => h.id === peer.hostId);

    if (!host) {
      const localConfig = await getLocalHostConfig();
      if (peer.hostId === localConfig.id) {
        return {
          host: {
            id: localConfig.id,
            name: localConfig.name,
            address: '127.0.0.1',
            port: localConfig.port,
            status: 'online',
            lastSeen: new Date().toISOString(),
          },
          peer,
        };
      }
      return null;
    }

    return { host, peer };
  }

  updatePeerStatus(hostId: string, agentId: string, status: Peer['status']): void {
    const key = `${hostId}:${agentId}`;
    const peer = this.registry.peers.get(key);
    if (peer) {
      peer.status = status;
      peer.lastSeen = new Date().toISOString();
    }
  }

  markHostOffline(hostId: string): void {
    for (const [, peer] of this.registry.peers) {
      if (peer.hostId === hostId) {
        peer.status = 'offline';
      }
    }
  }

  markHostOnline(hostId: string): void {
    for (const [, peer] of this.registry.peers) {
      if (peer.hostId === hostId) {
        peer.status = 'online';
        peer.lastSeen = new Date().toISOString();
      }
    }
  }

  clearRemotePeers(): void {
    this.registry.peers.clear();
  }

  private async loadLocalPeers(): Promise<void> {
    const filePath = join(PEERS_DIR, 'local-peers.json');

    if (!existsSync(filePath)) return;

    try {
      const content = await readFile(filePath, 'utf-8');
      const peers = JSON.parse(content) as Peer[];

      for (const peer of peers) {
        this.registry.localPeers.set(peer.agentId, peer);
      }
    } catch {
    }
  }

  private async saveLocalPeers(): Promise<void> {
    const filePath = join(PEERS_DIR, 'local-peers.json');
    const peers = Array.from(this.registry.localPeers.values());

    await mkdir(PEERS_DIR, { recursive: true });
    await writeFile(filePath, JSON.stringify(peers, null, 2), 'utf-8');
  }
}

let globalRegistry: PeerRegistryManager | null = null;

export async function getPeerRegistry(): Promise<PeerRegistryManager> {
  if (!globalRegistry) {
    globalRegistry = new PeerRegistryManager();
    await globalRegistry.initialize();
  }
  return globalRegistry;
}
