import { clip, key, track } from '#ir/clip.ts';
import { orbit } from './ring-motion.ts';

/** Sink into a doze; one ear wakes first, then a conspicuously alert stare. */
export default clip('sleepy', { rig: 'pubnyan', duration: 4.4, fps: 60, loop: false }, [
  ...['eye-l.white', 'eye-r.white'].map(part => track(part, 'shape', [
    key(0, 'default'), key(0.35, 'default'), key(1.05, 'drowsy', 'inOutSine'),
    key(1.28, 'default', 'outCubic'), key(1.48, 'default'),
    key(1.78, 'drowsy', 'inOutSine'), key(2.1, 'resting-eyes', 'inOutSine'), key(2.48, 'resting-eyes'),
    key(2.68, 'default', 'inOutCubic'), key(3.6, 'default'),
    key(3.68, 'resting-eyes', 'easeIn'), key(3.72, 'resting-eyes'),
    key(3.94, 'default', 'inOutSine'), key(4.4, 'default'),
  ])),
  ...['eye-l.pupil', 'eye-r.pupil'].map(part => track(part, 'opacity', [
    key(0, 1), key(1.96, 1), key(2.06, 0, 'inOutSine'), key(2.48, 0),
    key(2.5, 1, 'inOutSine'), key(3.665, 1), key(3.68, 0, 'inOutSine'),
    key(3.72, 0), key(3.74, 1, 'inOutSine'), key(4.4, 1),
  ])),
  track('head', 'position', [key(0, [0, 0]), key(0.45, [0, 0]), key(1.12, [0, 2.8], 'inOutSine'),
    key(1.4, [0, 1], 'outCubic'), key(1.55, [0, 1]), key(2.18, [0.8, 6.2], 'inOutCubic'),
    key(2.5, [0.8, 6.2]), key(2.72, [0, -2.2], 'outCubic'),
    key(2.97, [0, -0.9], 'inOutSine'), key(3.6, [0, -0.9]),
    key(3.82, [0, 0.6], 'inOutSine'), key(4.4, [0, 0], 'inOutSine')]),
  track('head', 'rotation', [key(0, 0), key(0.65, 0), key(2.3, 3.2, 'inOutSine'),
    key(2.5, 3.2), key(2.85, -0.8, 'outCubic'), key(3.1, 0, 'inOutSine'), key(4.4, 0)]),
  track('torso', 'position', [key(0, [0, 0]), key(0.7, [0, 0]), key(2.35, [0, 2], 'inOutSine'),
    key(2.6, [0, 2]), key(2.94, [0, -0.5], 'outCubic'), key(3.25, [0, 0], 'inOutSine'), key(4.4, [0, 0])]),
  track('torso', 'rotation', [key(0, 0), key(0.8, 0), key(2.35, 1.6, 'inOutSine'),
    key(2.6, 1.6), key(2.98, -0.6, 'outCubic'), key(3.3, 0, 'inOutSine'), key(4.4, 0)]),
  track('ear-r', 'rotation', [key(0, 0), key(1.8, 2, 'inOutSine'), key(2.3, 2),
    key(2.43, -5.5, 'outCubic'), key(2.62, -3, 'inOutSine'), key(3.6, -3), key(4.25, 0, 'inOutSine'), key(4.4, 0)]),
  track('ear-l', 'rotation', [key(0, 0), key(2.25, -3.5, 'inOutSine'), key(2.55, -3.5),
    key(2.82, 2, 'outCubic'), key(3.15, 0.6, 'inOutSine'), key(3.7, 0.6), key(4.4, 0, 'inOutSine')]),
  ...orbit('rotation', [key(0, 0), key(0.8, 0), key(2.5, -2, 'inOutSine'),
    key(3.04, 1.2, 'inOutCubic'), key(3.5, -0.3, 'inOutSine'), key(4.4, 0, 'inOutSine')]),
]);
