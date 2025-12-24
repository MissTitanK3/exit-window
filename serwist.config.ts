// Configures how Serwist builds and injects the service worker for Exit Window.
import type { PluginOptions } from '@serwist/next';

const config: PluginOptions = {
  // Generate and serve a single worker for the whole app scope.
  swSrc: 'service-worker/sw.ts',
  swDest: 'public/sw.js',
  // Only register the worker in production to avoid dev HMR loops.
  register: process.env.NODE_ENV === 'production',
  // Only cache local assets; no external networks are contacted.
  include: [/^app\/.*\.(js|css|html)$/, /^public\/.*$/, /\.(js|css|html|json|png|svg|jpg|woff2?)$/],
};

export default config;
