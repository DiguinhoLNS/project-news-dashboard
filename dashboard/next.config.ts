import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  output: "standalone",
  cacheComponents: true,
  async redirects() {
    return [{ source: "/", destination: "/generate", permanent: false }];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
