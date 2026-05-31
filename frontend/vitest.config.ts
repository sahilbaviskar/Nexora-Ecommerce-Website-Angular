import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: resolve(__dirname, 'coverage'),
      reporter: ['text', 'html', 'lcov'],
      include: ['src/app/**/*.ts'],
      exclude: [
        'src/app/**/*.spec.ts',
        'src/app/**/*.module.ts',
        'src/main.ts',
        'src/app/app.routes.ts',
        'src/app/app.config.ts',
        'src/app/core/models/**',
      ],
    },
  },
});
