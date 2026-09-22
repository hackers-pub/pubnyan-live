# Pubnyan Codex pet v2

This exporter samples the existing vector rig directly. It preserves the original
artwork instead of using the ImageGen workflow in the hatch-pet skill.

## Build

Requires the repository's Node dependencies, Chrome (Puppeteer), `cwebp`, and
`ffmpeg` with the `libx264` encoder.

```sh
node scripts/export-pet.mjs
```

If Puppeteer's downloaded Chrome is unavailable on macOS:

```sh
PUPPETEER_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node scripts/export-pet.mjs
```

An optional first argument changes the package output directory. The default is
`dist/pets/pubnyan/`: `pet.json`, `spritesheet.webp`, and `ATTRIBUTION.txt`.
Copy this directory to `${CODEX_HOME:-$HOME/.codex}/pets/pubnyan/` to install.
Do not overwrite an existing custom version without preserving it first.

To upgrade an installed v1/v2 atlas while preserving every existing animation
pixel, decode a backup with `dwebp` and pass the resulting PNG as argument two:

```sh
dwebp -quiet /path/to/backup/spritesheet.webp -o /path/to/backup/spritesheet.png
node scripts/export-pet.mjs dist/pets/pubnyan /path/to/backup/spritesheet.png
```

The build preserves rows 0–8, except that v2 populates the formerly unused
row 0 / column 6 with a neutral copy of idle frame 0. The existing 57 animation
frames remain identical. This neutral slot is required by the installed v2
assembler and validator, although their prose row table still describes only
the six animated idle frames.

QA is written to `dist/verify/pubnyan-pet/`: a self-contained `preview.html`
(starting paused), contact sheet, overview, PNG atlas, individual frames,
state videos, exact sample times/durations and source hashes in `states.json`,
and alpha/bounds checks in `validation.json`. Rebuilding overwrites these outputs.
The preview adds pointer-following gaze, a keyboard-accessible direction selector,
and optional clockwise playback. It starts paused and returns to neutral in the
pointer deadzone. `look-directions.png` shows all 16 directions plus neutral.
For a preserved base, `states.json` records the base pixel hash instead of claiming
that current source clips produced the preserved rows.

## State adaptation

| Codex state | Source | Acting |
| --- | --- | --- |
| idle | slow-blink | Quiet eye greeting |
| running-right | pet-glide-right | Directional gaze and gentle floating |
| running-left | pet-glide-left | Opposite gaze; artwork is not mirrored |
| waving | nod | Acknowledging nod; no invented paws |
| jumping | celebrate | Small buoyant celebration |
| failed | expr-cry | Existing sad expression and tears |
| waiting | ear-twitch | Patient listening |
| running | ring-wobble | Busy watching and balancing the ring |
| review | tilt | Curious inspecting tilt |
| look directions | pet-look | 16 clockwise gaze poses, starting at up |

The `pet-` prefix identifies clips authored for the Codex pet. `pet-glide-left`
and `pet-glide-right` provide its floating travel poses; `pet-look` provides its
v2 gaze directions. All three are current source inputs, not legacy v1 files.
They are imported directly by the exporter and do not add state-machine inputs
or change the gallery's clip registry. Original
clips are unchanged. Samples are chosen at acting beats rather than evenly
compressing every original timeline. App playback uses its fixed per-frame
holds, so it does not preserve the original clips' continuous 60 fps timing.

The atlas follows the installed hatch-pet v2 contract: 8 columns × 11 rows,
192 × 208 cells, 1536 × 2288 overall, `spriteVersionNumber: 2`.
Rows 0–8 retain counts 6/8/8/4/5/8/6/6/6. Rows 9–10 add 16 directions
in clockwise 22.5° increments: 0° is up, 90° right, 180° down, 270° left.
The separate neutral look is row 0 / column 6, making 74 populated cells in total
(57 animation, 16 directional, one neutral) and 14 transparent unused cells.
The existing rig moves original pupils inside their apertures with small head,
face and torso follow; the ring stays anchored. There is no image generation,
mirroring, pupil deformation, or whole-sprite rotation.
All states share one fixed scale and anchor. Unused cells are transparent.
Directional travel is supplied by the host app; the sprite provides its floating
pose. The preview plays the sprite in place and does not simulate desktop travel.

The build rejects empty used cells, occupied unused cells, artwork within three
pixels of a cell edge, altered alpha, and altered opaque RGB after lossless WebP
encoding/Chrome decoding. `node --test scripts/pet-layout.test.mjs` checks screen
coordinates, all 16 cells, wraparound, and neutral handling. Contact sheets and
playback still need visual review. The v2 upgrade also passed the hatch-pet atlas
validator, new-clip SVG/Lottie/Rive parity, three isolated blind direction checks
for cardinal axes, and independent labeled review. Six intermediate minor-axis
blind judgments were ambiguous; these accepted subtlety warnings and expected
negative-space warnings are retained in `dist/verify/pubnyan-pet/`.
These checks establish asset compatibility, not that a particular Codex version
has loaded or selected the custom pet.

## Files to keep in Git

Keep the three `motion/clips/pet-*.clip.ts` source files, `scripts/export-pet.mjs`,
`scripts/pet-layout.mjs`, `scripts/pet-layout.test.mjs`, this document, and the
single final package under `dist/pets/pubnyan/`.

The pet-specific SVG/Lottie/Rive exports are comparison evidence, not required
inputs to the pet builder or runtime. Keep those under ignored `dist/verify/`
after an explicit parity run. Do not commit duplicate package staging folders,
QA screenshots/reports, or v1 backups. Accepting an old atlas as build input is
intentional upgrade support; the exporter always writes v2.

Artwork: pubnyan by Bak Eunji, CC BY-SA 4.0. Source and license links are retained
in the package's attribution file.
