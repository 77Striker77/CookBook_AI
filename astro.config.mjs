import { defineConfig } from 'astro/config';

// site/base kommen aus der Umgebung, damit dasselbe Repo auf GitHub Pages
// (Unterordner /CookBook_AI), einer eigenen Domain oder Cloudflare Pages läuft.
// Der Deploy-Workflow setzt SITE_URL und BASE_PATH.
const site = process.env.SITE_URL || 'https://example.com';
const base = process.env.BASE_PATH || undefined;

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: { theme: 'css-variables' },
  },
});
