---
name: pubnyan-improvement-loop
description: Use when repeatedly improving pubnyan-live animation quality, eye rendering, page integration, or verification speed in a local-only improvement loop.
---

# Pubnyan improvement loop

An outer-agent workflow, not a daemon. Each cycle ends with evidence of improvement,
local verification, and a local commit/fast-forward merge. No-change cycles are legitimate.
Do not push any branch or tag, create remote PRs, or trigger deployments. Publication
requires a separate new user request outside this loop, not an old authorization.

## Load and resume

Read repository `AGENTS.md`, then [the cycle reference](references/cycle.md).
For timing or cache work also read [verification performance](references/performance.md).
Paths in these references are relative to the repository root unless stated otherwise.
Use `docs/prompts/pubnyan-improvement-loop.md` as the explicit invocation contract.
This project skill lives in `.agents/skills/` for Codex discovery. Existing Flue
agents do not automatically load it; pass relevant acceptance criteria to the worker.

Read `data/improvement-loop/state.json` if present; reconcile it with local Git
before resuming. It is a checkpoint, not proof. Record the authorization scope,
current phase, worktree, candidate SHA, failure count, evidence paths, and next action.
Never store credentials there. An old checkpoint cannot grant fresh permission.

## One cycle

1. **Discover:** inspect all registered clips on the first run; subsequently review
   affected clips and rotate through the remainder. Select one evidenced visual,
   integration, or validation-performance problem. Read applicable motion/rig skills.
2. **Define:** state observable acceptance criteria and allowed files. Page integration
   explicitly distinguishes Gallery, Storybook Player, interactive Stage/Machine,
   and hero greetings. Assign each a required outcome or a justified non-goal.
3. **Improve:** preserve a before rendering; make one bounded change. For speed work,
   measure equivalent baseline/candidate workloads and preserve coverage.
4. **Review:** open actual rendered images, including touched contact sheets and eye
   crops; play/scrub closing, closed, and reopening phases. Record observations,
   not just filenames. Run focused checks while iterating.
5. **Gate:** run the complete check against the final candidate, review page behavior,
   and commit through the repository's real `git_commit` tool. Reuse its cache only
   with matching tree AND known unchanged environment. Verify no unrelated changes
   were swept into the commit.
6. **Integrate locally:** fast-forward local `main` to the verified candidate and
   confirm the resulting SHA. Check the built pages locally; do not push or deploy.
7. **Checkpoint:** record verdict, evidence, timings, local commit, and next
   candidate. Wait when no useful change is supported; do not manufacture commits.

## Loop boundaries

The invocation chooses one cycle or continued cycles. Use the host's supported
continuation/wait mechanism, obey its budget, and checkpoint before yielding.
A prompt alone does not provide background execution or restart a closed session.
Do not launch nested infinite `npm run agent` processes. The existing worker can
perform a bounded backlog task; it does not perform this entire outer workflow.

Stop for signature/authentication failures, conflicting worktree ownership, merge
conflicts/divergence, missing required tools, or failed local page smoke tests.
Preserve work and report the exact unfinished phase. After three failed improvement
attempts stop for review. No push, signing bypass, automatic rollback, or deployment
dispatch. A resumed run rechecks the reported blocker without reviving old release tasks.
