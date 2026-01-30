import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { Host } from '../types.js';
import { MESH_VERSION } from '../types.js';

const execAsync = promisify(exec);

export interface TailscaleStatus {
  available: boolean;
  self?: TailscalePeer;
  peers: TailscalePeer[];
  magicDNSSuffix?: string;
}

export interface TailscalePeer {
  id: string;
  name: string;
  tailscaleIP: string;
  hostname: string;
  online: boolean;
  os?: string;
  lastSeen?: string;
}

export async function getTailscaleStatus(): Promise<TailscaleStatus> {
  try {
    const { stdout } = await execAsync('tailscale status --json');
    const status = JSON.parse(stdout);

    const self: TailscalePeer | undefined = status.Self
      ? {
          id: status.Self.ID,
          name: status.Self.HostName,
          tailscaleIP: status.Self.TailscaleIPs?.[0] || '',
          hostname: status.Self.HostName,
          online: status.Self.Online ?? true,
          os: status.Self.OS,
        }
      : undefined;

    const peers: TailscalePeer[] = [];
    if (status.Peer) {
      for (const [id, peer] of Object.entries(status.Peer) as [string, any][]) {
        peers.push({
          id,
          name: peer.HostName,
          tailscaleIP: peer.TailscaleIPs?.[0] || '',
          hostname: peer.HostName,
          online: peer.Online ?? false,
          os: peer.OS,
          lastSeen: peer.LastSeen,
        });
      }
    }

    return {
      available: true,
      self,
      peers,
      magicDNSSuffix: status.MagicDNSSuffix,
    };
  } catch {
    return {
      available: false,
      peers: [],
    };
  }
}

export async function isTailscaleAvailable(): Promise<boolean> {
  try {
    await execAsync('tailscale version');
    return true;
  } catch {
    return false;
  }
}

export async function getTailscaleIP(): Promise<string | null> {
  const status = await getTailscaleStatus();
  return status.self?.tailscaleIP ?? null;
}

export async function discoverTailscaleHosts(skillkitPort: number): Promise<Host[]> {
  const status = await getTailscaleStatus();
  if (!status.available) return [];

  const hosts: Host[] = [];

  for (const peer of status.peers) {
    if (!peer.online) continue;

    hosts.push({
      id: `tailscale-${peer.id}`,
      name: peer.name,
      address: peer.tailscaleIP,
      port: skillkitPort,
      tailscaleIP: peer.tailscaleIP,
      status: 'unknown',
      lastSeen: peer.lastSeen ?? new Date().toISOString(),
      version: MESH_VERSION,
      metadata: {
        discoveredVia: 'tailscale',
        os: peer.os,
      },
    });
  }

  return hosts;
}

export async function resolveTailscaleName(hostname: string): Promise<string | null> {
  const status = await getTailscaleStatus();
  if (!status.available) return null;

  const normalizedName = hostname.toLowerCase();

  for (const peer of status.peers) {
    if (peer.hostname.toLowerCase() === normalizedName || peer.name.toLowerCase() === normalizedName) {
      return peer.tailscaleIP;
    }
  }

  if (status.magicDNSSuffix && hostname.endsWith(status.magicDNSSuffix)) {
    const shortName = hostname.slice(0, -status.magicDNSSuffix.length - 1);
    for (const peer of status.peers) {
      if (peer.hostname.toLowerCase() === shortName.toLowerCase()) {
        return peer.tailscaleIP;
      }
    }
  }

  return null;
}
