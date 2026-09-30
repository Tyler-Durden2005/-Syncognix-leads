import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Pin the workspace root so a stray lockfile in a parent directory
  // isn't mistaken for the project root.
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  experimental: {
    // Tree-shake icon and animation imports down to what's used.
    optimizePackageImports: ["lucide-react", "motion"],
  },
}

export default nextConfig
