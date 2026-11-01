import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['app/**/*.test.{ts,tsx}', 'tests/**/*.test.ts'],
    environment: 'node',
  },
})
