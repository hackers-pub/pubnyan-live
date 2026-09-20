import { clip, key, track } from '#ir/clip.ts';
import { blink } from './expression-motion.ts';
import { orbit } from './ring-motion.ts';

/** Wait for the ring to stop. Look up. It moves again. Really? */
export default clip('ring-side-eye', { rig: 'pubnyan', duration: 4.8, fps: 60, loop: false }, [
  ...orbit('rotation', [key(0, 0), key(0.3, 0), key(0.8, 3.5, 'inOutSine'),
    key(1.35, -1.3, 'inOutSine'), key(1.8, 0, 'inOutSine'), key(2.65, 0),
    key(2.95, 1.8, 'inOutSine'), key(3.4, 0, 'inOutSine'), key(4.8, 0)]),
  ...['eye-l.pupil', 'eye-r.pupil'].map(part => track(part, 'position', [key(0, [0, 0]),
    key(0.55, [0, 0]), key(0.74, [1.8, 2.7], 'outCubic'), key(1.85, [1.8, 2.7]),
    key(2.08, [0, 0], 'inOutCubic'), key(2.9, [0, 0]), key(3.08, [1.4, 2.8], 'outCubic'),
    key(3.92, [1.4, 2.8]), key(4.32, [0, 0], 'inOutSine'), key(4.8, [0, 0])])),
  track('head', 'position', [key(0, [0, 0]), key(0.7, [0, 0]), key(1.02, [0.8, 3], 'inOutCubic'),
    key(1.9, [0.8, 3]), key(2.35, [0, 0], 'inOutSine'), key(3.02, [0, 0]),
    key(3.35, [0.8, 3.5], 'inOutCubic'), key(3.95, [0.8, 3.5]), key(4.6, [0, 0], 'inOutSine'), key(4.8, [0, 0])]),
  track('head', 'rotation', [key(0, 0), key(0.72, 0), key(1.08, -2.2, 'inOutCubic'),
    key(1.95, -2.2), key(2.4, 0, 'inOutSine'), key(3.03, 0), key(3.4, -3.5, 'inOutCubic'),
    key(3.95, -3.5), key(4.65, 0, 'inOutSine'), key(4.8, 0)]),
  track('ear-r', 'rotation', [key(0, 0), key(0.8, 0), key(1.15, -2, 'inOutSine'),
    key(2.45, 0, 'inOutSine'), key(3.12, 0), key(3.45, -4.5, 'outCubic'), key(4.05, -4.5), key(4.8, 0, 'inOutSine')]),
  track('ear-l', 'rotation', [key(0, 0), key(3.3, 0), key(3.6, -2.2, 'inOutSine'),
    key(4.15, -2.2), key(4.8, 0, 'inOutSine')]),
  track('torso', 'rotation', [key(0, 0), key(0.85, 0), key(1.2, 1.1, 'inOutSine'),
    key(1.9, 1.1), key(2.5, 0, 'inOutSine'), key(3.2, 0), key(3.65, 1.8, 'inOutSine'),
    key(4.1, 1.8), key(4.8, 0, 'inOutSine')]),
  ...blink(4.8, 4.02).filter(t => t.property !== 'scale'),
  ...['eye-l.white', 'eye-r.white'].map((part, i) => track(part, 'shape', [key(0, 'default'),
    key(3.12 + i * 0.05, 'default'), key(3.45 + i * 0.05, 'drowsy', 'inOutSine'),
    key(4.02, 'drowsy'), key(4.1, 'resting-eyes', 'easeIn'), key(4.14, 'resting-eyes'),
    key(4.32, 'default', 'inOutSine'), key(4.8, 'default')])),
]);
