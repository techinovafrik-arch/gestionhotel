import { describe, expect, it } from 'vitest';
import { API_PORT, DISCOVERY_PORT } from './index.js';

describe('constantes réseau', () => {
  it('utilise des ports distincts pour l’API et la découverte', () => {
    expect(API_PORT).toBe(4580);
    expect(DISCOVERY_PORT).toBe(4581);
  });
});
