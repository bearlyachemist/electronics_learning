import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
export default defineConfig({ integrations: [react(), mdx()], devToolbar: {enabled:false}, vite: {cacheDir: `node_modules/.vite-${process.env.NODE_ENV || 'development'}`} });
