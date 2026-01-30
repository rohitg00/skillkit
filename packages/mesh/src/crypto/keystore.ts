import { readFile, writeFile, mkdir, access, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { existsSync } from 'node:fs';
import { PeerIdentity, type SerializedIdentity } from './identity.js';
import {
  encryptObject,
  decryptObject,
  isEncryptedFile,
  generateMachineKey,
} from './storage.js';

export interface KeystoreConfig {
  path?: string;
  encryptionKey?: string;
  useMachineKey?: boolean;
}

export interface TrustedPeer {
  fingerprint: string;
  publicKey: string;
  name?: string;
  addedAt: string;
}

export interface KeystoreData {
  version: '1.0';
  trustedPeers: TrustedPeer[];
  revokedFingerprints: string[];
}

const DEFAULT_KEYSTORE_PATH = join(homedir(), '.skillkit', 'mesh', 'identity');

export class SecureKeystore {
  private path: string;
  private passphrase: string;
  private identity: PeerIdentity | null = null;
  private keystoreData: KeystoreData | null = null;

  constructor(config: KeystoreConfig = {}) {
    this.path = config.path || DEFAULT_KEYSTORE_PATH;

    if (config.encryptionKey) {
      this.passphrase = config.encryptionKey;
    } else if (config.useMachineKey !== false) {
      this.passphrase = generateMachineKey();
    } else {
      throw new Error('Encryption key or machine key required');
    }
  }

  private get keypairPath(): string {
    return join(this.path, 'keypair.enc');
  }

  private get keystoreDataPath(): string {
    return join(this.path, 'keystore.json');
  }

  async ensureDirectory(): Promise<void> {
    if (!existsSync(this.path)) {
      await mkdir(this.path, { recursive: true, mode: 0o700 });
    }
  }

  async loadOrCreateIdentity(): Promise<PeerIdentity> {
    if (this.identity) {
      return this.identity;
    }

    await this.ensureDirectory();

    try {
      await access(this.keypairPath);
      const content = await readFile(this.keypairPath, 'utf-8');
      const encrypted = JSON.parse(content);

      if (isEncryptedFile(encrypted)) {
        const serialized = await decryptObject<SerializedIdentity>(
          encrypted,
          this.passphrase
        );
        this.identity = PeerIdentity.fromSerialized(serialized);
      } else {
        this.identity = PeerIdentity.fromSerialized(encrypted as SerializedIdentity);
      }
    } catch {
      this.identity = await PeerIdentity.generate();
      await this.saveIdentity();
    }

    return this.identity;
  }

  async saveIdentity(): Promise<void> {
    if (!this.identity) {
      throw new Error('No identity to save');
    }

    await this.ensureDirectory();
    const serialized = this.identity.serialize();
    const encrypted = await encryptObject(serialized, this.passphrase);
    await writeFile(this.keypairPath, JSON.stringify(encrypted, null, 2), {
      mode: 0o600,
    });
  }

  async getIdentity(): Promise<PeerIdentity | null> {
    return this.identity;
  }

  async hasIdentity(): Promise<boolean> {
    try {
      await access(this.keypairPath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteIdentity(): Promise<void> {
    try {
      await unlink(this.keypairPath);
      this.identity = null;
    } catch {
    }
  }

  private async loadKeystoreData(): Promise<KeystoreData> {
    if (this.keystoreData) {
      return this.keystoreData;
    }

    try {
      await access(this.keystoreDataPath);
      const content = await readFile(this.keystoreDataPath, 'utf-8');
      this.keystoreData = JSON.parse(content) as KeystoreData;
    } catch {
      this.keystoreData = {
        version: '1.0',
        trustedPeers: [],
        revokedFingerprints: [],
      };
    }

    return this.keystoreData;
  }

  private async saveKeystoreData(): Promise<void> {
    if (!this.keystoreData) return;
    await this.ensureDirectory();
    await writeFile(
      this.keystoreDataPath,
      JSON.stringify(this.keystoreData, null, 2),
      { mode: 0o600 }
    );
  }

  async addTrustedPeer(
    fingerprint: string,
    publicKey: string,
    name?: string
  ): Promise<void> {
    const data = await this.loadKeystoreData();

    const existing = data.trustedPeers.findIndex(
      (p) => p.fingerprint === fingerprint
    );
    if (existing >= 0) {
      data.trustedPeers[existing] = {
        fingerprint,
        publicKey,
        name,
        addedAt: new Date().toISOString(),
      };
    } else {
      data.trustedPeers.push({
        fingerprint,
        publicKey,
        name,
        addedAt: new Date().toISOString(),
      });
    }

    const revokedIndex = data.revokedFingerprints.indexOf(fingerprint);
    if (revokedIndex >= 0) {
      data.revokedFingerprints.splice(revokedIndex, 1);
    }

    await this.saveKeystoreData();
  }

  async removeTrustedPeer(fingerprint: string): Promise<void> {
    const data = await this.loadKeystoreData();
    data.trustedPeers = data.trustedPeers.filter(
      (p) => p.fingerprint !== fingerprint
    );
    await this.saveKeystoreData();
  }

  async revokePeer(fingerprint: string): Promise<void> {
    const data = await this.loadKeystoreData();

    data.trustedPeers = data.trustedPeers.filter(
      (p) => p.fingerprint !== fingerprint
    );

    if (!data.revokedFingerprints.includes(fingerprint)) {
      data.revokedFingerprints.push(fingerprint);
    }

    await this.saveKeystoreData();
  }

  async isRevoked(fingerprint: string): Promise<boolean> {
    const data = await this.loadKeystoreData();
    return data.revokedFingerprints.includes(fingerprint);
  }

  async isTrusted(fingerprint: string): Promise<boolean> {
    const data = await this.loadKeystoreData();
    return data.trustedPeers.some((p) => p.fingerprint === fingerprint);
  }

  async getTrustedPeer(fingerprint: string): Promise<TrustedPeer | null> {
    const data = await this.loadKeystoreData();
    return data.trustedPeers.find((p) => p.fingerprint === fingerprint) || null;
  }

  async getTrustedPeers(): Promise<TrustedPeer[]> {
    const data = await this.loadKeystoreData();
    return [...data.trustedPeers];
  }

  async getRevokedFingerprints(): Promise<string[]> {
    const data = await this.loadKeystoreData();
    return [...data.revokedFingerprints];
  }

  async clearRevokedPeers(): Promise<void> {
    const data = await this.loadKeystoreData();
    data.revokedFingerprints = [];
    await this.saveKeystoreData();
  }

  async exportPublicInfo(): Promise<{ fingerprint: string; publicKey: string }> {
    const identity = await this.loadOrCreateIdentity();
    return {
      fingerprint: identity.fingerprint,
      publicKey: identity.publicKeyHex,
    };
  }
}

let globalKeystore: SecureKeystore | null = null;

export function getKeystore(config?: KeystoreConfig): SecureKeystore {
  if (!globalKeystore) {
    globalKeystore = new SecureKeystore(config);
  }
  return globalKeystore;
}

export function resetKeystore(): void {
  globalKeystore = null;
}
