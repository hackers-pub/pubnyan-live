# Autonomous performance discovery

Turn an open-ended request into a small authored performance, not just suggestions.
The parent selects the idea; a fresh author executes the bounded draft. This
reference applies to existing-clip improvements and new emotions or gestures.

## Find a useful gap

Read the clip registry and acting direction, then watch a small relevant sample.
Use prior iteration notes to avoid repeating rejected or already-covered ideas.
Do not audit or rebuild the whole library before trying one useful candidate.

Look for a missing thought or situation: noticing, deciding, reacting, recovering,
or relating to the viewer or ring. Possible starting points include a hesitant
greeting, relief after uncertainty, or quietly trying again after embarrassment.
These are examples to assess against the actual repertoire, not a fixed backlog
or an instruction to build all of them.

Generate two or three candidates. For each, note:

- The thought/situation and why it belongs to calm Pubnyan.
- The nearest existing clip and the visible difference in gaze, pose or sequence.
- Preparation, accent, readable hold, recovery, and whether it loops or ends.
- Whether current rig anatomy supports it; any shared dependency or drawing need.

Pick one by emotional clarity, repertoire value and cost to prototype. A clear
defect may deserve priority over expansion. When the user asks for new expressions,
actually attempt a distinct new performance rather than only polishing old clips.
Choose timing and details autonomously within the character direction; involve
the user only if a choice would materially change the requested art direction or scope.

## Prototype and select

Create the smallest complete performance in `motion/clips/`, with a unique name
that does not collide with an existing clip or another author's assignment.
Use existing eye contours, pupils, articulated joints and rigid ring first.
New feelings can read through sequencing and gaze without adding new eye geometry.
Keep the documented amplitude limits, source silhouette and star muzzle.
No invented paws, tail, walking anatomy, or unrequested redesign.

Save a fresh neutral/reference rendering and a nearby existing clip as labeled
references. Render the new draft as standalone SVG/reference playback before
expensive export verification. Parent-owned registration happens after artistic
selection. Authors request shared rig/helper changes through the parent.

Judge the actual performance at normal speed and avatar size, then inspect eyes
and joins closely. Ask whether the thought is legible without its label, whether
it differs from the nearest existing performance, and whether the recovery feels
calm and intentional. A new title, bigger amplitude, or random timing is not a
new emotion. Record one decision:

- **Keep:** the thought reads, fits Pubnyan and adds useful variety; register it
  and queue the stable candidate for affected-clip verification.
- **Revise:** the idea is useful but a specific beat fails; make one focused
  revision and compare against the saved first draft.
- **Reject:** it duplicates an existing performance or does not fit the character;
  keep evidence and the reason outside the shipped registry. Remove only this
  iteration's own abandoned edits; preserve pre-existing/user work.

If playback cannot be observed, label artistic selection provisional rather than
claiming it succeeded. Numerical parity alone cannot promote a candidate.

## Carry decisions forward

Keep a concise iteration note under a fresh `dist/verify/` candidate directory:
candidate/clip, thought, nearest reference, visible distinction, keep/revise/reject
decision and evidence, changed paths, verification identity/status, and next step.
The parent passes only the relevant note, constraints and file paths to the next
fresh author. Record why rejected ideas failed so later authors do not rediscover
them without new evidence.

Continue within the user's requested batch or goal. A bare skill invocation makes
one selected candidate; it does not start an endless autonomous run. When no useful
candidate survives review, report that instead of filling a novelty quota.
New standalone emotional performances are in scope. App emotion enum changes,
machine states/inputs, interaction policies, UI controls, deployment and commits
still require their separately authorized workflows.
