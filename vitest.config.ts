import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'motion/**/*.test.ts', 'src/**/*.test.ts'],
    // The SVG integration test renders every key and midpoint across all clips.
    // The expanded eye contours and acting add samples; the complete SVG pass
    // takes ~185s locally. Preserve coverage with headroom for slower machines.
    testTimeout: 300_000,
    hookTimeout: 30_000,
  },
});
