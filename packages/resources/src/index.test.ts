import { describe, it, expect } from 'vitest';
import {
  getBundledAgents,
  getCommandTemplates,
  getBuiltinProfiles,
  getBuiltinGuidelines,
  getHookTemplates,
} from './index.js';

describe('@skillkit/resources', () => {
  it('exports bundled agents', () => {
    const agents = getBundledAgents();
    expect(agents.length).toBeGreaterThan(0);
    expect(agents[0]).toHaveProperty('id');
    expect(agents[0]).toHaveProperty('name');
  });

  it('exports command templates', () => {
    const commands = getCommandTemplates();
    expect(commands.length).toBeGreaterThan(0);
    expect(commands[0]).toHaveProperty('id');
    expect(commands[0]).toHaveProperty('trigger');
  });

  it('exports builtin profiles', () => {
    const profiles = getBuiltinProfiles();
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles[0]).toHaveProperty('name');
  });

  it('exports builtin guidelines', () => {
    const guidelines = getBuiltinGuidelines();
    expect(guidelines.length).toBeGreaterThan(0);
    expect(guidelines[0]).toHaveProperty('id');
  });

  it('exports hook templates', () => {
    const hooks = getHookTemplates();
    expect(hooks.length).toBeGreaterThan(0);
    expect(hooks[0]).toHaveProperty('id');
  });
});
