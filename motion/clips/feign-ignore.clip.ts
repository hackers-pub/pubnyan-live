import { clip, key, track } from '#ir/clip.ts';
import { blink } from './expression-motion.ts';
import { orbit } from './ring-motion.ts';

/** Look away, betray attention with one ear, then steal a glance back. */
export default clip('feign-ignore', { rig: 'pubnyan', duration: 3.8, fps: 60, loop: false }, [
  ...['eye-l.pupil', 'eye-r.pupil'].map(part => track(part, 'position', [key(0, [0, 0]),
    key(0.16, [0, 0]), key(0.35, [3.6, 0], 'outCubic'), key(1.9, [3.6, 0]),
    key(2.08, [-3, 0.5], 'outCubic'), key(2.8, [-3, 0.5]), key(2.94, [0, 0], 'inOutSine'), key(3.8, [0, 0])])),
  // Keep the stolen glance private: blink before giving up the turned-away pose.
  track('head', 'rotation', [key(0, 0), key(0.27, 0.6, 'inOutSine'), key(0.7, -5.2, 'inOutCubic'),
    key(0.92, -4.5, 'inOutSine'), key(2.92, -4.5), key(3.35, 0.4, 'inOutCubic'), key(3.65, 0, 'inOutSine'), key(3.8, 0)]),
  track('head', 'position', [key(0, [0, 0]), key(0.3, [0, 0]), key(0.8, [3, -0.6], 'inOutCubic'),
    key(2.92, [3, -0.6]), key(3.5, [0, 0], 'inOutSine'), key(3.8, [0, 0])]),
  track('torso', 'rotation', [key(0, 0), key(0.45, 0), key(0.98, -1.2, 'inOutSine'),
    key(3.02, -1.2), key(3.65, 0, 'inOutSine'), key(3.8, 0)]),
  track('ear-l', 'rotation', [key(0, 0), key(1.05, 0), key(1.24, -5.5, 'outCubic'),
    key(1.5, -3.8, 'inOutSine'), key(3.05, -3.8), key(3.7, 0, 'inOutSine'), key(3.8, 0)]),
  track('ear-r', 'rotation', [key(0, 0), key(0.55, 0), key(0.95, -1.8, 'inOutSine'),
    key(3.1, -1.8), key(3.75, 0, 'inOutSine'), key(3.8, 0)]),
  ...blink(3.8, 2.8).filter(t => t.property !== 'scale'),
  ...['eye-l.white', 'eye-r.white'].map((part, i) => track(part, 'shape', [key(0, 'default'),
    key(0.45, 'default'), key(0.9, 'drowsy', 'inOutSine'), key(1.9, 'drowsy'),
    key(2.12, i ? 'drowsy' : 'default', 'outCubic'), key(2.8, i ? 'drowsy' : 'default'),
    key(2.88, 'resting-eyes', 'easeIn'), key(2.92, 'resting-eyes'),
    key(3.1, 'default', 'inOutSine'), key(3.8, 'default')])),
  ...orbit('rotation', [key(0, 0), key(0.65, 0), key(1.25, 1.8, 'inOutSine'),
    key(3.12, 1.8), key(3.8, 0, 'inOutSine')]),
]);
