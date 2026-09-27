import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { createApp, start } from './index.js';

describe('GET /api/health', () => {
  it('répond que le serveur est opérationnel', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ app: 'Hotel Manager', statut: 'ok' });
  });
});

describe('start()', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'hm-test-'));
  afterAll(() => rmSync(dataDir, { recursive: true, force: true }));

  it('démarre sur un port libre puis s’arrête proprement', async () => {
    const server = await start({ dataDir, port: 0, host: '127.0.0.1' });
    expect(server.port).toBeGreaterThan(0);
    const res = await fetch(`http://127.0.0.1:${server.port}/api/health`);
    expect(res.status).toBe(200);
    await server.close();
  });
});
