import * as nextModule from "eslint-config-next";

// eslint-config-next@16 is flat-only, but its export shape does not match
// the documented examples (the default export has no `configs`). Locate
// the flat configs wherever the installed version keeps them, and fail
// loudly - listing the real exports - when nothing matches.

function resolveNextConfigs() {
  const mod = nextModule.default ?? nextModule;

  const configs = nextModule.configs ?? mod.configs ?? nextModule.flat ?? mod.flat;
  if (configs && typeof configs === "object") return configs;

  // The default export may itself be a flat config array.
  if (Array.isArray(mod)) return mod;

  const keys = [
    ...new Set([
      ...Object.keys(nextModule),
      ...(mod && typeof mod === "object" ? Object.keys(mod) : []),
    ]),
  ];

  throw new Error(
    `Could not find flat configs in eslint-config-next. Available exports: ${keys.join(", ")}`,
  );
}

const nextConfigs = resolveNextConfigs();

function selectConfig(names) {
  for (const name of names) {
    const entry = nextConfigs[name];
    if (entry) return Array.isArray(entry) ? entry : [entry];
  }
  return [];
}

const base = Array.isArray(nextConfigs)
  ? nextConfigs
  : [
      ...selectConfig(["flat/core-web-vitals", "core-web-vitals"]),
      ...selectConfig(["flat/typescript", "typescript"]),
    ];

if (!Array.isArray(nextConfigs) && base.length === 0) {
  throw new Error(
    `No usable entries in eslint-config-next configs. Available keys: ${Object.keys(nextConfigs).join(", ")}`,
  );
}

const config = [
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
  ...base,
  {
    rules: {
      // The profile photo uses <picture> + <source> for the webp variant;
      // next/image does not support that pattern, so plain <img> is intentional.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
