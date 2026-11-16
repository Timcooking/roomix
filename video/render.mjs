/**
 * Renders the Roomix intro film frame by frame (deterministic, no screen recording).
 *
 *   node video/render.mjs h            → video/out/roomix-intro-16x9.mp4 (silent; audio is muxed by build.mjs)
 *   node video/render.mjs v            → 9:16 version
 *   node video/render.mjs h --stills 10,24.5,37.8   → PNG stills for review, no video
 *
 * The app runs inside an iframe with a fake clock: timers, rAF, performance.now and CSS
 * animations only move when we call __advance(), so every frame is exact.
 */
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const aspect = process.argv[2] === 'v' ? 'v' : 'h'
const lang = (process.argv.find((a) => a.startsWith('--lang=')) || '--lang=en').slice(7)
const ui = (process.argv.find((a) => a.startsWith('--ui=')) || (lang === 'zh' ? '--ui=sc' : '--ui=en')).slice(5)
const name = lang === 'zh' ? 'zh' : 'en'
console.log(`film: ${aspect} ${lang} (app in ${ui})`)
const stillsArg = process.argv.indexOf('--stills')
const STILLS = stillsArg > 0 ? process.argv[stillsArg + 1].split(',').map(Number) : null
const FPS = 30
const DUR = 80
const [W, H] = aspect === 'v' ? [1080, 1920] : [1920, 1080]
const OUT_DIR = path.join(ROOT, 'video', 'out')
fs.mkdirSync(OUT_DIR, { recursive: true })

/* ───────── app timeline (seconds) ───────── */
const quizPicks = [1, 1, 1, 1, 1, 1, 1, 0, 1]
const ACTIONS = [
  { t: 15.9, type: 'tap', sel: '.btn-white' },
  ...quizPicks.map((i, k) => ({ t: 16.6 + k * 0.72, type: 'tap', sel: `quiz:${i}` })),
  { t: 23.05, type: 'tap', sel: 'quiz:0' },
  { t: 23.35, type: 'tap', sel: 'quiz:1' },
  { t: 23.8, type: 'tap', sel: '.quiz-bottom .btn-grad' },
  { t: 27.7, type: 'tap', sel: '.reveal-card-wrap .card', fx: 0.78, fy: 0.35 },
  { t: 28.7, type: 'tap', sel: '.reveal-card-wrap .card', fx: 0.78, fy: 0.35 },
  { t: 30.3, type: 'tap', sel: '.reveal-done .btn-grad' },
  // Wing: peek at photo 2, back, then NOPE
  { t: 31.7, type: 'tap', sel: 'top-card', fx: 0.78, fy: 0.3 },
  { t: 32.5, type: 'tap', sel: 'top-card', fx: 0.22, fy: 0.3 },
  { t: 33.7, type: 'drag', sel: 'top-card', fx: 0.5, fy: 0.42, dx: -240, dy: 34, dur: 0.95 },
  // Kaylee: photo 2, then LIKE → match
  { t: 35.3, type: 'tap', sel: 'top-card', fx: 0.78, fy: 0.3 },
  { t: 36.0, type: 'drag', sel: 'top-card', fx: 0.5, fy: 0.42, dx: 240, dy: -22, dur: 0.95, sfx: 'match' },
  { t: 41.6, type: 'tap', sel: '.match-actions .btn-grad' },
  // shared room deck: SSP (partner passes) then SYP (room match)
  { t: 43.2, type: 'tap', sel: 'top-card', fx: 0.78, fy: 0.3 },
  { t: 44.2, type: 'drag', sel: 'top-card', fx: 0.5, fy: 0.45, dx: 240, dy: -18, dur: 0.85 },
  { t: 47.3, type: 'drag', sel: 'top-card', fx: 0.5, fy: 0.45, dx: 240, dy: -26, dur: 0.85, sfx: 'match' },
]
// sounds that don't come from taps/swipes
const SFX = [
  { t: 13.95, type: 'pop' },
  { t: 15.0, type: 'whoosh' },
  { t: 52.1, type: 'whoosh' },
  { t: 57.3, type: 'tick' },
  { t: 57.9, type: 'tick' },
  { t: 58.5, type: 'tick' },
  { t: 69.45, type: 'pop' },
  { t: 71.9, type: 'tick' },
  { t: 72.2, type: 'tick' },
  { t: 72.5, type: 'tick' },
  { t: 72.8, type: 'tick' },
  { t: 74.5, type: 'whoosh' },
  { t: 75.0, type: 'chime' },
]

const TAP_LEAD = 0.32
const TAP_HOLD = 0.09

