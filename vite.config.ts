import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensuring process.env is available for compatibility, though import.meta.env is preferred in Vite
    'process.env': process.env
  }
});