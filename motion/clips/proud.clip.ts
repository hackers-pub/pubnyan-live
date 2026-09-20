import { clip, key, track } from '#ir/clip.ts';
import { orbit } from './ring-motion.ts';

/** Quiet satisfaction: chin up, soft eyes, and a late answering ring. */
export default clip('proud', { rig: 'pubnyan', duration: 3.6, fps: 60, loop: false }, [
  // The thought grows into a held eye-smile, not a sleepy half-lid.
  // Exchange the source contours only while the aperture is fully closed.
  ...['eye-l.white', 'eye-r.white'].flatMap(part => [
    track(part, 'shape', [key(0, 'default'), key(0.65, 'default'), key(0.7, 'happy'),
      key(2.55, 'happy'), key(2.6, 'default'), key(3.6, 'default')]),
    track(part, 'scale', [key(0, [1, 1]), key(0.3, [1, 1]), key(0.65, [1, 0], 'inOutSine'),
      key(0.7, [1, 0]), key(0.95, [1, 1], 'inOutSine'), key(2.35, [1, 1]),
      key(2.55, [1, 0], 'inOutSine'), key(2.6, [1, 0]), key(2.95, [1, 1], 'inOutSine'), key(3.6, [1, 1])]),
  ]),
  ...['eye-l.pupil', 'eye-r.pupil'].map(part => track(part, 'opacity', [key(0, 1),
    key(0.49, 1), key(0.53, 0, 'inOutSine'), key(2.68, 0), key(2.73, 1, 'inOutSine'), key(3.6, 1)])),
  track('head', 'position', [key(0, [0, 0]), key(0.18, [0, 0.7], 'inOutSine'),
    key(0.85, [0, -3.8], 'inOutCubic'), key(1.1, [0, -3.2], 'inOutSine'),
    key(1.65, [0, -3.2]), key(1.88, [0, -4], 'inOutSine'), key(2.35, [0, -4]),
    key(3.3, [0, 0], 'inOutSine'), key(3.6, [0, 0])]),
  track('head', 'rotation', [key(0, 0), key(0.25, 0), key(0.95, -2.4, 'inOutCubic'),
    key(2.35, -2.4), key(3.4, 0, 'inOutSine'), key(3.6, 0)]),
  track('torso', 'position', [key(0, [0, 0]), key(0.3, [0, 0]), key(1.05, [0, -1.7], 'inOutSine'),
    key(2.4, [0, -1.7]), key(3.5, [0, 0], 'inOutSine'), key(3.6, [0, 0])]),
  track('torso', 'rotation', [key(0, 0), key(0.4, 0), key(1.15, -1.4, 'inOutSine'),
    key(2.35, -1.4), key(3.45, 0, 'inOutSine'), key(3.6, 0)]),
  ...['ear-l', 'ear-r'].map((part, i) => track(part, 'rotation', [key(0, 0), key(0.45 + i * 0.1, 0),
    key(1.15 + i * 0.1, i ? -2.8 : 2.2, 'inOutSine'), key(2.5, i ? -2.8 : 2.2), key(3.6, 0, 'inOutSine')])),
  ...orbit('rotation', [key(0, 0), key(0.65, 0), key(1.45, 2.8, 'inOutSine'),
    key(1.85, 2.1, 'inOutSine'), key(2.55, 2.1), key(3.6, 0, 'inOutSine')]),
]);
