// Next config wrapped with Serwist to enable offline caching.
import type { NextConfig } from 'next';
import withSerwist from '@serwist/next';
import serwistConfig from './serwist.config';

const nextConfig: NextConfig = {
  // No remote images or external domains are used; keeps the app offline-friendly.
  images: { unoptimized: true },
};

const isProd = process.env.NODE_ENV === 'production';

export default isProd ? withSerwist(serwistConfig)(nextConfig) : nextConfig;
