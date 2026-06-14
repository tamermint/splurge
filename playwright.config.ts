// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/__tests__/integration",
  fullyParallel: true,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: "http://localhost:3000",
    // Inject a unique IP header to avoid Redis collisions
    extraHTTPHeaders: {
      "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}`,
    },
  },
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_TEST_MODE: "true",
    },
  },
});
