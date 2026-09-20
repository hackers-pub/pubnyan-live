import { expect, test } from 'vitest';
import svgpath from 'svgpath';
import { svgPathBbox } from 'svg-path-bbox';
import { clips, getRig } from './index.ts';
import { sampleClip } from '#ir/sample.ts';

for (const [name, time] of [['sleepy', 1.05], ['slow-blink', .72], ['feign-ignore', .9], ['ring-side-eye', 3.65]] as const) {
  test(`${name}: held half-lids cover from above rather than squeezing the iris between two rising edges`, () => {
    const original = clips.find(c => c.name === name)!;
    const eyes = {...original, tracks: original.tracks.filter(t => t.part.startsWith('eye-'))};
    const rest = sampleClip(getRig('pubnyan'), eyes, 0);
    const held = sampleClip(getRig('pubnyan'), eyes, time);
    for (const side of ['l', 'r']) {
      const bounds = (parts: typeof rest) => {
        const part = parts.find(p => p.name === `eye-${side}.white`)!;
        return svgPathBbox(svgpath(part.d).matrix(part.matrix).toString());
      };
      const a = bounds(rest), b = bounds(held);
      expect(b[1] - a[1], 'upper lid descends').toBeGreaterThan(5);
      expect(Math.abs(b[3] - a[3]), 'lower lid stays anchored').toBeLessThan(1);
    }
  });
}
