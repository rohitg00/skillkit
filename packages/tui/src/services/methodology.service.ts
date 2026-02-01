export interface MethodologyPackDisplay {
  name: string;
  description: string;
  version: string;
  skills: number;
  tags: string[];
  installed: boolean;
  status: 'available' | 'installed' | 'synced';
}

export interface MethodologyServiceState {
  packs: MethodologyPackDisplay[];
  installedPacks: string[];
  manager: unknown | null;
  loading: boolean;
  error: string | null;
}

export async function loadMethodologies(): Promise<MethodologyServiceState> {
  return {
    packs: [],
    installedPacks: [],
    manager: null,
    loading: false,
    error: null,
  };
}

export async function installMethodologyPack(_name: string): Promise<boolean> {
  return true;
}

export async function uninstallMethodologyPack(_name: string): Promise<boolean> {
  return true;
}

export async function syncMethodologyPack(_name: string): Promise<boolean> {
  return true;
}

export const methodologyService = {
  loadMethodologies,
  installMethodologyPack,
  uninstallMethodologyPack,
  syncMethodologyPack,
};
