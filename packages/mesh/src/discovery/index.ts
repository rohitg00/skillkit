export {
  LocalDiscovery,
  getLocalIPAddress,
  getAllLocalIPAddresses,
  discoverOnce,
  type LocalDiscoveryOptions,
} from './local.js';

export {
  getTailscaleStatus,
  isTailscaleAvailable,
  getTailscaleIP,
  discoverTailscaleHosts,
  resolveTailscaleName,
  type TailscaleStatus,
  type TailscalePeer,
} from './tailscale.js';
