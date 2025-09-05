/** @type {import('next').NextConfig} */
const nextConfig = {
  // The `experimental.appDir` option has been removed because the App Router is enabled
  // by default in Next.js 14 and later. Keeping this property results in warnings.
  // See https://nextjs.org/docs/messages/invalid-next-config for details.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;