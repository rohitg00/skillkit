export type HostStatus = 'online' | 'offline' | 'unknown';

export interface Host {
  id: string;
  name: string;
  address: string;
  port: number;
  tailscaleIP?: string;
  status: HostStatus;
  lastSeen: string;
  version?: string;
  metadata?: Record<string, unknown>;
}

export interface Peer {
  hostId: string;
  agentId: string;
  agentName: string;
  aliases: string[];
  capabilities: string[];
  status: HostStatus;
  lastSeen: string;
}

export interface PeerMesh {
  localHost: Host;
  peers: Map<string, Peer>;
  hosts: Map<string, Host>;
}

export interface HostConfig {
  id: string;
  name: string;
  port: number;
  tailscaleIP?: string;
  autoStart?: boolean;
  discoveryEnabled?: boolean;
  discoveryPort?: number;
}

export interface HostsFile {
  version: string;
  localHost: HostConfig;
  knownHosts: Host[];
  lastUpdated: string;
}

export interface DiscoveryMessage {
  type: 'announce' | 'query' | 'response';
  hostId: string;
  hostName: string;
  address: string;
  port: number;
  tailscaleIP?: string;
  version: string;
  timestamp: string;
}

export interface SignedDiscoveryMessage extends DiscoveryMessage {
  signature: string;
  publicKey: string;
  fingerprint: string;
}

export interface HealthCheckResult {
  hostId: string;
  address: string;
  port: number;
  status: HostStatus;
  latencyMs: number;
  error?: string;
  checkedAt: string;
}

export interface PeerRegistration {
  hostId: string;
  agentId: string;
  agentName: string;
  aliases: string[];
  capabilities: string[];
}

export interface TransportMessage {
  id: string;
  type: string;
  from: string;
  to: string;
  payload: unknown;
  timestamp: string;
}

export interface SecureTransportMessage extends TransportMessage {
  signature: string;
  senderFingerprint: string;
  senderPublicKey: string;
  nonce: string;
  encrypted?: boolean;
}

export interface EncryptedTransportMessage {
  id: string;
  senderFingerprint: string;
  nonce: string;
  ciphertext: string;
  timestamp: string;
}

export interface TransportOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface SecureTransportOptions extends TransportOptions {
  requireEncryption?: boolean;
  requireAuth?: boolean;
  authToken?: string;
}

export const DEFAULT_PORT = 9876;
export const DEFAULT_DISCOVERY_PORT = 9877;
export const HEALTH_CHECK_TIMEOUT = 5000;
export const DISCOVERY_INTERVAL = 30000;
export const MESH_VERSION = '1.7.11';
