import { resolve } from 'node:path';
import { start } from './index.js';

const dataDir = resolve(process.cwd(), '../../data');
const server = await start({ dataDir });
console.info(`Serveur Hotel Manager démarré sur le port ${server.port} (données : ${dataDir})`);
