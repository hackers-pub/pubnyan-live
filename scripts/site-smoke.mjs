#!/usr/bin/env node
// Serves dist/site (built by `npm run site:build`) and checks the landing page in headless
// Chrome: no console errors, the Rive stage goes live, the gallery lists every clip, each
// format tab renders, and /_storybook/ answers. `--shots <dir>` also writes screenshots.
import { createReadStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SITE_DIR = join(ROOT, 'dist', 'site');
const PORT = 6009;
const shotsFlag = process.argv.indexOf('--shots');
const SHOTS = shotsFlag >= 0 ? process.argv[shotsFlag + 1] : null;
const PET_ONLY = process.argv.includes('--pet-only');

const MIME_TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2',
  '.wasm': 'application/wasm', '.mp4': 'video/mp4', '.webp': 'image/webp', '.gif': 'image/gif',
  '.riv': 'application/octet-stream', '.lottie': 'application/zip', '.zip': 'application/zip',
};

function serve() {
  return http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let path = normalize(decodeURIComponent(url.pathname));
    // Exercise the same relative URLs at a GitHub Pages repository subpath.
    if (path.startsWith('/pubnyan-live/')) path = path.slice('/pubnyan-live'.length);
    if (path.endsWith('/')) path += 'index.html';
    const filePath = join(SITE_DIR, path);
    if (!filePath.startsWith(SITE_DIR) || !existsSync(filePath)) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME_TYPES[extname(filePath)] ?? 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const checks = [];
function check(name, ok, detail = '') {
  checks.push(ok);
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` - ${detail}` : ''}`);
}

async function run(server) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('requestfailed', (req) => {
      if (!req.url().startsWith('https://fonts.')) errors.push(`request failed: ${req.url()}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400 && res.url().startsWith(`http://localhost:${PORT}`)) errors.push(`${res.status()} ${res.url()}`);
    });
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0', timeout: 60_000 });

    check('landing title', (await page.title()) === 'pubnyan, live');
    await page.waitForSelector('#stage.is-live', { timeout: 20_000 }).catch(() => {});
    check('rive stage live', await page.$('#stage.is-live') !== null);
    const specimens = await page.$$eval('.specimen', (els) => els.length);
    check('gallery specimens', specimens >= 20, `${specimens} clips`);
    const heroSrc = await page.$eval('#hero-cat', (img) => img.getAttribute('src'));
    check('hero idle svg', heroSrc.endsWith('idle.svg'), heroSrc);

    check('pet installation steps', await page.$$eval('#pet .pet__steps > li', els => els.length) === 3);
    check('pet entry point in hero', await page.$('.hero a[href="#pet"]') !== null);
    check('official pet guide', await page.$('#pet a[href="https://learn.chatgpt.com/docs/pets"]') !== null);
    const archive = join(SITE_DIR, 'downloads', 'pubnyan-pet.zip');
    execFileSync('unzip', ['-t', archive]);
    const entries = execFileSync('unzip', ['-Z1', archive], {encoding:'utf8'}).trim().split('\n').sort();
    const petFiles = ['ATTRIBUTION.txt', 'pet.json', 'spritesheet.webp'];
    check('pet ZIP has exactly the three install files', JSON.stringify(entries) === JSON.stringify(petFiles.map(f => `pubnyan/${f}`).sort()));
    for (const file of petFiles) {
      const packed = execFileSync('unzip', ['-p', archive, `pubnyan/${file}`]);
      check(`pet ZIP preserves ${file}`, packed.equals(readFileSync(join(ROOT, 'dist', 'pets', 'pubnyan', file))));
    }
    const petManifest = JSON.parse(execFileSync('unzip', ['-p', archive, 'pubnyan/pet.json'], {encoding:'utf8'}));
    check('downloaded pet is v2', petManifest.spriteVersionNumber === 2 && petManifest.spritesheetPath === 'spritesheet.webp');
    await page.goto(`http://localhost:${PORT}/pubnyan-live/#pet`, {waitUntil:'networkidle0'});
    const downloadURL = await page.$eval('#pet a[download]', a => a.href);
    const download = await fetch(downloadURL);
    check('pet download works under Pages subpath', downloadURL === `http://localhost:${PORT}/pubnyan-live/downloads/pubnyan-pet.zip` && download.ok && Buffer.from(await download.arrayBuffer()).equals(readFileSync(archive)));
    await page.$eval('#pet', el => el.scrollIntoView({block:'start',behavior:'instant'}));
    if (SHOTS) {
      mkdirSync(SHOTS, {recursive:true});
      await page.screenshot({path:join(SHOTS,'pet-desktop.png')});
    }
    for (const width of [390, 320]) {
      await page.setViewport({width,height:844,deviceScaleFactor:1});
      await page.$eval('#pet', el => el.scrollIntoView({block:'start',behavior:'instant'}));
      check(`pet guide fits ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      check(`pet navigation visible at ${width}px`, await page.$eval('.top__nav a[href="#pet"]', a => a.getBoundingClientRect().width > 0));
      if(SHOTS && width === 390) await page.screenshot({path:join(SHOTS,'pet-mobile.png')});
    }
    await page.setViewport({width:1280,height:900,deviceScaleFactor:1});
    if (PET_ONLY) {
      check('no console errors', errors.length === 0, errors.slice(0,5).join(' | '));
      if(checks.some(ok => !ok)) process.exitCode = 1;
      return;
    }
    await page.goto(`http://localhost:${PORT}/`, {waitUntil:'networkidle0'});

    if (SHOTS) {
      mkdirSync(SHOTS, { recursive: true });
      await page.screenshot({ path: join(SHOTS, 'landing-top.png') });
    }

    for (const format of ['svg', 'lottie', 'rive', 'video']) {
      await page.click(`[data-format-tab="${format}"]`);
      await sleep(900);
      const rendered = await page.$eval('#format-stage', (el) => el.children.length > 0 && el.firstElementChild.clientWidth > 0);
      check(`format tab ${format}`, rendered);
    }

    const permitted = {
      normal: ['react', 'reactNod', 'reactTilt', 'reactEarTwitch', 'reactRingWobble', 'reactCelebrate', 'reactSlowBlink'],
      angry: ['reactEarTwitch'],
      curious: ['reactNod', 'reactTilt', 'reactEarTwitch', 'reactRingWobble'],
      cry: ['reactEarTwitch'],
      shy: ['react', 'reactNod', 'reactEarTwitch'],
    };
    for (const [expression, expected] of Object.entries(permitted)) {
      await page.click(`#stage-expressions [data-expression="${expression}"]`);
      const enabled = await page.$$eval('#stage-reactions button', buttons => buttons.filter(b => !b.disabled).map(b => b.dataset.reaction));
      check(`stage allowed reactions ${expression}`, JSON.stringify(enabled) === JSON.stringify(expected), enabled.join(', '));
    }
    await page.click('#stage-expressions [data-expression="cry"]');
    await page.$eval('#stage', el => el.scrollIntoView({block: 'center'}));
    await page.keyboard.press('1');
    await page.keyboard.press('6');
    await page.keyboard.press('7');
    await page.click('#stage-canvas');
    check('forbidden shortcuts and cat click give no reaction feedback', await page.$('#stage-reactions .is-firing') === null);
    await page.keyboard.press('4');
    check('allowed ear shortcut still fires', await page.$('#stage-reactions [data-reaction="reactEarTwitch"].is-firing') !== null);

    // A reduced-motion request must play one complete slow blink, then rest.
    // Compare rendered canvases so a button flash alone cannot pass this check.
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('#stage.is-live', { timeout: 20_000 });
    await page.$eval('#stage', el => el.scrollIntoView({ block: 'center' }));
    const canvasFrame = () => page.$eval('#stage-canvas', canvas => canvas.toDataURL());
    for (const action of ['button', 'keyboard']) {
      if (action === 'button') await page.click('#stage-reactions [data-reaction="reactSlowBlink"]');
      else await page.keyboard.press('7');
      await sleep(1200);
      const closed = await canvasFrame();
      if (SHOTS && action === 'button') await page.screenshot({ path: join(SHOTS, 'slow-blink-closed.png') });
      await sleep(2400);
      const resting = await canvasFrame();
      await sleep(300);
      check(`slow blink ${action} renders and rests with reduced motion`, closed !== resting && resting === await canvasFrame());
    }
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('#stage.is-live', { timeout: 20_000 });

    await page.click('#stage-expressions [data-expression="shy"]');
    await page.click('#stage-reactions [data-reaction="reactNod"]');
    await sleep(300);
    check('stage expression shy', await page.$eval('#stage', (el) => el.dataset.expression) === 'shy');

    if (SHOTS) {
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForSelector('#stage.is-live', { timeout: 20_000 }).catch(() => {});
      await page.screenshot({ path: join(SHOTS, 'landing-full.png'), fullPage: true });
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForSelector('#stage.is-live', { timeout: 20_000 }).catch(() => {});
      await page.screenshot({ path: join(SHOTS, 'landing-dark.png'), fullPage: true });
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
      await page.reload({ waitUntil: 'networkidle0' });
      await page.screenshot({ path: join(SHOTS, 'landing-mobile.png'), fullPage: true });
      await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    }

    check('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));

    const storybook = await page.goto(`http://localhost:${PORT}/_storybook/`, { waitUntil: 'networkidle0', timeout: 60_000 });
    check('storybook served under /_storybook/', storybook?.ok() === true);
    const sbIframe = await page.goto(`http://localhost:${PORT}/_storybook/iframe.html?id=targets-svg--gallery&viewMode=story`, { waitUntil: 'networkidle0', timeout: 60_000 });
    await sleep(800);
    const sbImages = await page.$$eval('img', (imgs) => imgs.filter((i) => i.complete && i.naturalWidth > 0).length);
    check('storybook story renders under subpath', sbIframe?.ok() === true && sbImages > 0, `${sbImages} images`);
    if (SHOTS) await page.screenshot({ path: join(SHOTS, 'storybook.png') });
    await page.goto(`http://localhost:${PORT}/_storybook/iframe.html?id=targets-rive--machine&viewMode=story`, { waitUntil: 'networkidle0', timeout: 60_000 });
    await page.waitForFunction(() => document.querySelector('figcaption')?.textContent.startsWith('inputs:'), {timeout:20_000});
    for (const [expression, expected] of Object.entries(permitted)) {
      await page.select('select', expression);
      const enabled = await page.$$eval('#storybook-root button', buttons => buttons.filter(b => !b.disabled).map(b => b.textContent));
      const withAlias = expected.includes('reactRingWobble') ? [...expected, 'reactTailFlick'] : expected;
      check(`storybook allowed reactions ${expression}`, JSON.stringify(enabled.sort()) === JSON.stringify([...withAlias].sort()));
    }

  } finally {
    if (browser) await browser.close();
    server.close();
  }
  process.exit(checks.every(Boolean) ? 0 : 1);
}

if (!existsSync(join(SITE_DIR, 'index.html'))) {
  console.error('dist/site/index.html is missing; run `npm run site:build` first');
  process.exit(1);
}
const server = serve();
server.listen(PORT, () => run(server));
