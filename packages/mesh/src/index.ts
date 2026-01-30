export * from './types.js';

export {
  loadHostsFile,
  saveHostsFile,
  createDefaultHostsFile,
  getLocalHostConfig,
  updateLocalHostConfig,
  addKnownHost,
  removeKnownHost,
  getKnownHosts,
  getKnownHost,
  updateKnownHost,
  initializeHostsFile,
  getHostsFilePath,
} from './config/index.js';

export {
  LocalDiscovery,
  getLocalIPAddress,
  getAllLocalIPAddresses,
  discoverOnce,
  type LocalDiscoveryOptions,
  SecureLocalDiscovery,
  discoverOnceSecure,
  type SecureLocalDiscoveryOptions,
  getTailscaleStatus,
  isTailscaleAvailable,
  getTailscaleIP,
  discoverTailscaleHosts,
  resolveTailscaleName,
  type TailscaleStatus,
  type TailscalePeer,
} from './discovery/index.js';

export {
  PeerRegistryManager,
  getPeerRegistry,
  type PeerRegistry,
  checkHostHealth,
  checkAllHostsHealth,
  getOnlineHosts,
  getOfflineHosts,
  waitForHost,
  HealthMonitor,
  type HealthCheckOptions,
} from './peer/index.js';

export {
  HttpTransport,
  sendToHost,
  broadcastToHosts,
  type HttpTransportOptions,
  WebSocketTransport,
  WebSocketServer,
  type WebSocketTransportOptions,
  type MessageHandler,
  SecureWebSocketTransport,
  SecureWebSocketServer,
  type SecureWebSocketOptions,
  type SecureMessageHandler,
  SecureHttpTransport,
  sendToHostSecure,
  broadcastToHostsSecure,
  verifySecureMessage,
  type SecureHttpTransportOptions,
} from './transport/index.js';

export {
  PeerIdentity,
  type PeerKeypair,
  type SerializedIdentity,
  MessageEncryption,
  PublicKeyEncryption,
  generateNonce,
  generateMessageId,
  type EncryptedMessage,
  type PublicKeyEncryptedMessage,
  signData,
  verifySignedData,
  isSignedDataExpired,
  extractSignerFingerprint,
  type SignedData,
  type SignatureVerificationResult,
  SecureKeystore,
  getKeystore,
  resetKeystore,
  type KeystoreConfig,
  type TrustedPeer,
  type KeystoreData,
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
} from './crypto/index.js';

export {
  type MeshSecurityConfig,
  type DiscoverySecurityConfig,
  type TransportSecurityConfig,
  type TrustConfig,
  type DiscoverySecurityMode,
  type TransportEncryption,
  type TLSMode,
  type SecurityPreset,
  DEFAULT_SECURITY_CONFIG,
  SECURITY_PRESETS,
  getSecurityPreset,
  mergeSecurityConfig,
  validateSecurityConfig,
  isSecurityEnabled,
  describeSecurityLevel,
  AuthManager,
  extractBearerToken,
  createBearerHeader,
  type AuthToken,
  type AuthChallengeRequest,
  type AuthChallengeResponse,
  type AuthResult,
  TLSManager,
  getTLSManager,
  resetTLSManager,
  type CertificateInfo,
  type TLSConfig,
  type TLSContextOptions,
} from './security/index.js';

export async function initializeMesh(): Promise<void> {
  const { initializeHostsFile } = await import('./config/index.js');
  const { getPeerRegistry } = await import('./peer/index.js');

  await initializeHostsFile();
  await getPeerRegistry();
}

export async function initializeSecureMesh(
  securityConfig?: import('./security/index.js').MeshSecurityConfig
): Promise<{
  identity: import('./crypto/index.js').PeerIdentity;
  keystore: import('./crypto/index.js').SecureKeystore;
}> {
  const { initializeHostsFile } = await import('./config/index.js');
  const { getPeerRegistry } = await import('./peer/index.js');
  const { SecureKeystore } = await import('./crypto/index.js');

  await initializeHostsFile();
  await getPeerRegistry();

  const keystore = new SecureKeystore({
    path: securityConfig?.identityPath,
  });

  const identity = await keystore.loadOrCreateIdentity();

  return { identity, keystore };
}
