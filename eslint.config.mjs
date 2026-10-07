import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: fileURLToPath(new URL('.', import.meta.url)),
});

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'export/**',
      'scripts/**',
      'next-env.d.ts',
      'commit-message.txt',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // The profile photo uses <picture> + <source> for the webp variant;
      // next/image does not support that pattern, so plain <img> is intentional.
      '@next/next/no-img-element': 'off',
    },
  },
];
