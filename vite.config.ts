import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages serves the site from https://<user>.github.io/<repo>/,
 * so assets must be resolved relative to "/<repo>/".
 *
 * - Default base is "/job-tracker/" (the intended repo name).
 * - The GitHub Actions workflow overrides it via VITE_BASE using the
 *   actual repository name, so the build works even if you rename the repo.
 * - During `npm run dev` the base is "/" for convenience (`vite preview` keeps
 *   the production base so it mirrors GitHub Pages).
 */
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  base: command === 'serve' && !isPreview ? '/' : process.env.VITE_BASE ?? '/job-tracker/',
  build: {
    rollupOptions: {
      output: {
        // Split large libraries into their own cached chunks
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          dnd: ['@hello-pangea/dnd'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
}));
