import nextConfig from "eslint-config-next";

const vitals = nextConfig.configs["flat/core-web-vitals"];
const typescript = nextConfig.configs["flat/typescript"];

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "export/**",
      "scripts/**",
      ".lighthouseci/**",
      "next-env.d.ts",
      "commit-message.txt",
    ],
  },
  ...(Array.isArray(vitals) ? vitals : [vitals]),
  ...(Array.isArray(typescript) ? typescript : [typescript]),
  {
    rules: {
      // The profile photo uses <picture> + <source> for the webp variant;
      // next/image does not support that pattern, so plain <img> is intentional.
      "@next/next/no-img-element": "off",
    },
  },
];