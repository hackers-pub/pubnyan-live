import { clip, key, track } from '#ir/clip.ts';
import { orbit } from './ring-motion.ts';

/** Sink into a doze; one ear wakes first, then a conspicuously alert stare. */
export default clip('sleepy', { rig: 'pubnyan', duration: 4.4, fps: 60, loop: false }, [
  ...['eye-l.white', 'eye-r.white'].map(part => track(part, 'shape', [
    key(0, 'default'), key(0.35, 'default'), key(1.05, 'drowsy', 'inOutSine'),
    key(1.24, 'default', 'outCubic'), key(1.48, 'default'),
    key(1.78, 'drowsy', 'inOutSine'), key(2.1, 'resting-eyes', 'inOutSine'), key(2.5, 'resting-eyes'),
    key(2.62, 'default', 'outCubic'), key(3.6, 'default'),
    key(3.68, 'resting-eyes', 'easeIn'), key(3.72, 'resting-eyes'),
    key(3.94, 'default', 'inOutSine'), key(4.4, 'default'),
  ])),
  ...['eye-l.pupil', 'eye-r.pupil'].map(part => track(part, 'opacity', [
    key(0, 1), key(1.96, 1), key(2.06, 0, 'inOutSine'), key(2.5, 0),
    key(2.52, 1, 'inOutSine'), key(3.665, 1), key(3.68, 0, 'inOutSine'),
    key(3.72, 0), key(3.74, 1, 'inOutSine'), key(4.4, 1),
  ])),
  track('head', 'position', [key(0, [0, 0]), key(0.45, [0, 0]), key(1.12, [0, 2.8], 'inOutSine'),
    key(1.34, [0, -0.2], 'outCubic'), key(1.55, [0, -0.2]),
    // Lose the fight: a slow sag gives way to the weight of the head.
    key(1.94, [0.3, 2.6], 'inOutSine'), key(2.13, [0.8, 6.2], 'easeIn'),
    key(2.27, [0.8, 5.8], 'outCubic'), key(2.61, [0.8, 5.8]),
    // The eyes notice first; the head catches up, then the torso and ring.
    key(2.83, [0, -2.2], 'outCubic'),
    key(3.02, [0, -0.9], 'inOutSine'), key(3.6, [0, -0.9]),
    key(3.82, [0, 0.6], 'inOutSine'), key(4.4, [0, 0], 'inOutSine')]),
  track('head', 'rotation', [key(0, 0), key(0.65, 0), key(2.3, 3.2, 'inOutSine'),
    key(2.61, 3.2), key(2.92, -0.8, 'outCubic'), key(3.17, 0, 'inOutSine'), key(4.4, 0)]),
  track('torso', 'position', [key(0, [0, 0]), key(0.7, [0, 0]), key(2.35, [0, 2], 'inOutSine'),
    key(2.71, [0, 2]), key(3.04, [0, -0.5], 'outCubic'), key(3.35, [0, 0], 'inOutSine'), key(4.4, [0, 0])]),
  track('torso', 'rotation', [key(0, 0), key(0.8, 0), key(2.35, 1.6, 'inOutSine'),
    key(2.71, 1.6), key(3.08, -0.6, 'outCubic'), key(3.4, 0, 'inOutSine'), key(4.4, 0)]),
  track('ear-r', 'rotation', [key(0, 0), key(1.8, 2, 'inOutSine'), key(2.33, 2),
    key(2.46, -5.5, 'outCubic'), key(2.65, -3, 'inOutSine'), key(3.6, -3), key(4.25, 0, 'inOutSine'), key(4.4, 0)]),
  track('ear-l', 'rotation', [key(0, 0), key(2.25, -3.5, 'inOutSine'), key(2.65, -3.5),
    key(2.95, 2, 'outCubic'), key(3.25, 0.6, 'inOutSine'), key(3.7, 0.6), key(4.4, 0, 'inOutSine')]),
  ...orbit('rotation', [key(0, 0), key(0.8, 0), key(2.58, -2, 'inOutSine'),
    key(3.19, 1.2, 'inOutCubic'), key(3.63, -0.3, 'inOutSine'), key(4.4, 0, 'inOutSine')]),
]);
