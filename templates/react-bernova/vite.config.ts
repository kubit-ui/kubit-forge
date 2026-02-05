import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@kubit-ui-web/react-components', '@kubit-ui-web/kubit-tokens'],
  },
  server: {
    port: 3000,
    open: true,
  },
});
