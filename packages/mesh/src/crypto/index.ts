export {
  PeerIdentity,
  type PeerKeypair,
  type SerializedIdentity,
} from './identity.js';

export {
  MessageEncryption,
  PublicKeyEncryption,
  generateNonce,
  generateMessageId,
  type EncryptedMessage,
  type PublicKeyEncryptedMessage,
} from './encryption.js';

export {
  signData,
  verifySignedData,
  isSignedDataExpired,
  extractSignerFingerprint,
  type SignedData,
  type SignatureVerificationResult,
} from './signatures.js';

export {
  SecureKeystore,
  getKeystore,
  resetKeystore,
  type KeystoreConfig,
  type TrustedPeer,
  type KeystoreData,
} from './keystore.js';

export {
  encryptData,
  decryptData,
  encryptObject,
  decryptObject,
  encryptFile,
  decryptFile,
  isEncryptedFile,
  deriveKey,
  generateSalt,
  generateIV,
  generateMachineKey,
  hashPassphrase,
  type EncryptedFile,
} from './storage.js';
