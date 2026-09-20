# Visual eye review

Reviewed the 26 pubnyan clips (including the tail-flick compatibility alias),
using eight-pose sheets with reference, SVG, Lottie and Rive rows, then enlarged
eye crops. This includes the eight standalone expression transitions. Numerical
parity alone is not an assessment of whether the character looks appealing.

| Family | Visual finding | Decision |
| --- | --- | --- |
| Normal / idle, head-turn, nod, wink | Early pupil restoration split barely reopened lids into bright corners. | Keep the source pupil geometry, conceal it through the narrowest aperture, then restore before the eye is half open. |
| Angry, curious, shy | These source white contours already encode the gaze or squeezed lids. Adding ordinary pupils would change the drawing. | Preserve their expressive contours; inspect closure and reopening as well as held poses. |
| Cry | Pupils remain inside the tear-filled apertures; tears fall separately from the eyes. | Preserve the crying anatomy and check both transition directions. |
| Proud / celebrate | Upward curved lids read as a smile; tiny pupil fragments appeared just before/after the closed exchange. | Retain eye-smiles, conceal their contour exchanges and adjust the pupil fade to avoid fragments. |
| Sleepy / slow-blink | Centered vertical scaling squeezed the iris between rising lower and falling upper edges. Long intermediate poses read as a suspicious stare. | Replace scaling with upper-lid contour morphs and gently curved resting lids. Sleepy opens fully during its brief attempt to stay awake. |
| Feign-ignore / ring-side-eye | Held scaled ovals inherited the same pinched-eye look. | Use the same anchored lower lid, retaining the side gaze, listening ear and delayed second glance. |
| Tilt, ear-twitch, ring-wobble / tail-flick | Silhouette and orbital overlap remain coherent; pupils stay in their apertures during gaze changes. | Preserve the acting. |
| All to/from expression clips | The contour exchange is hidden, but normal/cry pupils returned while the aperture was still only a thin slit. | Delay pupil restoration through that phase; restore fully before the aperture is half open. |

The new `drowsy` and `resting-eyes` contours share the original normal eye's cubic
command sequence. The rig is regenerated from the override SVG and parts map;
the source visual-identity submodule is untouched. The pupil is neither flattened
nor replaced by a smaller ellipse.

Verification includes an anchored-lower-lid regression, pupil-size and clipping
checks, visible-pupil checks for open eyes, concealed pupils in resting lids, and
hidden incompatible contour exchanges. Contrasting-color rendering exposes
leakage that black fur would otherwise conceal.

The internal Rive expression bridges use the same delayed pupil restoration;
all 20 directed bridges are checked, and the real Rive transition tests remain
part of the full suite.

Artifacts: `dist/verify/*-review.png` for whole poses, `*-eyes.png` for close-ups,
and `polish-review.html` for playback and before/after comparison. Regenerate a
comparison with `node scripts/motion-review.mjs <before-svg-directory>`.
