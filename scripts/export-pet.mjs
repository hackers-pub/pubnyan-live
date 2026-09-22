import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import puppeteer from 'puppeteer';
import { PNG } from 'pngjs';
import { clips, getRig } from '../motion/index.ts';
import { sampleClip } from '../packages/ir/src/sample.ts';
import { renderStaticSvg, ATTRIBUTION } from '../packages/ir/src/svg.ts';
import { validateClip } from '../packages/ir/src/clip.ts';
import { assertValid } from '../packages/ir/src/validate.ts';
import glideRight from '../motion/clips/pet-glide-right.clip.ts';
import glideLeft from '../motion/clips/pet-glide-left.clip.ts';
import petLook from '../motion/clips/pet-look.clip.ts';
import { lookIndex, lookCell } from './pet-layout.mjs';

// This is a source-rig export, not an ImageGen/hatch-pet generation run.
// Atlas contract: ~/.codex/skills/hatch-pet/references/animation-rows.md.
const out = resolve(process.argv[2] ?? 'dist/pets/pubnyan');
// Optional decoded PNG from an existing pet: preserve rows 0–8 byte for byte.
const basePath = process.argv[3] ? resolve(process.argv[3]) : null;
const base = basePath ? PNG.sync.read(await readFile(basePath)) : null;
if (base && (base.width !== 1536 || ![1872, 2288].includes(base.height))) throw Error('Base atlas must be 1536×1872 or 1536×2288');
const qa = resolve('dist/verify/pubnyan-pet');
const W = 192, H = 208, COLS = 8, ROWS = 11;
const byName = new Map([...clips, glideRight, glideLeft, petLook].map(c => [c.name, c]));
const regular = (n, ms, last) => [...Array(n - 1).fill(ms), last];
const states = [
  { id: 'idle', label: '편안한 눈인사', clip: 'slow-blink', times: [0, .72, 1.12, 1.62, 1.94, 3.2], durations: [280, 110, 110, 140, 140, 320] },
  { id: 'running-right', label: '오른쪽으로 둥실', clip: 'pet-glide-right', times: [0, .12, .24, .36, .48, .60, .72, .84], durations: regular(8, 120, 220) },
  { id: 'running-left', label: '왼쪽으로 둥실', clip: 'pet-glide-left', times: [0, .12, .24, .36, .48, .60, .72, .84], durations: regular(8, 120, 220) },
  { id: 'waving', label: '고개로 인사', clip: 'nod', times: [0, .1, .27, .85], durations: regular(4, 140, 280) },
  { id: 'jumping', label: '작은 기쁨', clip: 'celebrate', times: [0, 1/6, .4, .65, 1.5], durations: regular(5, 140, 280) },
  { id: 'failed', label: '시무룩', clip: 'expr-cry', times: [0, .66, .9, 1.2, 1.65, 2.5, 3.95, 4.8], durations: regular(8, 140, 240) },
  { id: 'waiting', label: '귀를 기울이며 기다리기', clip: 'ear-twitch', times: [0, .13, .24, .37, .55, .75], durations: regular(6, 150, 260) },
  { id: 'running', label: '링을 살피며 작업 중', clip: 'ring-wobble', times: [0, .34, .58, .88, 1.32, 1.8], durations: regular(6, 120, 220) },
  { id: 'review', label: '고개를 기울여 검토', clip: 'tilt', times: [0, .11, .32, .7, .97, 1.2], durations: regular(6, 150, 280) },
  { id: 'look-a', label: '시선 0°–157.5°', clip: petLook.name, times: [0,1,2,3,4,5,6,7], durations: Array(8).fill(400) },
  { id: 'look-b', label: '시선 180°–337.5°', clip: petLook.name, times: [8,9,10,11,12,13,14,15], durations: Array(8).fill(400) },
];
const rig = getRig('pubnyan');
for (const state of states) {
  const clip = byName.get(state.clip);
  if (!clip || state.times.length !== state.durations.length || state.times.length > COLS) throw Error(`Invalid state ${state.id}`);
  assertValid(validateClip(clip, rig), state.clip);
  if (state.times.some(t => t < 0 || t > clip.duration)) throw Error(`Invalid sample time in ${state.id}`);
}
await mkdir(out, { recursive: true });
await mkdir(join(qa, 'frames'), { recursive: true });
await mkdir(join(qa, 'videos'), { recursive: true });
const atlas = new PNG({ width: W * COLS, height: H * ROWS });
atlas.data.fill(0);
if (base) PNG.bitblt(base, atlas, 0, 0, W * COLS, H * 9, 0, 0);
const browser = await puppeteer.launch({ args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [] });
const checks = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  for (const [row, state] of states.entries()) {
    for (const [column, time] of state.times.entries()) {
      // Use one fixed scale/anchor across every state: no per-pose crop or normalization.
      let buffer;
      if (base && row < 9) {
        const preserved = new PNG({ width: W, height: H });
        PNG.bitblt(base, preserved, column * W, row * H, W, H, 0, 0);
        buffer = PNG.sync.write(preserved);
      } else {
        const svg = renderStaticSvg(sampleClip(rig, byName.get(state.clip), time), rig.artboard);
        await page.setContent(`<style>html,body{margin:0;background:transparent;overflow:hidden}svg{position:absolute;left:8px;top:32px;width:176px;height:auto}</style>${svg}`);
        buffer = Buffer.from(await page.screenshot({ type: 'png', omitBackground: true }));
      }
      const frame = PNG.sync.read(buffer);
      PNG.bitblt(frame, atlas, 0, 0, W, H, column * W, row * H);
      await writeFile(join(qa, 'frames', `${state.id}-${column}.png`), buffer);
    }
    console.log(`${state.id}: ${state.times.length} frames from ${state.clip}`);
  }
  // V2's bundled assembler/validator reserve (row 0, column 6) for neutral.
  // Keep all 57 animation cells; populate this previously unused slot from idle.
  PNG.bitblt(atlas, atlas, 0, 0, W, H, 6 * W, 0);
  // Validate every used/unused cell and padding against the actual alpha channel.
  for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) {
    let pixels = 0, edgePixels = 0;
    let minX = W, minY = H, maxX = -1, maxY = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!atlas.data[((row * H + y) * atlas.width + col * W + x) * 4 + 3]) continue;
      pixels++; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      if (x < 3 || x >= W - 3 || y < 3 || y >= H - 3) edgePixels++;
    }
    const used = col < states[row].times.length || (row === 0 && col === 6);
    if (used ? !pixels || edgePixels : pixels) throw Error(`Invalid cell ${row}/${col}: pixels=${pixels}, edge=${edgePixels}`);
    checks.push({ state: states[row].id, column: col, used, pixels, edgePixels, bounds: used ? [minX, minY, maxX, maxY] : null });
  }
  const png = PNG.sync.write(atlas);
  await writeFile(join(qa, 'spritesheet.png'), png);
  execFileSync('cwebp', ['-quiet', '-lossless', '-exact', join(qa, 'spritesheet.png'), '-o', join(out, 'spritesheet.webp')]);
  // Lossless WebP must preserve every visible RGBA pixel when decoded by Chrome.
  const webp = await readFile(join(out, 'spritesheet.webp'));
  const decoded = await page.evaluate(async data => {
    const img = new Image(); img.src = data; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
    return { width: img.width, height: img.height, pixels: Array.from(ctx.getImageData(0, 0, img.width, img.height).data) };
  }, `data:image/webp;base64,${webp.toString('base64')}`);
  if (decoded.width !== atlas.width || decoded.height !== atlas.height) throw Error('WebP dimensions changed');
  // Canvas round-trips premultiplied alpha, so RGB at translucent edges can round.
  let alphaErrors = 0, opaqueErrors = 0;
  for (let i = 0; i < atlas.data.length; i += 4) {
    if (atlas.data[i + 3] !== decoded.pixels[i + 3]) alphaErrors++;
    if (atlas.data[i + 3] === 255 && [0, 1, 2].some(k => atlas.data[i + k] !== decoded.pixels[i + k])) opaqueErrors++;
  }
  if (alphaErrors || opaqueErrors) throw Error(`WebP changed pixels: alpha=${alphaErrors}, opaque=${opaqueErrors}`);
  const pet = { id: 'pubnyan', displayName: 'Pubnyan', description: "Hackers’ Pub의 차분한 고양이. 원화의 링과 별 모양 얼굴을 간직합니다.", spriteVersionNumber: 2, spritesheetPath: 'spritesheet.webp' };
  await writeFile(join(out, 'pet.json'), JSON.stringify(pet, null, 2) + '\n');
  await writeFile(join(out, 'ATTRIBUTION.txt'), `${ATTRIBUTION}\nLicense: https://creativecommons.org/licenses/by-sa/4.0/\nAdaptation: sampled vector motion, two directional glide clips, scaled and packed into a Codex pet atlas.\n`);
  const dataURL = `data:image/webp;base64,${webp.toString('base64')}`;
  const cards = states.slice(0,9).map((s, row) => `<article><h2>${s.label}</h2><div class="sprite" data-row="${row}" style="background-position:0 -${row * H}px"></div><small>${s.id} · ${s.times.length} frames</small></article>`).join('');
  const style = `*{box-sizing:border-box}body{margin:0;padding:28px;background:#f5f3ee;color:#252824;font:15px system-ui,sans-serif}h1{font-size:25px;margin:0 0 8px}p{line-height:1.6}button{font:inherit;padding:10px 18px;margin:10px 8px 20px 0;cursor:pointer}button:focus-visible{outline:3px solid #34663a}main{display:grid;grid-template-columns:repeat(3,minmax(210px,1fr));gap:16px;max-width:900px}article{background:#fff;border:1px solid #dadbd5;border-radius:14px;padding:14px;text-align:center}h2{font-size:15px;margin:0}small{color:#586155}.sprite{width:${W}px;height:${H}px;margin:auto;background-image:url('${dataURL}');background-repeat:no-repeat;background-size:${W * COLS}px ${H * ROWS}px}.dark{background:#232723;color:#f5f3ee}.dark article{background:#363d36;border-color:#536053}.dark small{color:#c2cec2}@media(max-width:720px){main{grid-template-columns:repeat(2,minmax(195px,1fr))}body{padding:12px}}@media(max-width:440px){main{grid-template-columns:1fr}}`;
  const directionNames = ['위','오른쪽 위','오른쪽 위','오른쪽 위','오른쪽','오른쪽 아래','오른쪽 아래','오른쪽 아래','아래','왼쪽 아래','왼쪽 아래','왼쪽 아래','왼쪽','왼쪽 위','왼쪽 위','왼쪽 위'];
  const lookPanel = `<section class="look-panel"><h2>16방향 시선</h2><p>고양이 주변으로 포인터를 움직이거나 방향을 선택하세요. 가운데에서는 정면을 봅니다.</p><div id="look-area"><div id="look-sprite" class="sprite"></div></div><label for="direction">방향 </label><select id="direction"><option value="neutral">정면</option>${directionNames.map((n,i)=>`<option value="${i}">${i*22.5}° · ${n}</option>`).join('')}</select> <button id="look-play">시선 순환 재생</button><output id="look-label" aria-live="polite">정면</output></section>`;
  const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pubnyan · Codex pet v2</title><style>${style}.look-panel{max-width:900px;border:1px solid #b9bfb4;border-radius:14px;padding:20px;margin-bottom:24px}#look-area{height:300px;display:grid;place-items:center;background:radial-gradient(ellipse,#87917e18,transparent 70%)}select{font:inherit;min-height:40px}output{display:inline-block;min-width:130px}#look-sprite{margin:0}</style><h1>Pubnyan · Codex pet v2</h1><p>원화를 보존한 9가지 동작과 16방향 시선.</p>${lookPanel}<button id="play">동작 재생</button><button id="theme">배경 바꾸기</button><main>${cards}</main><p>pubnyan artwork © Bak Eunji · CC BY-SA 4.0</p><script>
const states=${JSON.stringify(states)},sprites=[...document.querySelectorAll('main .sprite')];let playing=false,start=0,elapsed=0;
const lookIndex=${lookIndex.toString()},lookCell=${lookCell.toString()},names=${JSON.stringify(directionNames)};
const lookSprite=document.getElementById('look-sprite'),direction=document.getElementById('direction'),lookButton=document.getElementById('look-play');let looking=false,lookStart=0,currentLook=null;
function showLook(index){currentLook=index;const cell=lookCell(index);lookSprite.style.backgroundPosition=(-cell.column*${W})+'px '+(-cell.row*${H})+'px';direction.value=index===null?'neutral':String(index);document.getElementById('look-label').textContent=index===null?'정면':(index*22.5)+'° · '+names[index]}
function pauseLook(){looking=false;lookButton.textContent='시선 순환 재생'}
direction.onchange=()=>{pauseLook();showLook(direction.value==='neutral'?null:Number(direction.value))};
lookButton.onclick=()=>{if(looking){pauseLook();return}looking=true;lookStart=performance.now();lookButton.textContent='시선 순환 정지'};
document.getElementById('look-area').onpointermove=e=>{pauseLook();const r=lookSprite.getBoundingClientRect();showLook(lookIndex(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2))};
document.getElementById('look-area').onpointerleave=()=>{if(!looking)showLook(null)};
function draw(ms){sprites.forEach((el,row)=>{const ds=states[row].durations;let t=ms%ds.reduce((a,b)=>a+b,0),col=0;while(col<ds.length-1&&t>=ds[col])t-=ds[col++];el.style.backgroundPosition=(-col*${W})+'px '+(-row*${H})+'px'})}
function pause(){if(playing)elapsed=performance.now()-start;playing=false;document.getElementById('play').textContent='동작 재생';pauseLook()}
document.getElementById('play').onclick=()=>{if(playing){pause();return}playing=true;start=performance.now()-elapsed;document.getElementById('play').textContent='동작 일시 정지'};
document.getElementById('theme').onclick=()=>document.body.classList.toggle('dark');
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',pause);
function tick(now){if(playing)draw(now-start);if(looking){const index=Math.floor((now-lookStart)/400)%16;if(index!==currentLook)showLook(index)}requestAnimationFrame(tick)}requestAnimationFrame(tick);
</script></html>`;
  await writeFile(join(qa, 'preview.html'), html);
  await page.setViewport({ width: 960, height: 1080, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.screenshot({ path: join(qa, 'overview.png'), fullPage: true });
  const contact = states.map((s, row) => `<section><h2>${s.id} · ${s.clip}</h2><div class="row">${s.times.map((t, col) => `<figure><div class="sprite" style="background-position:-${col*W}px -${row*H}px"></div><figcaption>${col+1} · ${s.durations[col]} ms</figcaption></figure>`).join('')}</div></section>`).join('');
  await page.setViewport({ width: 1640, height: 1000, deviceScaleFactor: 1 });
  await page.setContent(`<style>${style}body{padding:20px}.row{display:flex}figure{margin:0 6px 0 0;text-align:center}section{margin-bottom:16px}h2{text-align:left}figcaption{font-size:12px}</style><h1>Pubnyan · atlas contact sheet</h1>${contact}`);
  await page.screenshot({ path: join(qa, 'contact-sheet.png'), fullPage: true });
  const lookFigures = [null,...Array.from({length:16},(_,i)=>i)].map(i=>{
    const {row,column}=lookCell(i);
    const label=i===null?'정면 · neutral':`${i*22.5}° · ${directionNames[i]}`;
    return `<figure><figcaption>${label}</figcaption><div class="sprite" style="background-position:-${column*W}px -${row*H}px"></div><div class="zoom"><div class="sprite" style="background-position:-${column*W}px -${row*H}px"></div></div></figure>`;
  }).join('');
  await page.setViewport({width:1000,height:900,deviceScaleFactor:1});
  await page.setContent(`<style>${style}.looks{display:grid;grid-template-columns:repeat(4,224px);gap:12px}figure{margin:0;background:white;text-align:center;padding:8px}figcaption{font-size:14px}.zoom{position:relative;overflow:hidden;width:200px;height:140px}.zoom .sprite{position:absolute;left:-84px;top:-136px;transform:scale(2);transform-origin:0 0}</style><h1>Pubnyan · 시선 방향과 눈 확대</h1><div class="looks">${lookFigures}</div>`);
  await page.screenshot({path:join(qa,'look-directions.png'),fullPage:true});
  let preservedStandardRows = null;
  if (base) {
    const restored = Buffer.from(atlas.data.subarray(0,W*COLS*H*9*4));
    for(let y=0;y<H;y++) {
      const start=(y*W*COLS+6*W)*4;
      base.data.copy(restored,start,start,start+W*4);
    }
    preservedStandardRows = restored.equals(base.data.subarray(0,W*COLS*H*9*4));
    if (!preservedStandardRows) throw Error('Existing standard rows changed');
  }
  await writeFile(join(qa, 'validation.json'), JSON.stringify({ spriteVersionNumber:2, width: atlas.width, height: atlas.height, usedCells: checks.filter(c => c.used).length, transparentUnusedCells: checks.filter(c => !c.used).length, alphaErrors, opaqueErrors, preservedStandardRowsExceptNeutralSlot:preservedStandardRows, neutralSlot:{row:0,column:6,source:'idle frame 0'}, errors: [], checks }, null, 2) + '\n');
  await writeFile(join(qa, 'states.json'), JSON.stringify({ states, preservedBase: basePath, preservedBaseSHA256: base ? createHash('sha256').update(base.data).digest('hex') : null, rigSHA256: createHash('sha256').update(JSON.stringify(rig)).digest('hex'), clipsSHA256: Object.fromEntries(states.filter((_,i)=>!base||i>=9).map(s => [s.clip, createHash('sha256').update(JSON.stringify(byName.get(s.clip))).digest('hex')])) }, null, 2) + '\n');
} finally { await browser.close(); }
// A flat background is used only for MP4 review; the package keeps transparency.
for (const state of states) {
  const lines = state.times.flatMap((_, i) => [`file '../frames/${state.id}-${i}.png'`, `duration ${state.durations[i] / 1000}`]);
  lines.push(`file '../frames/${state.id}-${state.times.length - 1}.png'`);
  const list = join(qa, 'videos', `${state.id}.txt`);
  await writeFile(list, lines.join('\n') + '\n');
  const duration = state.durations.reduce((a, b) => a + b, 0) / 1000;
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-f', 'lavfi', '-i', `color=c=0xf5f3ee:s=192x208:r=50:d=${duration}`, '-filter_complex', '[1:v][0:v]overlay=shortest=1:format=auto,format=yuv420p[v]', '-map', '[v]', '-t', String(duration), '-r', '50', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', join(qa, 'videos', `${state.id}.mp4`)]);
}
console.log(`Package: ${out}\nPreview: ${join(qa, 'preview.html')}\nValidation: v2, 74 used cells (57 animation + 16 look + neutral), 14 transparent unused cells; exact alpha and opaque RGB after WebP decode.`);
