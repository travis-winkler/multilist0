import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:5174",
    browserName: "chromium",
    launchOptions: process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {},
  },
  webServer: [{
    command: "npm run dev -w @multilist0/web -- --port 5174 --strictPort",
    url: "http://127.0.0.1:5174/app/",
    reuseExistingServer: !process.env.CI,
  }, {
    command: "npm exec -w @multilist0/extension -- vite preview --host 127.0.0.1 --port 5175 --strictPort",
    url: "http://127.0.0.1:5175/",
    reuseExistingServer: !process.env.CI,
  }],
});
