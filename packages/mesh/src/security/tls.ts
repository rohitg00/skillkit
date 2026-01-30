import {
  generateKeyPairSync,
  createHash,
} from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface TLSContextOptions {
  cert?: string;
  key?: string;
  ca?: string[];
  requestCert?: boolean;
  rejectUnauthorized?: boolean;
}

export interface CertificateInfo {
  cert: string;
  key: string;
  fingerprint: string;
  notBefore: Date;
  notAfter: Date;
  subject: string;
}

export interface TLSConfig {
  certPath?: string;
  keyPath?: string;
  caPath?: string;
  rejectUnauthorized?: boolean;
}

const DEFAULT_CERT_PATH = join(homedir(), '.skillkit', 'mesh', 'certs');

function generateSelfSignedCertificate(
  hostId: string,
  hostName: string,
  validDays: number = 365
): { cert: string; key: string } {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const notBefore = new Date();
  const notAfter = new Date();
  notAfter.setDate(notAfter.getDate() + validDays);

  const serialNumber = createHash('sha256')
    .update(hostId + Date.now().toString())
    .digest('hex')
    .slice(0, 16);

  const certPem = createSimpleCert({
    publicKey: publicKey as string,
    privateKey: privateKey as string,
    subject: `CN=${hostName},O=SkillKit Mesh,OU=${hostId}`,
    issuer: `CN=${hostName},O=SkillKit Mesh,OU=${hostId}`,
    serialNumber,
    notBefore,
    notAfter,
    altNames: ['localhost', '127.0.0.1', hostName],
  });

  return {
    cert: certPem,
    key: privateKey as string,
  };
}

interface CertParams {
  publicKey: string;
  privateKey: string;
  subject: string;
  issuer: string;
  serialNumber: string;
  notBefore: Date;
  notAfter: Date;
  altNames: string[];
}

function createSimpleCert(params: CertParams): string {
  const base64Encode = (str: string): string =>
    Buffer.from(str).toString('base64');

  const formatDate = (date: Date): string => {
    const y = date.getUTCFullYear().toString().slice(-2);
    const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const d = date.getUTCDate().toString().padStart(2, '0');
    const h = date.getUTCHours().toString().padStart(2, '0');
    const min = date.getUTCMinutes().toString().padStart(2, '0');
    const s = date.getUTCSeconds().toString().padStart(2, '0');
    return `${y}${m}${d}${h}${min}${s}Z`;
  };

  const certInfo = {
    version: 3,
    serialNumber: params.serialNumber,
    subject: params.subject,
    issuer: params.issuer,
    notBefore: formatDate(params.notBefore),
    notAfter: formatDate(params.notAfter),
    publicKey: params.publicKey,
    altNames: params.altNames,
  };

  const certData = JSON.stringify(certInfo);
  const certBase64 = base64Encode(certData);

  const lines: string[] = ['-----BEGIN CERTIFICATE-----'];
  for (let i = 0; i < certBase64.length; i += 64) {
    lines.push(certBase64.slice(i, i + 64));
  }
  lines.push('-----END CERTIFICATE-----');

  return lines.join('\n');
}

export class TLSManager {
  private certPath: string;

  constructor(certPath?: string) {
    this.certPath = certPath || DEFAULT_CERT_PATH;
  }

  async ensureDirectory(): Promise<void> {
    if (!existsSync(this.certPath)) {
      await mkdir(this.certPath, { recursive: true, mode: 0o700 });
    }
  }

  async generateCertificate(
    hostId: string,
    hostName: string = 'localhost',
    validDays: number = 365
  ): Promise<CertificateInfo> {
    await this.ensureDirectory();

    const { cert, key } = generateSelfSignedCertificate(
      hostId,
      hostName,
      validDays
    );

    const certFile = join(this.certPath, `${hostId}.crt`);
    const keyFile = join(this.certPath, `${hostId}.key`);

    await writeFile(certFile, cert, { mode: 0o644 });
    await writeFile(keyFile, key, { mode: 0o600 });

    const fingerprint = createHash('sha256').update(cert).digest('hex');
    const notBefore = new Date();
    const notAfter = new Date();
    notAfter.setDate(notAfter.getDate() + validDays);

    return {
      cert,
      key,
      fingerprint,
      notBefore,
      notAfter,
      subject: `CN=${hostName},O=SkillKit Mesh,OU=${hostId}`,
    };
  }

  async loadCertificate(hostId: string): Promise<CertificateInfo | null> {
    const certFile = join(this.certPath, `${hostId}.crt`);
    const keyFile = join(this.certPath, `${hostId}.key`);

    if (!existsSync(certFile) || !existsSync(keyFile)) {
      return null;
    }

    const cert = await readFile(certFile, 'utf-8');
    const key = await readFile(keyFile, 'utf-8');
    const fingerprint = createHash('sha256').update(cert).digest('hex');

    return {
      cert,
      key,
      fingerprint,
      notBefore: new Date(),
      notAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      subject: hostId,
    };
  }

  async loadOrCreateCertificate(
    hostId: string,
    hostName: string = 'localhost'
  ): Promise<CertificateInfo> {
    const existing = await this.loadCertificate(hostId);
    if (existing) {
      return existing;
    }
    return this.generateCertificate(hostId, hostName);
  }

  async hasCertificate(hostId: string): Promise<boolean> {
    const certFile = join(this.certPath, `${hostId}.crt`);
    return existsSync(certFile);
  }

  getCertificatePath(hostId: string): { certPath: string; keyPath: string } {
    return {
      certPath: join(this.certPath, `${hostId}.crt`),
      keyPath: join(this.certPath, `${hostId}.key`),
    };
  }

  createServerContext(
    certInfo: CertificateInfo,
    options?: { requestClientCert?: boolean; trustedCAs?: string[] }
  ): TLSContextOptions {
    const context: TLSContextOptions = {
      cert: certInfo.cert,
      key: certInfo.key,
      requestCert: options?.requestClientCert ?? false,
      rejectUnauthorized: false,
    };

    if (options?.trustedCAs?.length) {
      context.ca = options.trustedCAs;
      context.rejectUnauthorized = true;
    }

    return context;
  }

  createClientContext(
    certInfo?: CertificateInfo,
    options?: { serverFingerprint?: string; trustedCAs?: string[] }
  ): TLSContextOptions {
    const context: TLSContextOptions = {
      rejectUnauthorized: false,
    };

    if (certInfo) {
      context.cert = certInfo.cert;
      context.key = certInfo.key;
    }

    if (options?.trustedCAs?.length) {
      context.ca = options.trustedCAs;
    }

    return context;
  }

  static computeCertFingerprint(cert: string): string {
    return createHash('sha256').update(cert).digest('hex');
  }

  static verifyCertFingerprint(
    cert: string,
    expectedFingerprint: string
  ): boolean {
    const actual = TLSManager.computeCertFingerprint(cert);
    return actual.toLowerCase() === expectedFingerprint.toLowerCase();
  }
}

let globalTLSManager: TLSManager | null = null;

export function getTLSManager(certPath?: string): TLSManager {
  if (!globalTLSManager) {
    globalTLSManager = new TLSManager(certPath);
  }
  return globalTLSManager;
}

export function resetTLSManager(): void {
  globalTLSManager = null;
}
