import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@vyora/shared-types': path.resolve(__dirname, './src/shared/types.ts'),
      '@vyora/utils': path.resolve(__dirname, './src/shared/utils.ts'),
      '@vyora/validation': path.resolve(__dirname, './src/shared/validation.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
