import { Command, Option } from 'clipanion';
import chalk from 'chalk';

export class MeshCommand extends Command {
  static override paths = [['mesh']];

  static override usage = Command.Usage({
    description: 'Manage peer mesh network for multi-machine agent distribution',
    details: `
      The mesh command helps you manage a peer-to-peer network of hosts
      running SkillKit agents across multiple machines.

      Subcommands:
      - init:      Initialize local host for mesh networking
      - add:       Add a peer host to the network
      - remove:    Remove a host from the network
      - list:      List all known hosts and peers
      - health:    Check health of all hosts
      - discover:  Discover hosts on local network
      - status:    Show mesh network status
    `,
    examples: [
      ['Initialize mesh', '$0 mesh init'],
      ['Add a host', '$0 mesh add 192.168.1.100:9876'],
      ['Add with name', '$0 mesh add 192.168.1.100 --name workstation'],
      ['Remove a host', '$0 mesh remove <hostId>'],
      ['List all hosts', '$0 mesh list'],
      ['Check health', '$0 mesh health'],
      ['Discover hosts', '$0 mesh discover'],
    ],
  });

  action = Option.String({ required: false });
  arg = Option.String({ required: false });
  name = Option.String('--name,-n', { description: 'Name for the host' });
  port = Option.String('--port,-p', { description: 'Port number' });
  tailscale = Option.Boolean('--tailscale,-t', false, { description: 'Include Tailscale peers' });
  timeout = Option.String('--timeout', { description: 'Timeout in milliseconds' });
  json = Option.Boolean('--json,-j', false, { description: 'Output in JSON format' });
  verbose = Option.Boolean('--verbose,-v', false, { description: 'Show detailed output' });

  async execute(): Promise<number> {
    const action = this.action || 'status';

    switch (action) {
      case 'init':
        return this.initMesh();
      case 'add':
        return this.addHost();
      case 'remove':
        return this.removeHost();
      case 'list':
        return this.listHosts();
      case 'health':
        return this.checkHealth();
      case 'discover':
        return this.discoverHosts();
      case 'status':
        return this.showStatus();
      default:
        console.error(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.gray('Available actions: init, add, remove, list, health, discover, status'));
        return 1;
    }
  }

  private async initMesh(): Promise<number> {
    try {
      const { initializeHostsFile, getLocalIPAddress, isTailscaleAvailable, getTailscaleIP } = await import('@skillkit/mesh');

      const hostsFile = await initializeHostsFile();
      const localConfig = hostsFile.localHost;
      const localIP = getLocalIPAddress();

      console.log(chalk.green('✓ Mesh network initialized\n'));

      console.log(chalk.bold('Local Host Configuration:'));
      console.log(`  ID: ${chalk.cyan(localConfig.id.slice(0, 8))}`);
      console.log(`  Name: ${localConfig.name}`);
      console.log(`  Address: ${localIP}:${localConfig.port}`);

      const hasTailscale = await isTailscaleAvailable();
      if (hasTailscale) {
        const tailscaleIP = await getTailscaleIP();
        if (tailscaleIP) {
          console.log(`  Tailscale: ${tailscaleIP}:${localConfig.port}`);
        }
      }

      console.log();
      console.log(chalk.gray('Other hosts can connect to this machine using:'));
      console.log(chalk.gray(`  skillkit mesh add ${localIP}:${localConfig.port}`));

      return 0;
    } catch (err: any) {
      console.error(chalk.red(`Failed to initialize mesh: ${err.message}`));
      return 1;
    }
  }

  private async addHost(): Promise<number> {
    if (!this.arg) {
      console.error(chalk.red('Error: Host address is required'));
      console.log(chalk.gray('Usage: skillkit mesh add <address>[:port]'));
      return 1;
    }

    try {
      const { addKnownHost, DEFAULT_PORT } = await import('@skillkit/mesh');
      const { randomUUID } = await import('node:crypto');

      const [address, portStr] = this.arg.split(':');
      const port = portStr ? parseInt(portStr, 10) : (this.port ? parseInt(this.port, 10) : DEFAULT_PORT);

      const host = {
        id: randomUUID(),
        name: this.name || address,
        address,
        port,
        status: 'unknown' as const,
        lastSeen: new Date().toISOString(),
      };

      await addKnownHost(host);

      console.log(chalk.green(`✓ Added host: ${host.name}`));
      console.log(`  ID: ${chalk.gray(host.id.slice(0, 8))}`);
      console.log(`  Address: ${host.address}:${host.port}`);

      console.log(chalk.gray('\nRun "skillkit mesh health" to verify connectivity.'));

      return 0;
    } catch (err: any) {
      console.error(chalk.red(`Failed to add host: ${err.message}`));
      return 1;
    }
  }

