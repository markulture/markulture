// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from "@astrojs/mdx";
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://markulture.com",
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
  server: {
    port: 4321,
    host: true
  },
  vite: {
    server: {
      allowedHosts: ['.ngrok-free.app', '.ngrok.io']
    }
  },
  integrations: [tailwind(), mdx(), sitemap()]
});