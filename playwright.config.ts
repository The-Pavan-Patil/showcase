import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120_000,
    // Analytics is force-disabled for the whole suite. These run hundreds of
    // page loads across five browsers, which would otherwise flood the real
    // PostHog project with bot traffic and make a blocked or slow analytics
    // request able to fail the zero-console-error assertion in site.spec.ts.
    // Explicit (even empty) values win over .env.local, so this holds whether
    // or not the developer has keys configured locally.
    env: {
      NEXT_PUBLIC_POSTHOG_KEY: "",
      NEXT_PUBLIC_POSTHOG_HOST: "",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    {
      name: "firefox",
      testIgnore: "**/visual.spec.ts",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testIgnore: "**/visual.spec.ts",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-webkit",
      testIgnore: "**/visual.spec.ts",
      use: { ...devices["iPhone 15"] },
    },
  ],
});
