import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      DATABASE_URL: 'postgresql://x:x@localhost:5432/x',
      SESSION_SECRET: 'secreto-solo-para-pruebas',
    },
  },
});