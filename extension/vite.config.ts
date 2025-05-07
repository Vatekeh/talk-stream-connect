
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      input: {
        content: 'content.js',
        background: 'background.js',
        popup: 'popup/popup.js',
        options: 'options/options.html'
      }
    }
  },
  define: {
    'process.env.CLUTSH_API_URL': JSON.stringify(process.env.CLUTSH_API_URL || 'https://api.your-domain.com/api/nsfw-detections')
  }
})
