/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SEDA_NETWORK: process.env.NEXT_PUBLIC_SEDA_NETWORK || 'seda-testnet',
  },
}

module.exports = nextConfig
