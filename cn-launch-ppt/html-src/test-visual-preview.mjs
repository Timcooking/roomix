import { chromium } from 'playwright-core'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const FILE = path.join(ROOT, 'cn-launch-ppt', 'Roomix-视觉方向预览.html')
const OUT = path.join(ROOT, 'cn-launch-ppt', 'html-preview')
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const errors = []
const externalRequests = []
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1 })
  await context.setOffline(true)
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (/^https?:/.test(request.url())) externalRequests.push(request.url()) })
  await page.goto(pathToFileURL(FILE).href)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1100)
  await page.screenshot({ path: path.join(OUT, 'direction-a.png') })
  if (!await page.locator('#concept-a').isVisible()) throw new Error('Direction A is not visible')
  await page.getByRole('button', { name: 'B · 产品剧场' }).click()
  await page.waitForTimeout(1100)
  if (!await page.locator('#concept-b').isVisible()) throw new Error('Direction B did not open')
  await page.screenshot({ path: path.join(OUT, 'direction-b.png') })
  await page.keyboard.press('1')
  if (!await page.locator('#concept-a').isVisible()) throw new Error('Keyboard switch failed')
  const imagesReady = await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0))
  if (!imagesReady) throw new Error('An embedded image did not load')
  await context.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  await mobile.setOffline(true)
  const phone = await mobile.newPage()
  phone.on('pageerror', error => errors.push(error.message))
  await phone.goto(pathToFileURL(FILE).href + '#b')
  await phone.getByRole('button', { name: 'A · 暖白杂志' }).tap()
  if (!await phone.locator('#concept-a').isVisible()) throw new Error('Mobile tap switch failed')
  const width = await phone.evaluate(() => document.documentElement.scrollWidth)
  if (width !== 390) throw new Error(`Mobile overflow: ${width}`)
  await mobile.close()
  if (errors.length) throw new Error(errors.join('\n'))
  if (externalRequests.length) throw new Error(`External requests: ${externalRequests.join(', ')}`)
  console.log('PREVIEW_OK offline, A/B click, keyboard, mobile tap, images, no external requests')
} finally {
  await browser.close()
}
