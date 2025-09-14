import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      '2aa4cfef0f9f.ngrok-free.app',
      '7df86edd2aeb.ngrok-free.app',
      '64420bbcb077.ngrok-free.app',
    ],
  },
});
