import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Le paquet partagé est consommé en source TypeScript : on l'embarque dans le bundle.
  noExternal: ['@hm/shared'],
});
