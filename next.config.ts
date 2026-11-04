import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The original site was two static files. Keep their old URLs working.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/links.html", destination: "/links", permanent: true },
    ];
  },

  // Equivalent of the original Netlify `_headers` file (rule: /*).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Images and icons are static, fingerprint-free files in /public. Serve
      // them from the browser cache for a day and revalidate in the background
      // for a month, so repeat visits (and the portrait, the heaviest asset)
      // cost no round trip. The CV is excluded so a new upload shows at once.
      {
        source: "/assets/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=2592000",
          },
        ],
      },
      {
        source: "/assets/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=2592000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