/* ───────── fake clock, injected into every frame before any app code ───────── */
function fakeClock(uiLang) {
  if (window.__advance) return
  try {
    localStorage.setItem('roomix.lang', uiLang)
  } catch {}
  const realST = window.setTimeout.bind(window)
  let now = 0
  let seq = 0
  const timers = new Map()
  const rafs = new Map()
  const epoch = Date.now()
  const RealDate = Date
  function FakeDate(...a) {
    return a.length ? new RealDate(...a) : new RealDate(epoch + now)
  }
  FakeDate.prototype = RealDate.prototype
  FakeDate.now = () => epoch + Math.floor(now)
  FakeDate.parse = RealDate.parse
  FakeDate.UTC = RealDate.UTC
  window.Date = FakeDate
  performance.now = () => now
  window.setTimeout = (fn, ms, ...a) => {
    const id = ++seq
    timers.set(id, { at: now + Math.max(0, +ms || 0), fn, a })
    return id
  }
  window.setInterval = (fn, ms, ...a) => {
    const id = ++seq
    const iv = Math.max(1, +ms || 0)
    timers.set(id, { at: now + iv, fn, a, iv })
    return id
  }
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id)
  window.requestAnimationFrame = (cb) => {
    const id = ++seq
    rafs.set(id, cb)
    return id
  }
  window.cancelAnimationFrame = (id) => rafs.delete(id)
  // Motion falls back to rAF-driven animations, which follow our clock
  delete Element.prototype.animate

  const started = new WeakMap()
  const syncCss = () => {
    for (const a of document.getAnimations()) {
      let s = started.get(a)
      if (s === undefined) {
        s = now
        started.set(a, s)
        a.pause()
      }
      const el = now - s
      const end = a.effect && a.effect.getComputedTiming().endTime
      if (Number.isFinite(end) && el >= end) a.finish()
      else a.currentTime = el
    }
  }
  const runRaf = () => {
    const cbs = [...rafs.values()]
    rafs.clear()
    for (const cb of cbs) {
      try {
        cb(now)
      } catch (e) {
        console.error(e)
      }
    }
  }
  const tick = () => new Promise((r) => realST(r, 0))
  window.__advance = async (dt) => {
    const target = now + dt
    for (;;) {
      let next = null
      for (const entry of timers) if (entry[1].at <= target && (!next || entry[1].at < next[1].at)) next = entry
      if (!next) break
      const [id, tm] = next
      now = Math.max(now, tm.at)
      if (tm.iv) tm.at += tm.iv
      else timers.delete(id)
      try {
        if (typeof tm.fn === 'function') tm.fn(...tm.a)
      } catch (e) {
        console.error(e)
      }
    }
    now = target
    runRaf()
    // let React commit what the timers/input changed, then render that commit in this frame
    await tick()
    await tick()
    runRaf()
    syncCss()
    return { dark: !!document.querySelector('.welcome, .overlay') }
  }

  if (window !== window.top) {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style')
      // behave like an iPhone with a Dynamic Island + home indicator
      s.textContent = ':root{--st:47px !important;--sb:22px !important} ::-webkit-scrollbar{display:none}'
      document.head.appendChild(s)
    })
  }
}

/* ───────── static server: app from dist/, film from video/film/ ───────── */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json' }
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  let file = url.startsWith('/film/') ? path.join(ROOT, 'video', url) : path.join(ROOT, 'dist', url)
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(ROOT, 'dist', 'index.html')
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, r))
const BASE = `http://localhost:${server.address().port}`

/* ───────── browser ───────── */
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
await ctx.addInitScript(fakeClock, ui)
const page = await ctx.newPage()
page.on('pageerror', (e) => console.error('pageerror', e.message))
page.on('console', (m) => m.type() === 'error' && console.error('console', m.text()))
await page.goto(`${BASE}/film/film.html?aspect=${aspect}&lang=${lang}&ui=${ui}`)
const app = page.frames().find((f) => f !== page.mainFrame())
await app.waitForSelector('.welcome', { state: 'attached' })

// decode every photo up front so no frame shows a half-loaded image
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/photo-manifest.json'), 'utf8'))
const urls = Object.entries(manifest).flatMap(([k, v]) => [`/photos/${k}.webp?v=${v}`, `/photos/${k}-sm.webp?v=${v}`])
const decodeAll = (list) =>
  Promise.all(
    list.map((u) => {
      const i = new Image()
      ;(window.__keep ||= []).push(i)
      i.src = u
      return i.decode().catch(() => {})
    }),
  )
await app.evaluate(decodeAll, urls)
await page.evaluate(decodeAll, ['/photos/living1.webp', '/photos/living3-sm.webp'])
await app.evaluate(() => document.fonts.load('40px "Kaushan Script"'))
await page.evaluate(() => document.fonts.ready)

