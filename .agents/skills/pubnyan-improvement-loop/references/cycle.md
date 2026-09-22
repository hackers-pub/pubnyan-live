# Animator iteration reference

Paths below are relative to the repository root. This reference supports acting,
rendering, and visual comparison; it is not a release procedure.

## Find the acting problem

For open-ended work, first choose an improvement or a new performance using
[autonomous discovery](discovery.md). Existing clips are references and a
repertoire to extend, not a closed list of permitted ideas.

Watch the current performance, or the nearest reference for a new clip, at
normal speed before reading every keyframe.
Name a visible problem and the moment where it occurs: an unclear thought,
a mechanical recovery, a pose that loses its emotion, or an eye artifact.
Then inspect the tracks responsible for that moment.

Useful questions:

- What is the cat thinking, and can the viewer read it without a label?
- Does the glance or ear reaction motivate the head and torso?
- Is there enough contrast between preparation, accent, hold, and recovery?
- Do the ears and ring settle with a readable delay rather than moving in lockstep?
- Does the performance return naturally to its resting pose?

For example, a sleepy cat can try to resist sleep, lose the fight with a weighted
nod, notice something with one ear, open its eyes, then lift its head and recover
its composure. These are acting choices, not a fixed recipe for every clip.

## Author within the character

Read the current clip and `motion/README.md` for the DSL. Easing belongs to the
segment ending at a key. Prefer changes to timing and spacing over adding tracks
or moving every part further. Keep translations within 8 px, rotations within
6 degrees, and torso scale within 1 ± 0.02 unless the user explicitly changes the
art direction. Use `orbit()` so both ring halves share the same movement.

Do not invent tail or paw anatomy. Preserve the star muzzle and source silhouette.
Use the existing eye contours and masks; do not squash the pupil to simulate a lid.
If a visible drawing defect really requires rig work, edit source mappings and use
the official extraction workflow. Never hand-edit extracted `rig/*.rig.json` or
`vendor/visual-identity/`. Exporter or runtime engineering is outside this skill;
record a concrete limitation rather than expanding into `packages/` work.

## Keep a real baseline

Before editing, preserve a current SVG or rendered video in a fresh directory
under `dist/verify/` or a temporary directory. If existing exports are stale, render
from the current source first. Never label a candidate rendering as its baseline.
For a new clip, label the neutral pose and nearest existing performance as
references rather than "before." Preserve the first actual draft for later revisions.

Export only the selected clips with the existing exporters. A new draft can be
imported directly from its clip module for a standalone preview; the parent adds
an accepted candidate to `motion/index.ts` before registered-clip checks/exports.
Registration does not authorize new machine inputs or UI controls.
Save final clip outputs in their normal `dist/` locations, and comparison material
under `dist/verify/`. Do not regenerate the whole site or every clip for a timing edit.

Existing visual helpers, once the affected SVG exports are current:

```sh
node scripts/motion-contact-review.mjs sleepy
node scripts/motion-contact-review.mjs --eyes sleepy
node scripts/motion-review.mjs /absolute/path/to/before-svg-directory
```

The first two helpers produce curated whole-pose and eye sheets. The third creates
`dist/verify/polish-review.html` with playback, speed, eye zoom, and timeline controls.
Its clip selector omits `tail-flick` and non-cat rigs; use a standalone player for
those when relevant. Review only the selected and genuinely affected performances.

Prefer chrome-devtools with a dedicated profile/isolated context for browser review
when available. Existing local renderers and image viewing are also useful. Do not
make OS accessibility permissions or a particular browser connector a prerequisite
when another visual-review path works.

## Check a stable candidate

Use selected-clip SVG/reference playback for the first acting review. The
multi-target contact helpers above belong to the verification pass, not every
draft tweak. Deliver early comparisons with verification explicitly pending.

When the direction is stable, run this pass as a tracked background job while
independent authoring continues. For several candidates, pass them together to
`verifyClips`; use one verification queue rather than a Chrome pool per author.
Follow [parallel.md](parallel.md) for ownership, immutable inputs, and stale
results. Changing `outputDir` alone does not isolate all existing renderer writes.

For a selected stable clip, use the existing `verifyClips` API to render reference/SVG/
Lottie/Rive and produce its verifier contact sheet. For example:

```sh
node --input-type=module <<'JS'
import { clips, getRig } from './motion/index.ts';
import { verifyClips } from './packages/verify/src/pipeline.ts';
const clip = clips.find(c => c.name === 'sleepy');
if (!clip) throw new Error('Unknown clip');
const result = await verifyClips([clip], getRig, {
  outputDir: 'dist', verifyDir: 'dist/verify', workers: 1,
  onResult: result => console.log(result),
});
if (result.report.some(result => !result.pass)) process.exitCode = 1;
JS
```

Choose the actual affected clip, not always `sleepy`. Keep the existing sample
policy and thresholds. Do not invent unsupported CLI flags or weaken a failing
comparison. Avoid concurrent exporters that write the same files. Generate
videos and shared bundles after the chosen batch settles, or when requested as
the review artifact; do not encode every intermediate draft.

Run existing focused checks when they cover the edit, for example:

```sh
npx vitest run motion/personality.test.ts motion/eyelids.test.ts -t sleepy
```

Add a regression test only for a meaningful animation defect, not to lock in taste
choices or literal keyframe times. Do not run Git/agent-loop tests. Expand visual
coverage to dependent clips if shared eye geometry changes, not automatically to
unrelated code. An animation comparison failure deserves investigation in the
changed motion or drawing; an unrelated infrastructure failure does not.
For a new clip, check which existing checks actually exercise it; a name filter
that matches no tests is not verification. Use clip validation and affected-clip
render parity, plus applicable existing motion/eye invariants.

## Judge the render

Open the affected `dist/verify/<clip>-contact.png` and curated sheets. Watch the
comparison at normal speed, then scrub closing, fully closed, and reopening poses.
Inspect pupils for leakage, white slivers, abrupt appearance, and flattening. Look
at neck and ear joins, ring overlap, the final pose, and any loop seam. Describe
what you actually saw. Format agreement supports correctness; it does not establish
appeal, emotion, or acting quality.

Use a standalone HTML/SVG player or an affected-clip video for review. If an existing
page is convenient, use it; wiring Gallery, Storybook, Stage/Machine, or hero greetings
is not part of this task. Respect existing reduced-motion preview behavior and
provide explicit playback controls.

## Deliver and resume

Lead with the change in performance, followed by a link to the playable before/after
comparison. Label the versions clearly, such as left = before, right = after. Mention
focused checks briefly and accurately; do not call them a full release validation.
For new work, lead with the new emotional thought/gesture and its preview, then
name the nearest reference and what visibly distinguishes it.

A concise note contains `clip`, `actingIntent`, `before`, `after`, `observations`,
and `nextArtisticStep`. For pending or completed verification, add candidate/input
identity, check status, job/session ID when running, log/report paths, and the
command needed to resume. Separate visual review from numerical parity; neither
implies the other. No Git or page-integration milestone is needed for an animation
draft. Preserve other work in the checkout.
