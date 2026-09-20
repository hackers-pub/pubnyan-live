import { clip, key, track } from '#ir/clip.ts';
import { orbit } from './ring-motion.ts';

/** Meet your gaze, close the eyes in trust, and take time to look back. */
export default clip('slow-blink', { rig: 'pubnyan', duration: 3.2, fps: 60, loop: false }, [
  ...['eye-l.white', 'eye-r.white'].map(part => track(part, 'shape', [
    key(0, 'default'), key(0.32, 'default'), key(0.72, 'drowsy', 'inOutSine'), key(1.12, 'resting-eyes', 'inOutSine'),
    key(1.62, 'resting-eyes'), key(1.94, 'drowsy', 'inOutSine'), key(2.38, 'default', 'inOutSine'), key(3.2, 'default'),
  ])),
  ...['eye-l.pupil', 'eye-r.pupil'].map(part => track(part, 'opacity', [
    key(0, 1), key(0.98, 1), key(1.08, 0, 'inOutSine'), key(1.62, 0),
    key(1.65, 1, 'inOutSine'), key(3.2, 1),
  ])),
  track('head', 'position', [key(0, [0, 0]), key(0.23, [0, -0.7], 'inOutSine'),
    key(1.28, [-1.6, 2.6], 'inOutSine'), key(1.7, [-1.6, 2.6]),
    key(2.38, [-0.9, 0.8], 'inOutSine'), key(2.95, [0, 0], 'inOutSine'), key(3.2, [0, 0])]),
  track('head', 'rotation', [key(0, 0), key(0.28, 0.5, 'inOutSine'), key(1.3, -3.8, 'inOutSine'),
    key(1.7, -3.8), key(2.38, -2, 'inOutSine'), key(3, 0, 'inOutSine'), key(3.2, 0)]),
  // A small whole-body cuddle, with the reopened eyes still holding the lean.
  track('torso', 'rotation', [key(0, 0), key(0.45, 0), key(1.45, -1.4, 'inOutSine'),
    key(1.85, -1.4), key(3.1, 0, 'inOutSine'), key(3.2, 0)]),
  track('torso', 'position', [key(0, [0, 0]), key(0.45, [0, 0]), key(1.45, [-1, 1.2], 'inOutSine'),
    key(1.85, [-1, 1.2]), key(3.1, [0, 0], 'inOutSine'), key(3.2, [0, 0])]),
  ...['ear-l', 'ear-r'].map((part, i) => track(part, 'rotation', [key(0, 0), key(0.65 + i * 0.1, 0),
    key(1.4 + i * 0.1, i ? 2.2 : -2.2, 'inOutSine'), key(1.8, i ? 2.2 : -2.2), key(3, 0, 'inOutSine'), key(3.2, 0)])),
  ...orbit('rotation', [key(0, 0), key(0.85, 0), key(1.75, 2.1, 'inOutSine'),
    key(2.1, 2.1), key(3.2, 0, 'inOutSine')]),
]);
