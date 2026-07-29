import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/bai-viet/:category/:slug",
        destination: "/bai-viet/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
