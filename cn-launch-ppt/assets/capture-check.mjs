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
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await context.addInitScript(() => localStorage.setItem('roomix.lang', 'sc'))
  const page = await context.newPage()
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.welcome')
  await page.screenshot({ path: path.join(OUT, 'roomix-welcome.png') })
  console.log(`CAPTURE_OK ${await page.title()} ${page.viewportSize().width}x${page.viewportSize().height}`)
} finally {
  await browser.close()
  server.close()
}
