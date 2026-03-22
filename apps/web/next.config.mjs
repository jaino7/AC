/** @type {import('next').NextConfig} */

// カスタムドメインからアクセスした場合でもJS/CSSアセットをメインドメインから配信する
const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN;
const assetPrefix =
  mainDomain && !mainDomain.includes('localhost') && !mainDomain.includes('lvh.me')
    ? `https://${mainDomain}`
    : undefined;

const nextConfig = {
  reactStrictMode: true,
  assetPrefix,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
