export interface PluginListItem {
  name: string;
  version: string;
  description: string;
  type: 'translator' | 'provider' | 'command' | 'mixed';
  enabled: boolean;
  path?: string;
}

export interface PluginServiceState {
  plugins: PluginListItem[];
  manager: unknown | null;
  loading: boolean;
  error: string | null;
}

export async function loadPluginsList(_projectPath?: string): Promise<PluginServiceState> {
  return {
    plugins: [],
    manager: null,
    loading: false,
    error: null,
  };
}

export async function enablePlugin(_name: string, _manager: unknown): Promise<boolean> {
  return true;
}

export async function disablePlugin(_name: string, _manager: unknown): Promise<boolean> {
  return true;
}

export async function getPluginInfo(_name: string, _manager: unknown): Promise<unknown> {
  return null;
}

export async function installPluginFromPath(
  _pluginPath: string,
  _projectPath?: string
): Promise<boolean> {
  return true;
}

export const pluginService = {
  loadPluginsList,
  enablePlugin,
  disablePlugin,
  getPluginInfo,
  installPluginFromPath,
};