  private async removeHost(): Promise<number> {
    if (!this.arg) {
      console.error(chalk.red('Error: Host ID is required'));
      console.log(chalk.gray('Usage: skillkit mesh remove <hostId>'));
      return 1;
    }

    try {
      const { removeKnownHost, getKnownHosts } = await import('@skillkit/mesh');

      const hosts = await getKnownHosts();
      const host = hosts.find(h => h.id === this.arg || h.id.startsWith(this.arg!) || h.name === this.arg);

      if (!host) {
        console.error(chalk.red(`Host not found: ${this.arg}`));
        return 1;
      }

      const removed = await removeKnownHost(host.id);

      if (removed) {
        console.log(chalk.green(`✓ Removed host: ${host.name}`));
      } else {
        console.error(chalk.red('Failed to remove host'));
        return 1;
      }

      return 0;
    } catch (err: any) {
      console.error(chalk.red(`Failed to remove host: ${err.message}`));
      return 1;
    }
  }

  private async listHosts(): Promise<number> {
    try {
      const { getKnownHosts, getLocalHostConfig, getLocalIPAddress, discoverTailscaleHosts, isTailscaleAvailable } = await import('@skillkit/mesh');

      const localConfig = await getLocalHostConfig();
      const localIP = getLocalIPAddress();
      const hosts = await getKnownHosts();

      if (this.json) {
        console.log(JSON.stringify({ localHost: { ...localConfig, address: localIP }, hosts }, null, 2));
        return 0;
      }

      console.log(chalk.bold('\nLocal Host:\n'));
      console.log(`  ${chalk.cyan('●')} ${localConfig.name} ${chalk.green('[local]')}`);
      console.log(`    ID: ${chalk.gray(localConfig.id.slice(0, 8))}`);
      console.log(`    Address: ${localIP}:${localConfig.port}`);

      console.log(chalk.bold('\nKnown Hosts:\n'));

      if (hosts.length === 0) {
        console.log(chalk.gray('  No hosts configured.'));
        console.log(chalk.gray('  Add hosts with: skillkit mesh add <address>'));
      } else {
        for (const host of hosts) {
          const statusIcon = host.status === 'online' ? chalk.green('●') : host.status === 'offline' ? chalk.red('●') : chalk.gray('○');
          const statusLabel = host.status === 'online' ? chalk.green('[online]') : host.status === 'offline' ? chalk.red('[offline]') : chalk.gray('[unknown]');

          console.log(`  ${statusIcon} ${host.name} ${statusLabel}`);
          console.log(`    ID: ${chalk.gray(host.id.slice(0, 8))}`);
          console.log(`    Address: ${host.address}:${host.port}`);
          if (host.tailscaleIP) {
            console.log(`    Tailscale: ${host.tailscaleIP}`);
          }
          if (this.verbose) {
            console.log(`    Last seen: ${new Date(host.lastSeen).toLocaleString()}`);
          }
        }
      }

      if (this.tailscale) {
        const hasTailscale = await isTailscaleAvailable();
        if (hasTailscale) {
          const tailscaleHosts = await discoverTailscaleHosts(localConfig.port);

          if (tailscaleHosts.length > 0) {
            console.log(chalk.bold('\nTailscale Peers:\n'));
            for (const host of tailscaleHosts) {
              console.log(`  ${chalk.blue('◆')} ${host.name}`);
              console.log(`    IP: ${host.tailscaleIP}`);
            }
          }
        }
      }

      console.log();
      return 0;
    } catch (err: any) {
      console.error(chalk.red(`Failed to list hosts: ${err.message}`));
      return 1;
    }
  }

