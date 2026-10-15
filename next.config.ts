import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site for GitHub Pages, served from robbyambler.github.io/Oikos-map
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/Oikos-map" : "",
  images: { unoptimized: true },
  trailingSlash: true,
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
