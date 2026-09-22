import { clip, key, track } from '#ir/clip.ts';
import type { Clip, Track, Vec2 } from '#ir/types.ts';

/** Clockwise screen-space gaze: 0 is up, 90 right, 180 down, 270 left. */
function poseTracks(degrees: number, times: number[]): Track[] {
  const radians = (((degrees % 360) + 360) % 360) * Math.PI / 180;
  const x = Math.sin(radians);
  const y = -Math.cos(radians);
  const position = (part: string, dx: number, dy: number) =>
    track(part, 'position', times.map(t => key<Vec2>(t, [dx * x, dy * y])));
  return [
    position('torso', 1.2, 0.8),
    position('head', 3.2, 3.5),
    // A small face turn supports the eye dart without rotating the whole cat.
    // The ring stays fixed; the white star and original pupil shapes stay rigid.
    position('face', 2.2, 2.6),
    position('nose', 2.2, 2.6),
    position('mouth', 2.2, 2.6),
    ...['eye-l', 'eye-r'].flatMap(eye => [
      position(`${eye}.white`, 1.6, 1.4),
      // Relative to each unchanged aperture: 5.8px sideways, 6px vertically.
      // The source clipTo masks remain active at every intermediate angle.
      position(`${eye}.pupil`, 7.4, 7.4),
    ]),
  ];
}

/** A held pose for one v2 look cell; no entrance, blink, or return to neutral. */
export function createPetLookClip(degrees: number): Clip {
  if (!Number.isFinite(degrees)) throw new Error('Look direction must be finite');
  const normalized = ((degrees % 360) + 360) % 360;
  return clip(`pet-look-${normalized}`, { rig: 'pubnyan', duration: 1, fps: 60, loop: false },
    poseTracks(normalized, [0, 1]));
}

// Integer seconds are the exact 16 exported poses. The last key repeats up
// exactly so the continuous review clip also has a clean cross-format loop.
const poses = Array.from({ length: 17 }, (_, i) => poseTracks((i % 16) * 22.5, [i]));
export default clip('pet-look', { rig: 'pubnyan', duration: 16, fps: 60, loop: true },
  poses[0].map((tr, index) => ({ ...tr, keys: poses.flatMap(pose => pose[index].keys) })));
