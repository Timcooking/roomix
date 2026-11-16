import { chromium } from 'playwright-core'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = path.dirname(fileURLToPath(import.meta.url))
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json' }
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  let file = path.join(ROOT, 'dist', pathname === '/' ? 'index.html' : pathname)
  if (!file.startsWith(path.join(ROOT, 'dist'))) {
    res.writeHead(403).end()
    return
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(ROOT, 'dist', 'index.html')
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const pause = (page, ms = 900) => page.waitForTimeout(ms)
async function shot(page, name) {
  await pause(page)
  await page.screenshot({ path: path.join(OUT, name) })
  console.log(`captured ${name}`)
}
async function openTopCardDetail(page) {
  const box = await page.locator('.tab-page:not([hidden]) .card.is-top').boundingBox()
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.82)
  await page.waitForSelector('.sheet')
}
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await context.addInitScript(() => localStorage.setItem('roomix.lang', 'sc'))
  const page = await context.newPage()
  page.on('pageerror', (error) => console.error('pageerror', error.message))
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.welcome')
  await shot(page, '00-welcome.png')

  await page.locator('.btn-white').click()
  await page.waitForSelector('.quiz')
  await shot(page, '01-quiz.png')

  for (const optionIndex of [1, 1, 1, 1, 1, 1, 1, 0, 1]) {
    await page.locator('.quiz-opt').nth(optionIndex).click()
    await pause(page, 470)
  }
  await page.locator('.quiz-opt').nth(0).click()
  await page.locator('.quiz-opt').nth(1).click()
  await page.locator('.quiz-bottom .btn-grad').click()
  await page.waitForSelector('.reveal-done')
  await shot(page, '02-my-card.png', 1600)

  await page.locator('.reveal-done .btn-grad').click()
  await page.waitForSelector('.card.is-top')
  await shot(page, '03-discover.png')

  await openTopCardDetail(page)
  await shot(page, '04-person-detail.png')
  await page.locator('.sheet-close').click()
  await page.waitForSelector('.sheet', { state: 'detached' })

  await page.keyboard.press('ArrowLeft')
  await pause(page, 850)
  await shot(page, '05-discover-kaylee.png')
  await page.keyboard.press('ArrowRight')
  await page.waitForSelector('.overlay.match')
  await shot(page, '06-match.png', 1300)

  await page.locator('.match-actions .btn-grad').click()
  await page.waitForSelector('.rooms-topbar')
  await shot(page, '07-shared-rooms.png')

  await openTopCardDetail(page)
  await shot(page, '08-room-detail.png')
  await page.locator('.sheet-close').click()
  await page.waitForSelector('.sheet', { state: 'detached' })

  await page.keyboard.press('ArrowRight')
  await pause(page, 850)
  await page.keyboard.press('ArrowRight')
  await page.waitForSelector('.overlay.room-match')
  await shot(page, '09-room-match.png', 1300)

  await page.locator('.room-match .btn-grad').click()
  await page.locator('.tabbar .tab').nth(2).click()
  await page.waitForSelector('.chats')
  await shot(page, '10-chats.png')

  await page.locator('.msg-item').first().click()
  await page.waitForSelector('.chat')
  await shot(page, '11-chat.png')

  await page.locator('.chat-head .icon-btn').click()
  await page.locator('.tabbar .tab').nth(3).click()
  await page.waitForSelector('.me')
  await shot(page, '12-me.png')
  console.log('ALL_CAPTURES_OK')
} finally {
  await browser.close()
  server.close()
}
