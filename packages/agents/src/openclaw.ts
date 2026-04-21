import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { ClawdbotAdapter } from './clawdbot.js';
import type { AgentType } from '@skillkit/core';
import { AGENT_CONFIG } from '@skillkit/core';

const config = AGENT_CONFIG.openclaw;

export class OpenClawAdapter extends ClawdbotAdapter {
  override readonly type: AgentType = 'openclaw';
  override readonly name = 'OpenClaw';
  override readonly skillsDir = config.skillsDir;
  override readonly configFile = config.configFile;

  override async isDetected(): Promise<boolean> {
    const projectOpenClaw = join(process.cwd(), '.openclaw');
    const globalOpenClaw = join(homedir(), '.openclaw');
    const globalWorkspace = join(homedir(), '.openclaw', 'workspace');
    const openclawConfig = join(process.cwd(), 'openclaw.json');

    return existsSync(projectOpenClaw) || existsSync(globalOpenClaw) ||
           existsSync(globalWorkspace) || existsSync(openclawConfig);
  }
}
