import { expect, test } from 'vitest';
import { clips, getRig } from './index.ts';
import { locate, sampleNumeric, sampleVec2, sampleShape, resolvePath } from '#ir/sample.ts';
import { interpolatePath } from '#ir/path.ts';
import { svgPathBbox } from 'svg-path-bbox';
import type { Track } from '#ir/types.ts';

// Long eye holds must not stretch the pupils or reveal a black seam through
// the closed lid. Ring halves must remain one physical object throughout.
for (const name of ['slow-blink', 'sleepy', 'proud', 'feign-ignore', 'ring-side-eye']) {
  test(`${name}: safe eyes and a coherent ring throughout playback`, () => {
    const clip = clips.find(c => c.name === name);
    expect(clip, 'the performance must be exported').toBeDefined();
    if (!clip) return;
    for (const side of ['l', 'r']) {
      expect(clip.tracks.find(t => t.part === `eye-${side}.pupil` && t.property === 'scale')).toBeUndefined();
      const lid = clip.tracks.find(t => t.part === `eye-${side}.white` && t.property === 'scale');
      const pupil = clip.tracks.find(t => t.part === `eye-${side}.pupil` && t.property === 'opacity');
      const shape = clip.tracks.find(t => t.part === `eye-${side}.white` && t.property === 'shape') as Track<'shape'> | undefined;
      if (pupil?.property === 'opacity') {
        const rig = getRig('pubnyan');
        const part = rig.parts.find(p => p.name === `eye-${side}.white`)!;
        const restBounds = svgPathBbox(part.path!);
        const restHeight = restBounds[3] - restBounds[1];
        // Ordinary blinks leave a thin lid; contour exchanges collapse it to zero.
        const closed = lid ? Math.min(0.08, ...lid.keys.map(k => (k.v as [number, number])[1])) : 0;
        for (let t = 0; t < clip.duration; t += 1 / 120) {
          const scale = lid ? sampleVec2(lid as Track<'scale'>, t)[1] : 1;
          const opacity = sampleNumeric(pupil as Track<'opacity'>, t);
          const contour = shape ? locate(shape.keys, t) : undefined;
          const restingLid = contour?.from.v === 'resting-eyes' && (contour.p === 0 || contour.to.v === 'resting-eyes');
          if (restingLid || scale <= closed + 1e-9) {
            expect(opacity, `visible pupil in closed lid at ${t}`).toBeLessThan(0.05);
          }
          const height = Math.max(0, ...sampleShape(rig, part, shape, t).filter(p => p.opacity > .5).map(p => {
            const bounds = svgPathBbox(p.d);
            return (bounds[3] - bounds[1]) * scale;
          }));
          if (height >= restHeight * .5) expect(opacity, `blank open eye at ${t}`).toBeGreaterThanOrEqual(0.8);
          if (contour && contour.from.v !== contour.to.v && contour.p > 0 && contour.p < 1) {
            const from = resolvePath(rig, part, contour.from.v), to = resolvePath(rig, part, contour.to.v);
            if (!from || !to || interpolatePath(from, to, .5) === null) {
              expect(height, `visible incompatible contour exchange at ${t}`).toBeLessThan(0.001);
              expect(opacity, `pupil visible during contour exchange at ${t}`).toBeLessThan(0.01);
            }
          }
        }
      }
    }
    const back = clip.tracks.filter(t => t.part === 'ring-back');
    expect(back.length).toBeGreaterThan(0);
    for (const t of back) {
      expect(clip.tracks.find(f => f.part === 'ring-front' && f.property === t.property)?.keys).toEqual(t.keys);
    }
  });
}
