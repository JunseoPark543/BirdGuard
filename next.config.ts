import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/analyze": ["./docs/building-classification-master.md"],
  },
};

export default nextConfig;
