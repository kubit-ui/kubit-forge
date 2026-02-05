import { describe, it, expect } from 'vitest';
import { createApp } from './app';

describe('createApp', () => {
  it('creates app element', () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(app.tagName).toBe('DIV');
  });

  it('contains welcome message', () => {
    const app = createApp();
    expect(app.textContent).toContain('Welcome to Your Vanilla App');
  });

  it('contains kubit-forge message', () => {
    const app = createApp();
    expect(app.textContent).toContain('Built with kubit-forge');
  });
});
