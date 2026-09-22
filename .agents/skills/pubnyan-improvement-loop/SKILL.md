---
name: pubnyan-improvement-loop
description: Use when improving Pubnyan's character animation, emotional acting, poses, timing, or eye motion through visual review. Not for repository maintenance, application wiring, or verification-performance work.
---

# Pubnyan animator loop

Work as a character animator. The deliverable is a more readable, appealing
performance with rendered before/after evidence. A commit, a green repository
suite, or a new UI button is not an animation improvement.

## Start with the performance

Read repository `AGENTS.md` for asset protections, then
[the animator reference](references/cycle.md). Use `docs/motion-direction.md`
and `docs/visual-eye-review.md` for the character's acting and eye construction.
Inspect the requested clip in `motion/index.ts` and `motion/clips/`. If no clip
is specified, watch a few relevant performances and choose one visible weakness.
Do not require a full-library audit before making the first useful improvement.

Describe the intended acting in a few beats: what the cat notices or feels,
its preparation, accent, hold, and recovery. Choose reasonable details and
start within the user's request; ask only when a missing artistic preference
would materially change the result.

## Draft first, verify separately

1. Preserve an actual before rendering before editing.
2. Make one coherent acting change: timing, easing, anticipation, gaze,
   overlapping motion, pose, or expression. Start in `motion/clips/`.
3. Watch before/after at normal speed and scrub the critical moments. Inspect
   eyes close up and the whole character at avatar size. Revise until the
   improvement reads in motion, not just in a still or a numerical report.
4. Share the playable SVG/reference draft and acting direction as soon as they
   are visually reviewable. Label cross-format checks **pending**; do not wait
   for Lottie/Rive, video encoding, or a full build to ask for artistic feedback.
5. Once a candidate's direction is stable, queue affected-clip exports, parity,
   and relevant existing checks as a separate verification job. Continue useful
   work on independent clips while it runs. Batch stable candidates; coalesce
   superseded drafts rather than verifying every keyframe tweak.
6. Inspect the resulting contact sheets and report verification against the
   exact candidate tested. A draft can be delivered with checks pending or
   blocked, but it is not a verified result. Describe visual limitations too.

Keep Pubnyan calm. Use clear sequencing before increasing amplitude. Preserve
pupil geometry and containment; let authored lids cover the eyes rather than
flattening the pupils. Keep the ring rigid and the star muzzle readable.

## Parallel work

For multiple independent clips, use subagents with one owner per clip and a
shared acting direction. The parent coordinates integration and reviews the
combined result. For one clip, keep authoring local; a verifier can work alongside
the author only on a stable snapshot. Use a small worker pool so Chrome renders
do not crowd out interactive review.

Before dispatching or starting background verification, read
[parallel authoring and verification](references/parallel.md). Assign source and
artifact paths explicitly. Serialize shared rig/helper/registration edits and
shared output writers. Runtime emotion blending or shared eye construction makes
apparently separate clips dependent; review those interactions after integration.

## Scope

Animation work includes clip authoring, necessary clip registration, source rig
mapping when the drawing needs it, and the affected exports and visual previews.
Honor the repository's protections for `vendor/`, extracted rigs, and `packages/`.
Use existing render/preview tools; small preview-specific adjustments are fine.

This skill does not run a Git workflow: no branch/worktree planning, backlog
worker, commits, merging, pushing, or deployment. It does not add Stage/Machine
inputs, page controls, CI changes, signing fixtures, benchmarks, caches, or
repository-wide test repairs. Such engineering work needs a separate user request.
Do not invoke `run_checks`, `git_commit`, `npm run check`, unqualified `npm test`,
or whole-library verification as an animator completion gate. Repository commit
rules apply if committing is separately requested; they do not require a commit
for an animation draft. If a commit is requested for a batch, consolidate the
chosen candidates before running its required gate. Full-suite verification is
a separate integration job, not the inner artistic loop. This skill does not
relax the commit gate or authorize manual check-cache updates to claim a pass.

## Continue without operational detours

A bare invocation means one useful visual iteration. Repeat when the user asks
for continued iterations, selecting the next change from observed acting or
rendering problems. If no further worthwhile change is evident, deliver the current
result for artistic feedback. Respect user stops and host limits. Background
means an actually launched, tracked job; report queued, running, passed, failed,
or stale accurately. Do not promise that a job survives the turn unless the
host supports that lifecycle. Preserve a resumable pending note when it does not.

An old checkpoint is a source of clip names and visual evidence only. Ignore its
Git, signing, gate, deployment, and integration phases; never resume those jobs
from this skill. A short note with the clip, intent, observations, evidence paths,
and next artistic adjustment is enough for resumption.

Fix small local preview invocation problems and keep going. An unrelated Git,
authentication, test-suite, or Storybook failure is not a reason to halt animation
work or repair infrastructure. Use a standalone clip preview when possible. If
the animation itself cannot be rendered or seen, preserve the draft and explain
that specific limitation instead of claiming visual success.
