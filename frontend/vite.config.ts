import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/phishblocker-a-phishing-awareness-simulator/",
  plugins: [react()]
});
