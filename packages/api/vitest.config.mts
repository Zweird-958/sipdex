// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/units/**/*.{test,spec}.{ts,tsx,js,jsx}"],
          environment: "node",
          setupFiles: ["./tests/setup-env.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "api",
          include: ["tests/api/**/*.{test,spec}.{ts,tsx,js,jsx}"],
          environment: "node",
          setupFiles: ["./tests/setup-env.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integrations/**/*.{test,spec}.{ts,tsx,js,jsx}"],
          environment: "node",
          setupFiles: ["./tests/setup-env.ts"],
          globalSetup: ["./tests/global-setup.ts"],
          // All files share one test database, so run them serially to avoid
          // concurrent truncate/insert races between files.
          fileParallelism: false,
        },
      },
    ],
  },
})
