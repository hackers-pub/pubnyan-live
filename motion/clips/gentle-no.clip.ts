import { clip, key, track } from '#ir/clip.ts';

// The center crossings retain velocity; only the extremes ease to a stop.
// Small intermediate poses preserve the star's volume across the front view.
export const yawPoses = [
  [.34, 0, 'linear'], [.43, -.28, 'easeIn'], [.66, -1, 'easeOut'],
  [.789, -.5, 'easeIn'], [.834, -.2, 'linear'], [.864, 0, 'linear'],
  [.894, .2, 'linear'], [.939, .5, 'linear'], [1.032, .86, 'easeOut'],
  [1.14, .43, 'easeIn'], [1.184, .15, 'linear'], [1.208, 0, 'linear'],
  [1.232, -.15, 'linear'], [1.32, -.42, 'easeOut'],
  [1.59, 0, 'inOutSine'],
] as const;
export const yawName = (turn: number) => turn === 0 ? 'default' : `no-natural-${String(turn).replace('-', 'm').replace('.', 'p')}`;
const motion = yawPoses.map(([t, turn, ease]) => key(t, yawName(turn), ease));

export default clip('gentle-no', { rig: 'pubnyan', duration: 3.2, fps: 60, loop: false }, [
  ...['head','ear-l','ear-r','face','nose','mouth'].map(part => track(part, 'shape', [
    key(0,'default'), ...motion, key(3.2,'default'),
  ])),
  ...['eye-l.white','eye-r.white'].map(part => track(part,'shape',[
    key(0,'default'),key(.22,'default'),key(.33,'drowsy','inOutSine'),
    ...yawPoses.filter(([t])=>t>=.43).map(([t,turn,ease]) => key(t,turn===0?'resting-eyes':yawName(turn),t===.43?'inOutSine':ease)),
    key(1.75,'resting-eyes'),key(1.92,'drowsy','inOutSine'),
    key(2.16,'default','inOutSine'),key(3.2,'default'),
  ])),
  ...['eye-l.pupil','eye-r.pupil'].map(part => track(part,'opacity',[
    key(0,1),key(.355,1),key(.397,0,'inOutSine'),key(1.81,0),
    key(1.86,1,'inOutSine'),key(3.2,1),
  ])),
]);
