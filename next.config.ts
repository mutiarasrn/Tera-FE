import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' http: https: data: blob: 'unsafe-inline' 'wasm-unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https:; worker-src 'self' blob:; connect-src 'self' https: wss: ws:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:;"
          }
        ]
      }
    ];
  },
};

export default nextConfig;
