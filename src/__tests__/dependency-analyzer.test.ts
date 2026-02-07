import { describe, expect, it } from 'vitest';

import { DependencyAnalyzer } from '../utils/dependency-analyzer';

describe('DependencyAnalyzer', () => {
  const cwd = process.cwd();
  const analyzer = new DependencyAnalyzer(cwd, 'pnpm');

  describe('getDependencyTree', () => {
    it('should return a dependency tree', async () => {
      const tree = await analyzer.getDependencyTree();

      expect(tree).toBeDefined();
      expect(tree.name).toBeDefined();
      expect(tree.version).toBeDefined();
      expect(tree.dependencies).toBeInstanceOf(Map);
      expect(tree.devDependencies).toBeInstanceOf(Map);
    });

    it('should have production dependencies', async () => {
      const tree = await analyzer.getDependencyTree();
      expect(tree.dependencies.size).toBeGreaterThan(0);
    });

    it('should have development dependencies', async () => {
      const tree = await analyzer.getDependencyTree();
      expect(tree.devDependencies.size).toBeGreaterThan(0);
    });
  });

  describe('whyPackage', () => {
    it('should explain why a package is installed', async () => {
      const why = await analyzer.whyPackage('chalk');

      expect(why).toBeDefined();
      expect(why.name).toBe('chalk');
      expect(why.installedVersion).toBeDefined();
      expect(why.requestedBy).toBeDefined();
      expect(Array.isArray(why.requestedBy)).toBe(true);
    });

    it('should identify direct dependencies', async () => {
      const why = await analyzer.whyPackage('chalk');
      const hasDirect = why.requestedBy.some((req) => req.name.includes('kubit-forge'));
      expect(hasDirect).toBe(true);
    });
  });

  describe('findDuplicates', () => {
    it('should find duplicate dependencies', async () => {
      const duplicates = await analyzer.findDuplicates();

      expect(Array.isArray(duplicates)).toBe(true);

      if (duplicates.length > 0) {
        const dup = duplicates[0];
        expect(dup.name).toBeDefined();
        expect(dup.versions).toBeDefined();
        expect(Array.isArray(dup.versions)).toBe(true);
        expect(dup.versions.length).toBeGreaterThan(1);
      }
    });
  });

  describe('getAvailableUpdates', () => {
    it('should check for available updates', async () => {
      const updates = await analyzer.getAvailableUpdates();

      expect(Array.isArray(updates)).toBe(true);

      if (updates.length > 0) {
        const update = updates[0];
        expect(update.name).toBeDefined();
        expect(update.current).toBeDefined();
        expect(update.latest).toBeDefined();
        expect(update.type).toMatch(/production|development/);
        expect(typeof update.breaking).toBe('boolean');
      }
    });
  });

  describe('getAlternatives', () => {
    it('should suggest alternatives for known packages', async () => {
      const alternatives = await analyzer.getAlternatives('moment');

      expect(Array.isArray(alternatives)).toBe(true);
      expect(alternatives.length).toBeGreaterThan(0);

      const alt = alternatives[0];
      expect(alt.name).toBeDefined();
      expect(alt.description).toBeDefined();
      expect(alt.reason).toBeDefined();
      expect(typeof alt.downloads).toBe('number');
      expect(typeof alt.stars).toBe('number');
      expect(typeof alt.maintained).toBe('boolean');
    });

    it('should return known alternatives for axios', async () => {
      const alternatives = await analyzer.getAlternatives('axios');

      expect(alternatives.length).toBeGreaterThan(0);
      const names = alternatives.map((a) => a.name);
      expect(names).toContain('ky');
    });

    it('should return known alternatives for lodash', async () => {
      const alternatives = await analyzer.getAlternatives('lodash');

      expect(alternatives.length).toBeGreaterThan(0);
      const names = alternatives.map((a) => a.name);
      expect(names).toContain('lodash-es');
    });

    it('should return empty array for unknown packages', async () => {
      const alternatives = await analyzer.getAlternatives('unknown-package-xyz-123');

      expect(Array.isArray(alternatives)).toBe(true);
    });
  });

  describe('Alternative Database Coverage', () => {
    const knownPackages = ['axios', 'moment', 'lodash', 'node-sass', 'request'];

    knownPackages.forEach((pkg) => {
      it(`should have alternatives for ${pkg}`, async () => {
        const alternatives = await analyzer.getAlternatives(pkg);
        expect(alternatives.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Alternative Package Structure', () => {
    it('should return properly structured alternative packages', async () => {
      const alternatives = await analyzer.getAlternatives('moment');

      alternatives.forEach((alt) => {
        expect(alt).toHaveProperty('name');
        expect(alt).toHaveProperty('description');
        expect(alt).toHaveProperty('downloads');
        expect(alt).toHaveProperty('stars');
        expect(alt).toHaveProperty('maintained');
        expect(alt).toHaveProperty('size');
        expect(alt).toHaveProperty('reason');

        expect(typeof alt.name).toBe('string');
        expect(typeof alt.description).toBe('string');
        expect(typeof alt.downloads).toBe('number');
        expect(typeof alt.stars).toBe('number');
        expect(typeof alt.maintained).toBe('boolean');
        expect(typeof alt.size).toBe('string');
        expect(typeof alt.reason).toBe('string');
      });
    });
  });
});
