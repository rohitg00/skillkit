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
} from './config.js';

export {
  AuthManager,
  extractBearerToken,
  createBearerHeader,
  type AuthToken,
  type AuthChallengeRequest,
  type AuthChallengeResponse,
  type AuthResult,
} from './auth.js';

export {
  TLSManager,
  getTLSManager,
  resetTLSManager,
  type CertificateInfo,
  type TLSConfig,
  type TLSContextOptions,
} from './tls.js';
