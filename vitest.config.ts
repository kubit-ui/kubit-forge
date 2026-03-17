import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "__reports__/test-coverage",
    },
    environment: "happy-dom",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/templates/react/src/**/*.test.tsx", // Exclude React template tests (they have their own config)
      "**/templates/react-kubit-ui/src/**/*.test.tsx", // Exclude React Kubit UI template tests
      "**/templates/vanilla/src/**/*.test.ts", // Exclude Vanilla template tests
    ],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
