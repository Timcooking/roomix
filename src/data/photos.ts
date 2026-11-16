/**
 * Every photo in the app. After changing anything here, run:  python scripts/photos.py
 * That builds optimized WebP files into public/photos/ (served from our own domain).
 *
 *   'unsplash:<id>'  stock photo from Unsplash
 *   'src:<file>'     your own photo, put the original (any size) in photos-src/
 */
import manifest from './photo-manifest.json'

const RAW = {
  // ── You (three photos on your own card; me is also your avatar) ──
  me: 'src:me-1.jpg',
  me2: 'src:me-2.jpg',
  me3: 'src:me-3.jpg',

  // ── Roommate portraits ──
  kaylee: 'unsplash:1529232356377-57971f020a94',
  marcus: 'unsplash:1542909168-82c3e7fdca5c',
  wing: 'unsplash:1569913486515-b74bf7751574',
  ethan: 'unsplash:1628157588553-5eeea00af15c',
  chloe: 'unsplash:1534528741775-53994a69daeb',
  tom: 'unsplash:1568602471122-7832951cc4c5',
  mika: 'unsplash:1548142813-c348350df52b',
  daniel: 'unsplash:1566492031773-4f4e44671857',

  // ── Lifestyle shots (2nd/3rd photo on a roommate card) ──
  cat: 'unsplash:1514888286974-6c03e2ca1dba',
  dog: 'unsplash:1543466835-00a7907e9de1',
  coffee: 'unsplash:1495474472287-4d71bcdd2085',
  dumplings: 'unsplash:1496116218417-1a781b1c416c',
  xiaolongbao: 'unsplash:1563245372-f21724e3856d',
  dumplingFeast: 'unsplash:1534422298391-e4f8c172dddb',
  cooking: 'unsplash:1556910103-1c02745aae4d',
  laptop: 'unsplash:1498050108023-c5249f4df085',
  codeNight: 'unsplash:1510915228340-29c85a43dcfe',
  guitarRoom: 'unsplash:1511379938547-c1f69419868d',
  gym: 'unsplash:1534438327276-14e5300c3a48',
  workout: 'unsplash:1571019613454-1cb2f99b2d8b',
  bike: 'unsplash:1485965120184-e220f721d03e',
  books: 'unsplash:1463320726281-696a485928c7',
  deskLamp: 'unsplash:1593062096033-9a26b09da705',
  gaming: 'unsplash:1542751371-adc38448a05e',
  tidyCorner: 'unsplash:1586023492125-27b2c045efd7',
  shelfRoom: 'unsplash:1536376072261-38c75010e6c9',

  // ── Rooms ──
  living1: 'unsplash:1522708323590-d24dbb6b0267',
  living2: 'unsplash:1502672260266-1c1ef2d93688',
  living3: 'unsplash:1493809842364-78817add7ffb',
  living4: 'unsplash:1616486338812-3dadae4b4ace',
  living5: 'unsplash:1513694203232-719a280e022f',
  living6: 'unsplash:1554995207-c18c203602cb',
  living7: 'unsplash:1567767292278-a4f21aa2d36e',
  living8: 'unsplash:1600210492486-724fe5c67fb0',
  studio: 'unsplash:1501183638710-841dd1904471',
  bed1: 'unsplash:1522771739844-6a9f6d5f14af',
  bed2: 'unsplash:1540518614846-7eded433c457',
  bed3: 'unsplash:1595526114035-0d45ed16cfbf',
  bed4: 'unsplash:1631049307264-da0ec9d70304',
  bed5: 'unsplash:1560185893-a55cbc8c57e8',
  kitchen1: 'unsplash:1556911220-bff31c812dba',
  kitchen2: 'unsplash:1484154218962-a197022b5858',
  bath1: 'unsplash:1584622650111-993a426fbf0a',
  bath2: 'unsplash:1552321554-5fefe8c9ef14',

  // ── Hong Kong views ──
  hkPeakSunset: 'unsplash:1536599018102-9f803c140fc1',
  hkHarbourDay: 'unsplash:1506970845246-18f21d533b20',
  hkIsland: 'unsplash:1576788369575-4ab045b9287e',
  hkHarbourNight: 'unsplash:1594973782943-3314fe063f68',
  hkNightPeak: 'unsplash:1517144447511-aebb25bbc5fa',
  hkDense: 'unsplash:1518599807935-37015b9cefcb',
} as const

export type PhotoKey = keyof typeof RAW

const VERSIONS = manifest as Record<string, string>

/** w = rendered width in CSS px; picks the 480 or 1080 wide file */
export function photo(key: PhotoKey, w = 800): string {
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 2
  const small = w * dpr <= 480
  return `/photos/${key}${small ? '-sm' : ''}.webp?v=${VERSIONS[key] ?? '0'}`
}

export function preload(srcs: string[]) {
  for (const s of srcs) {
    const img = new Image()
    img.decoding = 'async'
    img.src = s
  }
}

/** Warm the browser cache before a screen needs the images (full-size card photos). */
export function warmup(keys: PhotoKey[]) {
  preload(keys.map((k) => photo(k, 700)))
}
