import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt,
  createHash,
  type ScryptOptions,
} from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { existsSync } from 'node:fs';

export interface EncryptedFile {
  version: '2.0';
  encrypted: true;
  algorithm: 'aes-256-gcm';
  kdf: 'scrypt';
  salt: string;
  iv: string;
  ciphertext: string;
  authTag: string;
}

export interface EncryptionParams {
  salt: Uint8Array;
  iv: Uint8Array;
  authTag: Buffer;
}

const SCRYPT_N = 2 ** 14;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SALT_LENGTH = 32;

export function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const options: ScryptOptions = {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
    };
    scrypt(passphrase, salt, KEY_LENGTH, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export function generateSalt(): Uint8Array {
  return randomBytes(SALT_LENGTH);
}

export function generateIV(): Uint8Array {
  return randomBytes(IV_LENGTH);
}

export function encrypt(
  data: Uint8Array,
  key: Buffer,
  iv: Uint8Array
): { ciphertext: Buffer; authTag: Buffer } {
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, authTag };
}

export function decrypt(
  ciphertext: Buffer,
  key: Buffer,
  iv: Uint8Array,
  authTag: Buffer
): Buffer {
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export async function encryptData(
  data: Uint8Array | string,
  passphrase: string
): Promise<EncryptedFile> {
  const dataBytes =
    typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(passphrase, salt);
  const { ciphertext, authTag } = encrypt(dataBytes, key, iv);

  return {
    version: '2.0',
    encrypted: true,
    algorithm: 'aes-256-gcm',
    kdf: 'scrypt',
    salt: Buffer.from(salt).toString('hex'),
    iv: Buffer.from(iv).toString('hex'),
    ciphertext: ciphertext.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export async function decryptData(
  encrypted: EncryptedFile,
  passphrase: string
): Promise<Buffer> {
  if (encrypted.version !== '2.0' || !encrypted.encrypted) {
    throw new Error('Invalid encrypted file format');
  }

  const salt = Buffer.from(encrypted.salt, 'hex');
  const iv = Buffer.from(encrypted.iv, 'hex');
  const ciphertext = Buffer.from(encrypted.ciphertext, 'hex');
  const authTag = Buffer.from(encrypted.authTag, 'hex');
  const key = await deriveKey(passphrase, salt);

  return decrypt(ciphertext, key, iv, authTag);
}

export async function encryptObject(
  obj: unknown,
  passphrase: string
): Promise<EncryptedFile> {
  const json = JSON.stringify(obj);
  return encryptData(json, passphrase);
}

export async function decryptObject<T = unknown>(
  encrypted: EncryptedFile,
  passphrase: string
): Promise<T> {
  const decrypted = await decryptData(encrypted, passphrase);
  return JSON.parse(decrypted.toString('utf-8')) as T;
}

export async function encryptFile(
  data: unknown,
  passphrase: string,
  outputPath: string
): Promise<void> {
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const encrypted = await encryptObject(data, passphrase);
  await writeFile(outputPath, JSON.stringify(encrypted, null, 2));
}

export async function decryptFile<T = unknown>(
  inputPath: string,
  passphrase: string
): Promise<T> {
  const content = await readFile(inputPath, 'utf-8');
  const encrypted = JSON.parse(content) as EncryptedFile;
  return decryptObject<T>(encrypted, passphrase);
}

export function isEncryptedFile(data: unknown): data is EncryptedFile {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.version === '2.0' &&
    obj.encrypted === true &&
    obj.algorithm === 'aes-256-gcm' &&
    obj.kdf === 'scrypt' &&
    typeof obj.salt === 'string' &&
    typeof obj.iv === 'string' &&
    typeof obj.ciphertext === 'string' &&
    typeof obj.authTag === 'string'
  );
}

export function hashPassphrase(passphrase: string): string {
  return createHash('sha256').update(passphrase).digest('hex').slice(0, 16);
}

export function generateMachineKey(): string {
  const hostname = process.env.HOSTNAME || 'unknown';
  const user = process.env.USER || process.env.USERNAME || 'unknown';
  const combined = `skillkit-mesh-${hostname}-${user}`;
  return createHash('sha256').update(combined).digest('hex');
}
