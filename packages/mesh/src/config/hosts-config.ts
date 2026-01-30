import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir, hostname as osHostname } from 'node:os';
import { randomUUID } from 'node:crypto';
import type { Host, HostConfig, HostsFile } from '../types.js';
import { DEFAULT_PORT, MESH_VERSION } from '../types.js';

const HOSTS_FILE_PATH = join(homedir(), '.skillkit', 'hosts.json');

let fileLock: Promise<void> | null = null;

async function withFileLock<T>(fn: () => Promise<T>): Promise<T> {
  while (fileLock) {
    await fileLock;
  }

  let resolve: () => void;
  fileLock = new Promise<void>(r => { resolve = r; });

  try {
    return await fn();
  } finally {
    fileLock = null;
    resolve!();
  }
}

export async function getHostsFilePath(): Promise<string> {
  return HOSTS_FILE_PATH;
}

export async function loadHostsFile(): Promise<HostsFile> {
  if (!existsSync(HOSTS_FILE_PATH)) {
    return createDefaultHostsFile();
  }

  try {
    const content = await readFile(HOSTS_FILE_PATH, 'utf-8');
    return JSON.parse(content) as HostsFile;
  } catch {
    return createDefaultHostsFile();
  }
}

export async function saveHostsFile(hostsFile: HostsFile): Promise<void> {
  await mkdir(dirname(HOSTS_FILE_PATH), { recursive: true });
  hostsFile.lastUpdated = new Date().toISOString();
  await writeFile(HOSTS_FILE_PATH, JSON.stringify(hostsFile, null, 2), 'utf-8');
}

export function createDefaultHostsFile(): HostsFile {
  return {
    version: MESH_VERSION,
    localHost: {
      id: randomUUID(),
      name: getDefaultHostName(),
      port: DEFAULT_PORT,
      autoStart: false,
      discoveryEnabled: true,
    },
    knownHosts: [],
    lastUpdated: new Date().toISOString(),
  };
}

function getDefaultHostName(): string {
  const hostname = osHostname();
  return hostname || `skillkit-host-${randomUUID().slice(0, 8)}`;
}

export async function getLocalHostConfig(): Promise<HostConfig> {
  const hostsFile = await loadHostsFile();
  return hostsFile.localHost;
}

export async function updateLocalHostConfig(updates: Partial<HostConfig>): Promise<HostConfig> {
  return withFileLock(async () => {
    const hostsFile = await loadHostsFile();
    hostsFile.localHost = { ...hostsFile.localHost, ...updates };
    await saveHostsFile(hostsFile);
    return hostsFile.localHost;
  });
}

export async function addKnownHost(host: Host): Promise<void> {
  return withFileLock(async () => {
    const hostsFile = await loadHostsFile();

    const existingIndex = hostsFile.knownHosts.findIndex(h => h.id === host.id);
    if (existingIndex >= 0) {
      hostsFile.knownHosts[existingIndex] = host;
    } else {
      hostsFile.knownHosts.push(host);
    }

    await saveHostsFile(hostsFile);
  });
}

export async function removeKnownHost(hostId: string): Promise<boolean> {
  return withFileLock(async () => {
    const hostsFile = await loadHostsFile();

    const initialLength = hostsFile.knownHosts.length;
    hostsFile.knownHosts = hostsFile.knownHosts.filter(h => h.id !== hostId);

    if (hostsFile.knownHosts.length < initialLength) {
      await saveHostsFile(hostsFile);
      return true;
    }

    return false;
  });
}

export async function getKnownHosts(): Promise<Host[]> {
  const hostsFile = await loadHostsFile();
  return hostsFile.knownHosts;
}

export async function getKnownHost(hostId: string): Promise<Host | undefined> {
  const hosts = await getKnownHosts();
  return hosts.find(h => h.id === hostId);
}

export async function updateKnownHost(hostId: string, updates: Partial<Host>): Promise<Host | null> {
  const hostsFile = await loadHostsFile();

  const index = hostsFile.knownHosts.findIndex(h => h.id === hostId);
  if (index < 0) return null;

  hostsFile.knownHosts[index] = { ...hostsFile.knownHosts[index], ...updates };
  await saveHostsFile(hostsFile);

  return hostsFile.knownHosts[index];
}

export async function initializeHostsFile(): Promise<HostsFile> {
  if (!existsSync(HOSTS_FILE_PATH)) {
    const hostsFile = createDefaultHostsFile();
    await saveHostsFile(hostsFile);
    return hostsFile;
  }
  return loadHostsFile();
}
