# Parallel authoring and verification

The first deliverable is a playable acting draft. Use concurrency to keep that
feedback loop short while stable candidates receive thorough verification.

## Assign work by dependency

The parent sets a short common direction and dispatches independent clips with:

- Clip name, acting beats, permitted source files, and protected shared files.
- An immutable before render and a unique candidate artifact directory, such as
  `dist/verify/drafts/proud-v2/` (use a fresh unused directory for each candidate).
- Required return: changed paths, playable comparison, visual observations,
  input identity, and verification status. A subagent must not claim visual
  review from numerical parity alone.

One author owns each clip. Two authors may work on `proud` and `sleepy` in
parallel if they only change their assigned clip files. The parent owns
`motion/index.ts`, shared eye/ring helpers, source rig mappings, combined
previews, manifests, and bundles. A request to change one of these goes back to
the parent; settle the shared change before dependent clips continue. Do not
start a second author for the same clip merely to fill a slot.

Distinct clip names are not proof of independence. Shared eye contours, clip
aliases, helpers, and simultaneous machine layers can couple their behavior.
Check actual imports and channel ownership. Broaden the relevant review after
a shared change; wiring new machine inputs remains outside animator scope.

## Run verification without racing edits

Prefer one verifier for a small batch of stable candidates. Start with at most
two render workers total, not two per author. Keep source authoring parallel;
serialize expensive rendering when it competes with interactive playback.

For verification concurrent with edits, use a stable source snapshot in a
temporary execution directory. Copy the required source/config/rig inputs;
share dependencies only read-only. Run the tools from the copied tree so their
module-relative output paths resolve inside it. This needs no Git branch,
commit, or worktree. Do not run a tool against a live dependency being edited.

For the current local tools, start the snapshot with `package.json`, the lockfile,
`motion/`, `rig/`, `packages/`, and the selected `scripts/` helpers; include test
configuration when running tests. Copy current uncommitted candidate content,
not just HEAD. Record the copied-file manifest and hashes; check tool imports
for further inputs. Do not symlink these mutable source directories back to the
live tree. Dependencies must remain unchanged during the job too.

If a runnable snapshot is unavailable, the verifier owns the input dependency
closure and output paths until the job finishes. Only work outside that closure
can continue. `motion/index.ts` imports the full clip registry: even a selected
clip invocation must not race an unfinished registration or module edit.

Existing output hazards:

- `verifyClips` has `outputDir` and `verifyDir`, but its SVG target also writes
  module-relative `dist/svg/<clip>.svg`. Separate report directories alone do
  not isolate it.
- `motion-review.mjs` reads the whole clip registry and overwrites
  `dist/verify/polish-review.html`; only the coordinator runs it in the shared tree.
- Contact helpers write per-clip sheets and may invoke target renderers.
  Coordinate them with parity jobs for the same clip.
- Full verification writes every clip, videos, machine files, bundles and reports.
  Run it once for a settled integration batch when required; isolate it from
  authoring. A snapshot result does not replace the repository commit gate.

Use unique before/after paths and keep the before render intact. Promote only
the chosen candidate's outputs after matching its inputs to the current source.

## Track candidates and jobs

Record a candidate identifier plus content hashes of its source, rig, shared
helpers, registration and relevant renderer/config inputs. HEAD alone cannot
identify a dirty-tree draft. Record the command, execution directory, tool
session or job ID, log/report paths, and status:

| Status | Meaning |
| --- | --- |
| queued | Candidate saved; no verifier has started. |
| running | A real job exists with an observable session/job ID. |
| passed / failed | The command exited; reports belong to the recorded inputs. |
| stale | Relevant inputs changed after the job's snapshot. |

Source changes during a run do not become verified by its eventual green result.
Compare inputs before accepting results. Preserve old evidence, mark it stale
for the current draft, and queue only the latest stable candidate. A shared-eye
change invalidates all dependent candidates, not just the author's clip.

Use managed tool sessions or a verifier subagent that the parent can monitor.
While waiting, author/review an independent clip or share the current preview.
At handoff, report what ran and what is pending. If the host cannot keep jobs
alive after the turn, leave a resumable queued/pending note instead of claiming
continued execution. Before relabeling a running job as pending, confirm it has
finished or been cancelled; retain its actual running state and ID until then.
Do not launch duplicate detached jobs to create the appearance of progress.

Verification failures return to the relevant author with clip, time/pose,
target, report, and input identity. An infrastructure failure is reported
separately and does not block independent artistic drafts. A separately
requested commit still waits for the repository's required gate on its final
contents; do not change signing policy, bypass the gate, or manually bless a
check cache as part of this animator workflow.