  private async checkHealth(): Promise<number> {
    try {
      const { checkAllHostsHealth, getKnownHosts } = await import('@skillkit/mesh');

      const hosts = await getKnownHosts();

      if (hosts.length === 0) {
        console.log(chalk.yellow('No hosts configured.'));
        console.log(chalk.gray('Add hosts with: skillkit mesh add <address>'));
        return 0;
      }

      console.log(chalk.bold('\nChecking host health...\n'));

      const timeout = this.timeout ? parseInt(this.timeout, 10) : undefined;
      const results = await checkAllHostsHealth({ timeout });

      if (this.json) {
        console.log(JSON.stringify(results, null, 2));
        return 0;
      }

      let hasFailures = false;

      for (const result of results) {
        const host = hosts.find(h => h.id === result.hostId);
        const name = host?.name || result.hostId.slice(0, 8);

        if (result.status === 'online') {
          console.log(`  ${chalk.green('✓')} ${name} - ${chalk.green('online')} (${result.latencyMs}ms)`);
        } else {
          hasFailures = true;
          console.log(`  ${chalk.red('✗')} ${name} - ${chalk.red('offline')} ${result.error ? `(${result.error})` : ''}`);
        }
      }

      console.log();

      const online = results.filter(r => r.status === 'online').length;
      const total = results.length;
      console.log(`${online}/${total} hosts online`);

      return hasFailures ? 1 : 0;
    } catch (err: any) {
      console.error(chalk.red(`Failed to check health: ${err.message}`));
      return 1;
    }
  }

  private async discoverHosts(): Promise<number> {
    try {
      const { discoverOnce, isTailscaleAvailable, discoverTailscaleHosts, getLocalHostConfig } = await import('@skillkit/mesh');

      console.log(chalk.bold('\nDiscovering hosts on local network...\n'));

      const timeout = this.timeout ? parseInt(this.timeout, 10) : 5000;

      const localHosts = await discoverOnce(timeout);

      if (localHosts.length === 0) {
        console.log(chalk.gray('  No hosts discovered on local network.'));
      } else {
        console.log(chalk.cyan('Local Network:'));
        for (const host of localHosts) {
          console.log(`  ${chalk.green('●')} ${host.name}`);
          console.log(`    Address: ${host.address}:${host.port}`);
        }
      }

      if (this.tailscale) {
        const hasTailscale = await isTailscaleAvailable();
        if (hasTailscale) {
          const localConfig = await getLocalHostConfig();
          const tailscaleHosts = await discoverTailscaleHosts(localConfig.port);

          if (tailscaleHosts.length > 0) {
            console.log(chalk.cyan('\nTailscale Network:'));
            for (const host of tailscaleHosts) {
              console.log(`  ${chalk.blue('◆')} ${host.name}`);
              console.log(`    Tailscale IP: ${host.tailscaleIP}`);
            }
          } else {
            console.log(chalk.gray('\n  No Tailscale peers found.'));
          }
        } else {
          console.log(chalk.gray('\n  Tailscale not available.'));
        }
      }

      console.log();
      return 0;
    } catch (err: any) {
      console.error(chalk.red(`Failed to discover hosts: ${err.message}`));
      return 1;
    }
  }

  private async showStatus(): Promise<number> {
    try {
      const { getKnownHosts, getLocalHostConfig, getLocalIPAddress, isTailscaleAvailable, getTailscaleIP, getPeerRegistry } = await import('@skillkit/mesh');

      const localConfig = await getLocalHostConfig();
      const localIP = getLocalIPAddress();
      const hosts = await getKnownHosts();
      const registry = await getPeerRegistry();
      const localPeers = registry.getLocalPeers();

      const onlineHosts = hosts.filter(h => h.status === 'online').length;
      const hasTailscale = await isTailscaleAvailable();

      if (this.json) {
        console.log(JSON.stringify({
          localHost: { ...localConfig, address: localIP },
          hosts: hosts.length,
          onlineHosts,
          localPeers: localPeers.length,
          tailscaleAvailable: hasTailscale,
        }, null, 2));
        return 0;
      }

      console.log(chalk.bold('\nMesh Network Status\n'));

      console.log(chalk.cyan('Local Host:'));
      console.log(`  Name: ${localConfig.name}`);
      console.log(`  ID: ${chalk.gray(localConfig.id.slice(0, 8))}`);
      console.log(`  Address: ${localIP}:${localConfig.port}`);

      if (hasTailscale) {
        const tailscaleIP = await getTailscaleIP();
        if (tailscaleIP) {
          console.log(`  Tailscale: ${chalk.blue(tailscaleIP)}`);
        }
      }

      console.log();
      console.log(chalk.cyan('Network:'));
      console.log(`  Known hosts: ${hosts.length}`);
      console.log(`  Online: ${onlineHosts}`);
      console.log(`  Local peers: ${localPeers.length}`);
      console.log(`  Tailscale: ${hasTailscale ? chalk.green('available') : chalk.gray('not available')}`);

      console.log();
      return 0;
    } catch (err: any) {
      console.error(chalk.red(`Failed to get status: ${err.message}`));
      return 1;
    }
  }
}
