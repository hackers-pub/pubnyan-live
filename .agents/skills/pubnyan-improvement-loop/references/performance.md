# Local verification: faster without a weaker verdict

Read `docs/check-performance.md`, `scripts/benchmark-verify.mjs`, and the current
verifier before proposing changes. CodSpeed is disabled; use local wall-clock
measurements and local profilers only. `packages/*` modifications require a backlog
item explicitly permitting those paths. Missing scope is a planning task, not an
excuse to edit packages directly.

## Separate feedback from the local completion gate

| Phase | Work | Meaning |
| --- | --- | --- |
| Edit | targeted tests, affected renders, eye crops | quick feedback, not final approval |
| Measure | equivalent isolated baseline/candidate benchmark | performance evidence only |
| Local completion | full `run_checks` / `npm run check`, visual review, local page smoke | complete validation; no push/deploy |

Do not invent a `verify --clips` or `check --quick` flag. The existing benchmark
supports `--clips`, `--workers`, and `--stage`; inspect other commands before use.
The benchmark may write normal SVG paths despite using a temporary output directory.
Run it alone. Vitest, verify, and site exports also share paths: no concurrent runs
without proving output isolation. Start with the existing bounded worker pool;
more workers can cause contention, memory pressure and nondeterministic screenshots.

## Measurement recipe

1. Capture baseline SHA, dirty diff, host, Node, Chrome, encoders, lockfile, worker
   count, clip list and stages. Keep output evidence separate for each run.
2. Measure one warm-up and at least three baseline runs; do the same for candidate,
   alternating versions where feasible. Never benchmark two variants concurrently.
3. Use an identical representative workload, including expensive eye/tear clips:

   ```sh
   npm run verify:bench -- --workers 2 --clips expr-curious,expr-cry --stage both
   ```

   `dist/verify/benchmark-2-workers.json` is overwritten on every run: copy it to
   the cycle's baseline/candidate run directory immediately. Choose Chrome using
   `PUPPETEER_EXECUTABLE_PATH` only when required; record the actual version/path.
4. Report all runs, median, range, absolute seconds saved, and percentage. If the
   difference is within observed variability, report it as inconclusive. Preserve
   correctness counts and compare verdicts, skipped cases, ordering, and diagnostics.
5. Validate the candidate with the full gate. Report full-suite elapsed time
   separately from the representative workload; do not extrapolate its speedup.

Inspect `dist/verify/timings.json` to locate the dominant phase. Existing reference
reuse and two-worker parallelism are already implemented: do not propose them as
new wins. Candidate areas include repeated target preparation and safe cache reuse,
but accept only measured changes with regression coverage.

## Invariants

Keep targets, clips, sampled times, thresholds, skip policy, video frames/formats,
machine transitions, first/worst-frame diagnostics, and vision review intact.
Do not count fewer tests, shorter videos, relaxed diffs, larger timeouts, or stale
artifacts as verification speedups. Inject a known mismatch in a disposable test
fixture and prove the optimized path still detects it. Do not alter vendor assets.

Cache changes need tests for hits AND invalidation: source, rig, exporter, verifier,
lockfile, Chrome/runtime/encoder version, settings, missing/corrupt output, failed
prior run, and source mutation while verification is running. Failure must not
publish a successful cache entry. Include output fingerprints and atomic publication.

Current `data/checked-tree` stores a Git tree only. A matching hash does not prove
the environment matches, the vision review happened, or the local pages were checked.
Run fresh `run_checks` when environment provenance is absent/changed, even if the
tree matches. Never manually populate that cache. A full-run cache hit may avoid
duplicate gate work in the same unchanged environment, not the local page smoke test.

## Accept or reject

Accept a scoped optimization only with repeatable timing improvement and unchanged
validation semantics, full passing checks, and visually reviewed artifacts. Keep
performance and motion changes independently reviewable. If results are noisy,
retain the evidence and move to another candidate; do not accumulate speculative
complexity merely to keep the loop producing commits.
