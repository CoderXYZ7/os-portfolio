import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/portfolio',
  server: {
    proxy: {
      '/portfolio/api': 'http://localhost:4000',
      '/portfolio/ws': { target: 'ws://localhost:4000', ws: true },
    },
  },
  test: { environment: 'jsdom' },
});
