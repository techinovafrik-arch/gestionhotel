import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Chemins relatifs : l'interface compilée est servie par le serveur (ADR-005).
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4580',
      '/socket.io': { target: 'ws://localhost:4580', ws: true },
    },
  },
  test: {
    environment: 'node',
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
