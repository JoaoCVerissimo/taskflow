/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@taskflow/shared"],
};

module.exports = nextConfig;
