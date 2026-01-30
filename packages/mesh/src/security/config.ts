export type DiscoverySecurityMode = 'open' | 'signed' | 'trusted-only';
export type TransportEncryption = 'none' | 'optional' | 'required';
export type TLSMode = 'none' | 'self-signed' | 'ca-signed';

export interface DiscoverySecurityConfig {
  mode: DiscoverySecurityMode;
}

export interface TransportSecurityConfig {
  encryption: TransportEncryption;
  tls: TLSMode;
  requireAuth: boolean;
}

export interface TrustConfig {
  autoTrustFirst: boolean;
  requireManualApproval: boolean;
  trustedFingerprints?: string[];
}

export interface MeshSecurityConfig {
  identityPath?: string;
  discovery: DiscoverySecurityConfig;
  transport: TransportSecurityConfig;
  trust: TrustConfig;
}

export const SECURITY_PRESETS = {
  development: {
    discovery: { mode: 'open' as const },
    transport: { encryption: 'none' as const, tls: 'none' as const, requireAuth: false },
    trust: { autoTrustFirst: true, requireManualApproval: false },
  },
  signed: {
    discovery: { mode: 'signed' as const },
    transport: { encryption: 'optional' as const, tls: 'none' as const, requireAuth: false },
    trust: { autoTrustFirst: true, requireManualApproval: false },
  },
  secure: {
    discovery: { mode: 'signed' as const },
    transport: { encryption: 'required' as const, tls: 'self-signed' as const, requireAuth: true },
    trust: { autoTrustFirst: true, requireManualApproval: false },
  },
  strict: {
    discovery: { mode: 'trusted-only' as const },
    transport: { encryption: 'required' as const, tls: 'self-signed' as const, requireAuth: true },
    trust: { autoTrustFirst: false, requireManualApproval: true },
  },
} as const;

export type SecurityPreset = keyof typeof SECURITY_PRESETS;

export const DEFAULT_SECURITY_CONFIG: MeshSecurityConfig = {
  ...SECURITY_PRESETS.secure,
};

export function getSecurityPreset(preset: SecurityPreset): MeshSecurityConfig {
  return { ...SECURITY_PRESETS[preset] };
}

export function mergeSecurityConfig(
  base: MeshSecurityConfig,
  overrides: Partial<MeshSecurityConfig>
): MeshSecurityConfig {
  return {
    identityPath: overrides.identityPath ?? base.identityPath,
    discovery: {
      ...base.discovery,
      ...overrides.discovery,
    },
    transport: {
      ...base.transport,
      ...overrides.transport,
    },
    trust: {
      ...base.trust,
      ...overrides.trust,
    },
  };
}

export function validateSecurityConfig(config: MeshSecurityConfig): string[] {
  const errors: string[] = [];

  const validDiscoveryModes: DiscoverySecurityMode[] = ['open', 'signed', 'trusted-only'];
  if (!validDiscoveryModes.includes(config.discovery.mode)) {
    errors.push(`Invalid discovery mode: ${config.discovery.mode}`);
  }

  const validEncryption: TransportEncryption[] = ['none', 'optional', 'required'];
  if (!validEncryption.includes(config.transport.encryption)) {
    errors.push(`Invalid transport encryption: ${config.transport.encryption}`);
  }

  const validTLS: TLSMode[] = ['none', 'self-signed', 'ca-signed'];
  if (!validTLS.includes(config.transport.tls)) {
    errors.push(`Invalid TLS mode: ${config.transport.tls}`);
  }

  if (config.transport.encryption === 'required' && config.transport.tls === 'none') {
    errors.push('Required encryption needs TLS enabled');
  }

  if (config.discovery.mode === 'trusted-only' && !config.trust.trustedFingerprints?.length) {
    if (!config.trust.autoTrustFirst) {
      errors.push('trusted-only discovery requires trustedFingerprints or autoTrustFirst');
    }
  }

  return errors;
}

export function isSecurityEnabled(config: MeshSecurityConfig): boolean {
  return (
    config.discovery.mode !== 'open' ||
    config.transport.encryption !== 'none' ||
    config.transport.requireAuth
  );
}

export function describeSecurityLevel(config: MeshSecurityConfig): string {
  if (
    config.discovery.mode === 'open' &&
    config.transport.encryption === 'none' &&
    !config.transport.requireAuth
  ) {
    return 'development (no security)';
  }

  if (
    config.discovery.mode === 'trusted-only' &&
    config.transport.encryption === 'required' &&
    config.transport.requireAuth
  ) {
    return 'strict (maximum security)';
  }

  if (
    config.discovery.mode === 'signed' &&
    config.transport.encryption === 'required' &&
    config.transport.requireAuth
  ) {
    return 'secure (recommended)';
  }

  if (config.discovery.mode === 'signed') {
    return 'signed (partial security)';
  }

  return 'custom';
}
