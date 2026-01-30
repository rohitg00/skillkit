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
} from './transport/index.js';

export async function initializeMesh(): Promise<void> {
  const { initializeHostsFile } = await import('./config/index.js');
  const { getPeerRegistry } = await import('./peer/index.js');

  await initializeHostsFile();
  await getPeerRegistry();
}
