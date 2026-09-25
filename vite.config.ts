import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SECURITY: no API keys are inlined into the client bundle here.
// All Gemini calls go through the server-side proxy at /api/gemini,
// which reads GEMINI_API_KEY from the server environment only.
export default defineConfig({
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
});
