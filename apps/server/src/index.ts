import { createServer, type Server } from 'node:http';
import { mkdirSync } from 'node:fs';
import express from 'express';
import { API_PORT, APP_NAME } from '@hm/shared';

export interface StartOptions {
  /** Dossier des données (base, sauvegardes, archives). En production : C:\ProgramData\HotelManager. */
  dataDir: string;
  /** Port d'écoute ; 0 = port libre choisi par le système (tests). */
  port?: number;
  host?: string;
}

export interface RunningServer {
  port: number;
  close: () => Promise<void>;
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ app: APP_NAME, statut: 'ok' });
  });

  return app;
}

/** Démarre le serveur Hotel Manager (appelé par la coque Electron en mode serveur, ou seul). */
export async function start({
  dataDir,
  port = API_PORT,
  host = '0.0.0.0',
}: StartOptions): Promise<RunningServer> {
  mkdirSync(dataDir, { recursive: true });
  const httpServer: Server = createServer(createApp());

  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(port, host, () => resolve());
  });

  const address = httpServer.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;

  return {
    port: actualPort,
    close: () =>
      new Promise<void>((resolve, reject) => httpServer.close((err) => (err ? reject(err) : resolve()))),
  };
}
