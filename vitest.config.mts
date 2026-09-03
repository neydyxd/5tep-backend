import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// Nest relies on emitDecoratorMetadata, which esbuild does not emit, so SWC transforms.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    testTimeout: 20_000,
  },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
