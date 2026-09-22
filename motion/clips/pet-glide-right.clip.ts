import { clip, key, track } from '#ir/clip.ts';
import { orbit } from './ring-motion.ts';

/** Follow the travel direction with two quiet floating pulses; never mirror the drawing.
 * The eight pet frames are sampled every 120 ms through 0.84 s; the final pose
 * rests for 220 ms. A held directional pose also keeps that longer seam quiet.
 */
export default clip('pet-glide-right', { rig: 'pubnyan', duration: 1.06, fps: 60, loop: true }, [
  track('body', 'position', [
    key(0, [0, 0]), key(0.12, [0, -2.4], 'inOutSine'),
    key(0.24, [0, -0.4], 'inOutSine'), key(0.36, [0, 1.2], 'inOutSine'),
    key(0.48, [0, 0], 'inOutSine'), key(0.60, [0, -1.8], 'inOutSine'),
    key(0.72, [0, -0.3], 'inOutSine'), key(0.84, [0, 0], 'inOutSine'),
    key(1.06, [0, 0]),
  ]),
  track('torso', 'rotation', [key(0, 1.6), key(1.06, 1.6)]),
  track('head', 'position', [key(0, [1.4, 0]), key(1.06, [1.4, 0])]),
  track('head', 'rotation', [key(0, 0.5), key(1.06, 0.5)]),
  ...['eye-l.pupil', 'eye-r.pupil'].map(part => track(part, 'position', [
    key(0, [2, -0.3]), key(1.06, [2, -0.3]),
  ])),
  // Rigid orbital counterbalance trails each rise by one pet-frame sample.
  ...orbit('rotation', [
    key(0, -0.8), key(0.12, -0.8), key(0.24, -1.2, 'inOutSine'),
    key(0.36, -0.6, 'inOutSine'), key(0.48, -0.8, 'inOutSine'),
    key(0.60, -0.8), key(0.72, -1.1, 'inOutSine'),
    key(0.84, -0.8, 'inOutSine'), key(1.06, -0.8),
  ]),
  ...orbit('position', [
    key(0, [0, 0]), key(0.12, [0, 0.8], 'inOutSine'),
    key(0.24, [0, -0.4], 'inOutSine'), key(0.36, [0, -0.3], 'inOutSine'),
    key(0.48, [0, 0], 'inOutSine'), key(0.60, [0, 0.6], 'inOutSine'),
    key(0.72, [0, -0.3], 'inOutSine'), key(0.84, [0, 0], 'inOutSine'),
    key(1.06, [0, 0]),
  ]),
]);
