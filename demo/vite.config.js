import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5274 },
  optimizeDeps: {
    include: ['@xeplr/schema-handler', '@xeplr/actions', '@xeplr/ui-schema-handler', '@xeplr/ui-actions']
  }
});
