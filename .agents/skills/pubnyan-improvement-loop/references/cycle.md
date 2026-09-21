# Local improvement cycle reference

## 1. Preflight and ownership

- Confirm repository root, status, worktrees, `main`, `agent/backlog`, remotes,
  worker lock/process, and any claimed backlog items. Do not run two writers.
- Preserve unrelated changes. The commit gate stages all changes: a mixed dirty
  tree is not a safe commit target. Do not stash or reset the user's work to proceed.
- Read `docs/motion-direction.md`, `docs/visual-eye-review.md`, and relevant skills
  under `src/skills/` for the selected problem, not every unrelated resource.
- Check available vision/browser, render dependencies, Git signing,
  and access to the actual `run_checks` / `git_commit` tools. If invoking their
  exported `.run` through an adapter, retain their real implementation, working
  directory, exit codes, timeout, and gate. Do not reimplement or bypass the gate.
- Before final builds and checks, operate in the checkout already on `agent/backlog`.
  The current commit tool validates BEFORE switching branches; a later switch to an
  existing branch can change the tree. Never validate on `main` and assume a tool's
  later checkout preserves that result. Resolve ownership and synchronize the worker
  branch safely before editing; if it needs a non-fast-forward integration, stop and
  plan that separately. Confirm the branch is still `agent/backlog` at commit time.
- Record the exact active model ID from the runtime hook when a Codex commit
  requires attribution. Exactly one `Assisted-by: Codex:<exact-active-model-id>`;
  never infer the ID or insert an AI `Co-Authored-By`. Ask if the ID is unavailable.

### Existing worker compatibility

`npm run agent -- --max 1` processes the first open backlog item, not an arbitrary
title supplied by the outer agent. Verify which item it would select and whether
the worker is already running. It may call other model providers and needs their
credentials; a Codex session does not supply those automatically.

The Planner edits open items through `write_backlog` on `main`; the loop owns
claims and the Director owns completion. Do not directly edit another worker's
`[~]` item. `packages/*` work requires an explicitly scoped backlog item first.
Use the existing Planner or `backlog:add` only when its commit behavior is compatible
with the active runtime requirements.

Known preflight issue: `src/tools/backlog-planner.ts` currently emits a single-line
commit message without a trailer; `src/loop/` also creates bookkeeping commits and
`syncFromMain` can create a merge commit without a trailer.
Inspect those paths before running them. If the active runtime requires a trailer
on those commits and the paths cannot supply it, STOP that route and request a
scoped tooling fix or human-prepared backlog. Do not silently run the incompatible
path, amend its commits outside the gate, or disable attribution/signing.
This skill documents the workflow; it does not change those tools or their prompts.

Independent unclaimed motion/site work may use the actual commit tool directly
within repository rules. This is not permission to bypass backlog scope for
`packages/*` changes. Never turn the Director's `DONE` into a public-release claim.

## 2. Visual acceptance

Record the clip and exact times where a problem occurs. Preserve before SVGs in a
fresh temporary directory before editing; do not label a newly rendered candidate
as its own baseline. Use existing helpers from the repository root:

```sh
node scripts/motion-contact-review.mjs sleepy proud
node scripts/motion-contact-review.mjs --eyes sleepy proud
node scripts/motion-review.mjs /absolute/path/to/before-svg-directory
```

Contact review requires current exported SVGs; `motion-review.mjs` renders candidate
SVGs directly from source. Both are visual aids, not replacements for exhaustive
verification. Open `dist/verify/<clip>-contact.png` for every touched
clip as well as the curated sheets. Use the generated review HTML for playback,
eye zoom, and timeline scrubbing. Outputs are `dist/verify/<clip>-review.png`,
`dist/verify/<clip>-eyes.png`, and `dist/verify/polish-review.html` respectively.
Enumerate `motion/index.ts` rather than treating a helper's list as audit coverage:
the HTML omits `tail-flick` and non-pubnyan rigs; curated sheets only include pubnyan.
Review omitted clips using their full verifier contact sheets and actual exported
players. Fixture-only clips need correctness checks, not a cat-expression critique.

Judge at normal display size and in eye crops:

- Pupils remain within the aperture, disappear when fully closed, and reappear
  without floating dots, white slivers, abrupt opacity changes, or flattened pupils.
- Partial closures read as upper-lid motion, not simply squashed white ellipses.
- Pupil gaze, ears, head, and torso have readable sequencing and quiet recovery.
- The emotion is distinguishable and cute without enlarging every amplitude.
- Ring and star mouth remain focal; first/last poses and loop seams are continuous.
- Reference, SVG, Lottie, and Rive agree. Test expression-to-expression bridges,
  interruption, and return to idle when shared eye geometry or machine logic changes.

For shared rig/eye/export changes, expand review to all dependent clips and
transitions. Do not hand-edit extracted rig JSON; use parts maps and rig extraction.
If the vision capability is unavailable, report visual review as blocked.

## 3. Page integration acceptance

Maintain this per-candidate record with observed evidence:

| Surface | Required outcome | Evidence |
| --- | --- | --- |
| Landing Clips | discoverable name, selection, correct preview, replay | browser interaction + screenshot |
| Storybook Player | selectable clip, correct asset and actual rendering | actual story, not just index.json |
| Stage / Machine | trigger, transition, allowed-expression policy, return | click/key interaction and rendered result |
| Hero greetings | intentionally included or explicit non-goal | observed greeting list/behavior |

For a new user-facing interactive action, Stage/Machine is required unless the
accepted item explicitly calls it gallery-only. Gallery discovery does not wire
machine inputs. Inspect `motion/machine.ts`, `motion/reaction-policy.js`, `site/site.js`,
and `stories/rive.stories.ts` together; keep guards, keyboard shortcuts and tests
consistent. Respect reduced-motion behavior. Existing gallery-only clips are
integration candidates, not silently declared fully integrated.

Before local completion run `npm run site:build` and `npm run site:smoke` for changed
behavior, then browser-check the changed controls on the locally served build. Storybook/gallery count checks
alone do not prove that a particular new clip renders. Keep site building separate
from checks and benchmarks because asset exports share output paths.

## 4. Final tree and commit

Complete artifact-generating builds BEFORE the final `run_checks`. Review resulting
diffs. Reopen touched contact sheets after the gate; if a source/artifact changes
afterward, repeat affected review and the full gate. `run_checks` records the checked
tree for `git_commit`; direct `npm run check` does not populate that cache.

Stop other writers throughout gate and commit. The cache is not a concurrency lock.
Record environment identity alongside the tree (see performance reference). Never
write `data/checked-tree` yourself to force a match or restore artifacts solely to
manufacture one. If the gate regenerates unstable artifacts, investigate; do not
silently claim identical output. Use the actual tool to commit, preserving signing.
Inspect the resulting SHA, message/trailer, and changed paths. Never commit
`dist/verify/`, `data/`, `.env`, or unrelated work.

## 5. Local integration only

Do not push any ref, create a remote PR, invoke workflow dispatch, or deploy through
another service/API. This applies to the outer agent, delegated workers, and helper
commands. Prior release permission and checkpointed pending deployments are revoked
for this loop. A separate new user request is needed for any publication.

Inspect the complete local `main..agent/backlog` range, not just the latest title.
Require clean trees and a fast-forward relationship. Preserve unrelated unpublished
commits; stop if the range includes work outside this cycle's approved scope.
From the checkout that owns `main`, fast-forward it to the verified candidate and
confirm its SHA. Do not check out a branch owned by another worktree. If branches
diverge, stop integration and report their actual relationship; do not reset, rebase,
or create a merge commit outside `git_commit`. Fast-forward creates no new commit.
The local branch being ahead of origin is expected, not a trigger to push.

Use the local site build for page verification: select the changed Gallery clips,
open the actual Storybook players, and exercise required Stage controls. Inspect
rendered output, failed requests, visible errors, and closing/reopening moments.
An HTTP 200 or a hidden Storybook error template alone is not a verdict. Record the
local URL, candidate SHA, and observations. If local smoke fails, preserve diagnostics
and stop. Never claim the public site contains unpushed local changes.

After local verification and fast-forward, mark the cycle `complete` with publication
`not_requested`. No deployment run, remote URL, or GitHub credentials are required.

## 6. Checkpoint and continuation

Keep a small resumable record at `data/improvement-loop/state.json`, and detailed
evidence under `dist/verify/improvement-loop/<cycle-id>/`. Both remain untracked.
Record these fields (null when genuinely not applicable):

```json
{
  "cycle": 1,
  "phase": "discover",
  "authorization": "user-approved scope, not a reusable credential",
  "worktree": null,
  "baseSha": null,
  "candidateSha": null,
  "checkedTree": null,
  "environment": null,
  "problem": null,
  "acceptance": [],
  "visualEvidence": [],
  "pageEvidence": [],
  "checks": [],
  "performance": null,
  "publication": "not_requested",
  "consecutiveFailures": 0,
  "lastFullVisualAudit": null,
  "reviewedClips": [],
  "nextAction": null
}
```

Use phases `discover`, `improve`, `review`, `gate`, `local_integrate`,
`complete`, `waiting`, or `blocked`. Verify an existing candidate before creating
a second one. Migrate an old `release_pending` or `live_verify` checkpoint by clearing
publication authorization, reconciling local commits/checks, and completing only
local integration. Do not resume its push/deployment or wait for a nonexistent run.
Audit every registered clip initially and after every five successful cycles,
plus all dependents immediately after shared changes. Persist the audit coverage.

Choose work from observed defects, accepted integration gaps, and measured
bottlenecks; do not require a speed or aesthetic change every cycle. With no
worthwhile candidate, checkpoint `waiting` and use the host wait/scheduler (default
five-minute interval), not a busy loop. If the host cannot continue autonomously,
return the checkpoint and resume instructions. Budget limits and user stops win.
