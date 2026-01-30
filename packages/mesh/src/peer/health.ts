import got from 'got';
import type { Host, HealthCheckResult, HostStatus } from '../types.js';
import { HEALTH_CHECK_TIMEOUT } from '../types.js';
import { getKnownHosts, updateKnownHost } from '../config/hosts-config.js';

export interface HealthCheckOptions {
  timeout?: number;
  updateStatus?: boolean;
}

export async function checkHostHealth(
  host: Host,
  options: HealthCheckOptions = {}
): Promise<HealthCheckResult> {
  const timeout = options.timeout ?? HEALTH_CHECK_TIMEOUT;
  const startTime = Date.now();

  const result: HealthCheckResult = {
    hostId: host.id,
    address: host.address,
    port: host.port,
    status: 'unknown',
    latencyMs: 0,
    checkedAt: new Date().toISOString(),
  };

  try {
    const url = `http://${host.address}:${host.port}/health`;

    const response = await got.get(url, {
      timeout: { request: timeout },
      retry: { limit: 0 },
      throwHttpErrors: false,
    });

    result.latencyMs = Date.now() - startTime;

    if (response.statusCode === 200) {
      result.status = 'online';
    } else {
      result.status = 'offline';
      result.error = `HTTP ${response.statusCode}`;
    }
  } catch (err: any) {
    result.latencyMs = Date.now() - startTime;
    result.status = 'offline';
    result.error = err.code || err.message || 'Connection failed';
  }

  if (options.updateStatus !== false) {
    await updateKnownHost(host.id, {
      status: result.status,
      lastSeen: result.status === 'online' ? result.checkedAt : host.lastSeen,
    });
  }

  return result;
}

export async function checkAllHostsHealth(
  options: HealthCheckOptions = {}
): Promise<HealthCheckResult[]> {
  const hosts = await getKnownHosts();

  const results = await Promise.all(hosts.map(host => checkHostHealth(host, options)));

  return results;
}

export async function getOnlineHosts(): Promise<Host[]> {
  const hosts = await getKnownHosts();
  return hosts.filter(h => h.status === 'online');
}

export async function getOfflineHosts(): Promise<Host[]> {
  const hosts = await getKnownHosts();
  return hosts.filter(h => h.status === 'offline');
}

export async function waitForHost(
  host: Host,
  maxWaitMs = 30000,
  intervalMs = 1000
): Promise<boolean> {
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    const result = await checkHostHealth(host, { updateStatus: false });

    if (result.status === 'online') {
      await updateKnownHost(host.id, {
        status: 'online',
        lastSeen: new Date().toISOString(),
      });
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return false;
}

export class HealthMonitor {
  private interval: NodeJS.Timeout | null = null;
  private running = false;
  private checking = false;
  private onStatusChange?: (host: Host, oldStatus: HostStatus, newStatus: HostStatus) => void;

  constructor(options: { onStatusChange?: (host: Host, oldStatus: HostStatus, newStatus: HostStatus) => void } = {}) {
    this.onStatusChange = options.onStatusChange;
  }

  async start(intervalMs = 30000): Promise<void> {
    if (this.running) return;

    this.running = true;

    await this.checkAll();

    this.interval = setInterval(() => {
      if (!this.checking) {
        this.checking = true;
        this.checkAll().finally(() => {
          this.checking = false;
        });
      }
    }, intervalMs);
  }

  stop(): void {
    if (!this.running) return;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  private async checkAll(): Promise<void> {
    const hosts = await getKnownHosts();

    for (const host of hosts) {
      const oldStatus = host.status;
      const result = await checkHostHealth(host);

      if (this.onStatusChange && oldStatus !== result.status) {
        this.onStatusChange(host, oldStatus, result.status);
      }
    }
  }
}
