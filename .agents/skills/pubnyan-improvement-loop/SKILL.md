---
name: pubnyan-improvement-loop
description: Use when discovering, creating, or improving Pubnyan's emotions, gestures, character animations, poses, timing, or eye motion through visual review. Not for repository maintenance, application wiring, or verification-performance work.
---

# Pubnyan animator loop

Work as a character animator. The deliverable is a more readable, appealing
performance with playable evidence: before/after for existing clips, a clearly
labeled new performance and reference pose for new clips. A commit, a green repository
suite, or a new UI button is not an animation improvement.

## Start with the performance

Read repository `AGENTS.md` for asset protections, then
[the animator reference](references/cycle.md). Use `docs/motion-direction.md`
and `docs/visual-eye-review.md` for the character's acting and eye construction.
Inspect the requested clip in `motion/index.ts` and `motion/clips/`. If no clip
is specified, watch a few relevant performances and choose either a visible
weakness to improve or a missing emotion/gesture to explore.
Do not require a full-library audit before making the first useful improvement.

Describe the intended acting in a few beats: what the cat notices or feels,
its preparation, accent, hold, and recovery. Choose reasonable details and
start within the user's request; ask only when a missing artistic preference
would materially change the result.

## Discover, create, select

Read [autonomous discovery](references/discovery.md) when choosing what to make.
Generate two or three grounded candidates from the current repertoire and recent
review notes. Include a new emotion or gesture when exploration is requested.
Select the most promising candidate yourself and build a small playable draft;
do not stop at an idea list or ask the user to choose every clip.

Choose between improving an existing performance and adding a distinct one.
Judge the thought, silhouette, timing and character fit in motion, then keep,
revise, or reject the candidate with evidence. Novelty is useful only when the
performance reads differently from its nearest existing clip. A new emotion
here is a standalone performance, not a new application emotion state.

## Draft first, verify separately

1. Preserve an actual before rendering for an existing clip. For a new clip,
   preserve a neutral/reference pose and the nearest existing performance as
   references; never invent a "before" version of a nonexistent animation.
2. Author one coherent performance or acting change: timing, easing, anticipation, gaze,
   overlapping motion, pose, or expression. Start in `motion/clips/`.
3. Watch the new performance or before/after at normal speed and scrub the critical moments. Inspect
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

The parent owns direction, candidate selection, scheduling, integration and
review. When subagents are available, start a fresh author for each selected
candidate/iteration, including a single-clip iteration, with no inherited chat
history (`fork_turns: "none"` in Codex). Hand over only the compact brief and
evidence described in the parallel reference. Do not reuse a completed author
for the next iteration. Without subagents, follow the same brief locally and
state that context isolation was unavailable.

Independent clips may have parallel authors, one owner per clip. A verifier can
work alongside an author only on a stable snapshot. Use a small worker pool so
Chrome renders do not crowd out interactive review.

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

A bare invocation means one useful discovery-and-draft iteration. Repeat when
the user asks for continued iterations, using observed weaknesses and missing
performances to select the next candidate. Before concluding that nothing useful
remains, consider both improvement and repertoire expansion. If neither yields
a worthwhile candidate, deliver the evidence and stop; do not manufacture novelty.
Respect the user's batch/goal stopping condition and host limits. Background
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
