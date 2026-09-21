import { expect, test } from 'vitest';
import { clips, getRig, machine } from './index.ts';
import { exportRiveMachine } from '#export-rive/machine.ts';
import { Renderer } from '#render/renderer.ts';
import { renderRiveStateSequence } from '#verify/rive-machine-check.ts';
import { compareFrames } from '#verify/parity.ts';
import { referenceFrame } from '#verify/reference.ts';

test('slow blink plays its closed-eye pose and releases back to the continuing idle', async () => {
  const rig = getRig('pubnyan');
  const bytes = exportRiveMachine(rig, clips, machine);
  const renderer = await Renderer.launch();
  try {
    const baseline = await renderRiveStateSequence(renderer, rig, bytes, [{ seconds: 1 }, { seconds: 3.5 }]);
    const frames = await renderRiveStateSequence(renderer, rig, bytes, [
      { seconds: 1 }, { trigger: 'reactSlowBlink', seconds: 0.72 }, { seconds: 0.4 },
      { seconds: 0.82 }, { seconds: 1.56 },
    ]);
    for (const [i, time] of [0.72, 1.12, 1.94].entries()) {
      const pose = await referenceFrame(renderer, rig, clips.find(c => c.name === 'slow-blink')!, time);
      expect(compareFrames(frames[i + 1]!, pose).ratio, `slow blink at ${time}s`).toBeLessThanOrEqual(0.002);
    }
    expect(compareFrames(frames[2]!, frames[0]!).ratio).toBeGreaterThan(0.002);
    expect(compareFrames(frames[4]!, baseline[1]!).ratio, 'idle must regain every channel').toBeLessThanOrEqual(0.0005);
  } finally { await renderer.close(); }
});

test('slow blink and celebration replace each other without snapping at the trigger', async () => {
  const rig = getRig('pubnyan');
  const bytes = exportRiveMachine(rig, clips, machine);
  const renderer = await Renderer.launch();
  try {
    for (const [first, next, time, clip] of [
      ['reactCelebrate', 'reactSlowBlink', 1.12, 'slow-blink'],
      ['reactSlowBlink', 'reactCelebrate', 0.4, 'celebrate'],
    ] as const) {
      const frames = await renderRiveStateSequence(renderer, rig, bytes, [
        { seconds: 1 }, { trigger: first, seconds: 0.4 }, { trigger: next, seconds: 0 }, { seconds: time },
      ]);
      expect(compareFrames(frames[1]!, frames[2]!).ratio, `${first} to ${next}: boundary`).toBeLessThanOrEqual(0.00001);
      const expected = await referenceFrame(renderer, rig, clips.find(c => c.name === clip)!, time);
      expect(compareFrames(frames[3]!, expected).ratio, `${next} must own the face`).toBeLessThanOrEqual(0.002);
    }
  } finally { await renderer.close(); }
});

test('slow blink is ignored outside normal and cancels when the expression changes', async () => {
  const rig = getRig('pubnyan');
  const bytes = exportRiveMachine(rig, clips, machine);
  const renderer = await Renderer.launch();
  try {
    for (const expression of [1, 2, 3, 4]) {
      const baseline = await renderRiveStateSequence(renderer, rig, bytes, [{ expression, seconds: 1 }, { seconds: 1.12 }]);
      const actual = await renderRiveStateSequence(renderer, rig, bytes, [{ expression, seconds: 1 }, { trigger: 'reactSlowBlink', seconds: 1.12 }]);
      expect(compareFrames(actual[1]!, baseline[1]!).diffPixels, `${expression}: incompatible trigger`).toBe(0);
    }
    const baseline = await renderRiveStateSequence(renderer, rig, bytes, [{ seconds: 2.12 }, { expression: 3, seconds: 0.7 }]);
    const actual = await renderRiveStateSequence(renderer, rig, bytes, [
      { seconds: 1 }, { trigger: 'reactSlowBlink', seconds: 1.12 }, { expression: 3, seconds: 0 }, { seconds: 0.7 },
    ]);
    expect(compareFrames(actual[1]!, actual[2]!).ratio, 'cancellation must not snap').toBeLessThanOrEqual(0.00001);
    expect(compareFrames(actual[3]!, baseline[1]!).ratio, 'cry must regain the face').toBeLessThanOrEqual(0.0005);
  } finally { await renderer.close(); }
});