/* ───────── input helpers ───────── */
async function targetPoint(a) {
  const r = await app.evaluate((sel) => {
    let el
    if (sel.startsWith('quiz:')) {
      const q = [...document.querySelectorAll('.quiz-q')].find((x) => getComputedStyle(x).pointerEvents !== 'none')
      el = q && q.querySelectorAll('.quiz-opt')[+sel.slice(5)]
    } else if (sel === 'top-card') {
      el = document.querySelector('.tab-page:not([hidden]) .card.is-top')
    } else {
      el = [...document.querySelectorAll(sel)].find((x) => !x.closest('[hidden]'))
    }
    if (!el) return null
    const b = el.getBoundingClientRect()
    return { x: b.x, y: b.y, w: b.width, h: b.height }
  }, a.sel)
  if (!r) return null
  const m = await page.evaluate(() => window.__phoneMap())
  const ix = r.x + r.w * (a.fx ?? 0.5)
  const iy = r.y + r.h * (a.fy ?? 0.5)
  return { x: m.left + ix * m.scale, y: m.top + iy * m.scale, scale: m.scale }
}

const dragCurve = (u) => (u < 0.6 ? 0.42 * (1 - Math.pow(1 - u / 0.6, 2)) : 0.42 + 0.58 * Math.pow((u - 0.6) / 0.4, 2))
const sfxLog = [...SFX]
for (const a of ACTIONS) {
  a.end = a.type === 'tap' ? a.t + TAP_HOLD : a.t + a.dur
  a.visFrom = a.t - (a.type === 'tap' ? TAP_LEAD : 0.3)
  a.visTo = a.end + 0.25
  a.state = 'idle'
}

/** perform input for frame time t and return the touch indicator state */
async function input(t) {
  let ptr = null
  for (const a of ACTIONS) {
    if (t < a.visFrom || t > a.visTo) continue
    if (!a.p0) a.p0 = await targetPoint(a)
    if (!a.p0) {
      // element may still be animating in: keep looking until the action is due
      if (t < a.t) continue
      await page.screenshot({ path: path.join(OUT_DIR, 'debug-missing.png') })
      console.error(await app.evaluate(() => document.body.innerHTML.slice(0, 1500)))
      throw new Error(`target not found at ${t.toFixed(2)}s: ${a.sel}`)
    }
    if (a.state === 'idle' && t >= a.t) {
      if (a.type === 'tap') a.p0 = (await targetPoint(a)) ?? a.p0
      await page.mouse.move(a.p0.x, a.p0.y)
      await page.mouse.down()
      a.state = 'down'
      sfxLog.push({ t: a.t, type: a.type === 'tap' ? 'tap' : 'grab' })
    }
    let pos = a.p0
    if (a.type === 'drag' && a.state !== 'idle') {
      const u = Math.min(1, (t - a.t) / a.dur)
      const k = dragCurve(u)
      pos = { x: a.p0.x + a.dx * a.p0.scale * k, y: a.p0.y + a.dy * a.p0.scale * k - Math.sin(u * Math.PI) * 12 }
      if (a.state === 'down') await page.mouse.move(pos.x, pos.y)
    }
    if (a.state === 'down' && t >= a.end) {
      await page.mouse.up()
      a.state = 'up'
      if (a.type === 'drag') sfxLog.push({ t: a.end, type: 'swipe' })
      if (a.sfx === 'match') sfxLog.push({ t: a.end + 0.5, type: 'match' })
    }
    const vis = Math.min(1, (t - a.visFrom) / 0.15, (a.visTo - t) / 0.15)
    const press = a.state === 'down' ? 1 : 0
    ptr = { x: pos.x, y: pos.y, vis: Math.max(0, vis), press }
  }
  return ptr
}

/* ───────── render loop ───────── */
const cdp = await ctx.newCDPSession(page)
const frames = Math.round(DUR * FPS)
const outFile = path.join(OUT_DIR, `video-${name}-${aspect}.mp4`)
let ff = null
if (!STILLS) {
  ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] })
}
const stillFrames = new Set((STILLS ?? []).map((s) => Math.round(s * FPS)))
const lastNeeded = STILLS ? Math.max(...stillFrames) : frames - 1
const started = Date.now()

for (let f = 0; f <= lastNeeded; f++) {
  const t = f / FPS
  const ptr = await input(t)
  const { dark } = await app.evaluate((dt) => window.__advance(dt), 1000 / FPS)
  await page.evaluate(([tt, p, d]) => window.__film(tt, p, d), [t, ptr, dark])
  if (ff) {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95, optimizeForSpeed: true })
    if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r))
  } else if (stillFrames.has(f)) {
    await page.screenshot({ path: path.join(OUT_DIR, `still-${name}-${aspect}-${t.toFixed(2)}.png`) })
  }
  if (f % 150 === 0) console.log(`${aspect} ${t.toFixed(1)}s  (${((Date.now() - started) / 1000).toFixed(0)}s elapsed)`)
}

if (ff) {
  ff.stdin.end()
  await new Promise((r) => ff.on('close', r))
  fs.writeFileSync(path.join(OUT_DIR, `sfx-${name}.json`), JSON.stringify(sfxLog.sort((a, b) => a.t - b.t), null, 1))
  console.log('wrote', outFile)
}
await browser.close()
server.close()
