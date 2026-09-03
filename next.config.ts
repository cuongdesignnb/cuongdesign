import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  output: "standalone",
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/contact", destination: "/lien-he", permanent: true },
      { source: "/contact.html", destination: "/lien-he", permanent: true },
      { source: "/dich-vu.html", destination: "/dich-vu", permanent: true },
      { source: "/posts", destination: "/bai-viet", permanent: true },
      { source: "/products", destination: "/san-pham", permanent: true },
    ];
  },
};

export default nextConfig;
