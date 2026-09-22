import { clip, key, track } from '#ir/clip.ts';
import { orbit } from './ring-motion.ts';

/** An involuntary upward flinch, a frozen stare, then one cautious check. */
export default clip('startle-check', { rig: 'pubnyan', duration: 3.6, fps: 60, loop: false }, [
  // Open the aperture, never resize the pupils: a clear held shock before looking.
  ...['eye-l.white', 'eye-r.white'].map(part => track(part, 'scale', [
    key(0, [1, 1]), key(.3, [1, 1]), key(.38, [1.1, 1.15], 'outCubic'),
    key(1.12, [1.1, 1.15]), key(1.38, [1, 1], 'inOutSine'), key(3.6, [1, 1]),
  ])),
  // No searching during the shock: the open source eyes stay fixed until it passes.
  ...['eye-l.pupil', 'eye-r.pupil'].map(part => track(part, 'position', [
    key(0, [0, 0]), key(.3, [0, 0]), key(.36, [0, -.7], 'outCubic'),
    key(1.25, [0, -.7]), key(1.4, [1.7, -.3], 'outCubic'),
    key(1.9, [1.7, -.3]), key(2.22, [0, 0], 'inOutCubic'), key(3.6, [0, 0]),
  ])),
  track('ear-r', 'rotation', [
    key(0, 0), key(.3, 0), key(.38, -6, 'outCubic'),
    key(1.18, -6), key(1.55, -4.3, 'inOutSine'), key(2, -4.3),
    key(2.8, -.5, 'inOutCubic'), key(3.12, 0, 'inOutSine'), key(3.6, 0),
  ]),
  track('ear-l', 'rotation', [
    key(0, 0), key(.32, 0), key(.4, 5.5, 'outCubic'),
    key(1.2, 5.5), key(1.65, 3.8, 'inOutSine'), key(2.05, 3.8),
    key(2.9, .4, 'inOutCubic'), key(3.22, 0, 'inOutSine'), key(3.6, 0),
  ]),
  // Head and chest rise together; the leftward lean reinforces the recoil.
  track('head', 'position', [
    key(0, [0, 0]), key(.31, [0, 0]), key(.4, [-1.6, -5.6], 'outCubic'),
    key(1.24, [-1.6, -5.6]), key(1.58, [-1.3, -4.6], 'inOutSine'),
    key(1.96, [-1.3, -4.6]), key(2.86, [0, 0], 'inOutCubic'), key(3.6, [0, 0]),
  ]),
  track('head', 'rotation', [
    key(0, 0), key(.31, 0), key(.4, -1.2, 'outCubic'),
    key(1.26, -1.2), key(1.64, -.8, 'inOutSine'), key(1.96, -.8),
    key(2.85, 0, 'inOutCubic'), key(3.6, 0),
  ]),
  track('torso', 'position', [
    key(0, [0, 0]), key(.32, [0, 0]), key(.42, [-.7, -2.3], 'outCubic'),
    key(1.26, [-.7, -2.3]), key(1.7, [-.5, -1.8], 'inOutSine'),
    key(2.06, [-.5, -1.8]), key(3.02, [0, 0], 'inOutCubic'), key(3.6, [0, 0]),
  ]),
  track('torso', 'rotation', [
    key(0, 0), key(.32, 0), key(.42, -.6, 'outCubic'),
    key(1.3, -.6), key(2.05, -.4, 'inOutSine'),
    key(3.05, 0, 'inOutCubic'), key(3.6, 0),
  ]),
  // The rigid orbit answers after the cat has stopped, then settles last.
  ...orbit('rotation', [
    key(0, 0), key(.42, 0), key(.7, 1.5, 'inOutSine'),
    key(1.12, .9, 'inOutSine'), key(2.15, .9),
    key(3.04, -.2, 'inOutCubic'), key(3.48, 0, 'inOutSine'), key(3.6, 0),
  ]),
]);
