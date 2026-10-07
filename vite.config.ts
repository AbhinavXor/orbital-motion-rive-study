import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS
    ? '/orbital-motion-rive-study/'
    : '/',
});
