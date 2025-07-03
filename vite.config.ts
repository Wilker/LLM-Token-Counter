import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  base: '/LLM-Token-Counter/',
  build: {
    target: 'esnext',
  },
  plugins: [
    wasm(),
    react(),
  ],
});