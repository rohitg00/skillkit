export {
  LocalDiscovery,
  getLocalIPAddress,
  getAllLocalIPAddresses,
  discoverOnce,
  type LocalDiscoveryOptions,
} from './local.js';

export {
  SecureLocalDiscovery,
  discoverOnceSecure,
  type SecureLocalDiscoveryOptions,
} from './secure-local.js';

export {
  getTailscaleStatus,
  isTailscaleAvailable,
  getTailscaleIP,
  discoverTailscaleHosts,
  resolveTailscaleName,
  type TailscaleStatus,
  type TailscalePeer,
} from './tailscale.js';
