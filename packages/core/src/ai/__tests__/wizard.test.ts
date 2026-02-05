import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  getStepOrder,
  getNextStep,
  getPreviousStep,
  getStepNumber,
  getTotalSteps,
} from '../wizard/types.js';

describe('Wizard Types', () => {
  describe('createInitialState', () => {
    it('should create default state', () => {
      const state = createInitialState();

      expect(state.currentStep).toBe('expertise');
      expect(state.expertise).toBe('');
      expect(state.contextSources).toHaveLength(4);
      expect(state.composableSkills).toEqual([]);
      expect(state.clarifications).toEqual([]);
      expect(state.targetAgents).toEqual([]);
      expect(state.memoryPersonalization).toBe(true);
      expect(state.generatedSkill).toBeNull();
      expect(state.errors).toEqual([]);
    });

    it('should have default context sources enabled', () => {
      const state = createInitialState();

      const docs = state.contextSources.find((s) => s.name === 'docs');
      const codebase = state.contextSources.find((s) => s.name === 'codebase');
      const skills = state.contextSources.find((s) => s.name === 'skills');
      const memory = state.contextSources.find((s) => s.name === 'memory');

      expect(docs?.enabled).toBe(true);
      expect(codebase?.enabled).toBe(true);
      expect(skills?.enabled).toBe(true);
      expect(memory?.enabled).toBe(true);
    });
  });

  describe('getStepOrder', () => {
    it('should return all steps in order', () => {
      const order = getStepOrder();

      expect(order).toEqual([
        'expertise',
        'context-sources',
        'composition',
        'clarification',
        'review',
        'install',
      ]);
    });
  });

  describe('getNextStep', () => {
    it('should return next step', () => {
      expect(getNextStep('expertise')).toBe('context-sources');
      expect(getNextStep('context-sources')).toBe('composition');
      expect(getNextStep('composition')).toBe('clarification');
      expect(getNextStep('clarification')).toBe('review');
      expect(getNextStep('review')).toBe('install');
    });

    it('should return null for last step', () => {
      expect(getNextStep('install')).toBeNull();
    });
  });

  describe('getPreviousStep', () => {
    it('should return previous step', () => {
      expect(getPreviousStep('install')).toBe('review');
      expect(getPreviousStep('review')).toBe('clarification');
      expect(getPreviousStep('clarification')).toBe('composition');
      expect(getPreviousStep('composition')).toBe('context-sources');
      expect(getPreviousStep('context-sources')).toBe('expertise');
    });

    it('should return null for first step', () => {
      expect(getPreviousStep('expertise')).toBeNull();
    });
  });

  describe('getStepNumber', () => {
    it('should return 1-indexed step numbers', () => {
      expect(getStepNumber('expertise')).toBe(1);
      expect(getStepNumber('context-sources')).toBe(2);
      expect(getStepNumber('composition')).toBe(3);
      expect(getStepNumber('clarification')).toBe(4);
      expect(getStepNumber('review')).toBe(5);
      expect(getStepNumber('install')).toBe(6);
    });
  });

  describe('getTotalSteps', () => {
    it('should return 6', () => {
      expect(getTotalSteps()).toBe(6);
    });
  });
});
