import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Explicit aliases so esbuild resolves the local packages when it follows
// require()/import chains inside them. Without these, nested requires like
// @xeplr/actions → require('@xeplr/schema-handler') fail because the
// symlinked package can't walk back up to demo/node_modules.
const XEPLR = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  server: { port: 5274 },
  resolve: {
    alias: {
      '@xeplr/schema-handler':    path.join(XEPLR, 'xeplr-schema-handler'),
      '@xeplr/actions':           path.join(XEPLR, 'xeplr-actions'),
      '@xeplr/ui-schema-handler': path.join(XEPLR, 'xeplr-ui-schema-handler'),
      '@xeplr/ui-actions':        path.join(XEPLR, 'xeplr-ui-actions')
    }
  },
  optimizeDeps: {
    include: ['@xeplr/schema-handler', '@xeplr/actions', '@xeplr/ui-schema-handler', '@xeplr/ui-actions']
  }
});
