import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import inlineMath from './src/lib/inline-math.mjs';

const base = process.env.ELECTRONICS_BASE_PATH || '/';
export default defineConfig({
  site: 'https://hebert.phd',
  base,
  integrations: [react(), mdx()],
  devToolbar: {enabled:false},
  vite: {plugins:[inlineMath(base)], cacheDir: `node_modules/.vite-${process.env.NODE_ENV || 'development'}`}
});
