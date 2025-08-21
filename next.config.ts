import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

}

export default nextConfig
