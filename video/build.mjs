/**
 * One command for the whole film:  node video/build.mjs
 * Renders 16:9 and 9:16, synthesises the soundtrack, and muxes the final MP4s into video/out/.
 * Expects a fresh `npm run build` (the film embeds dist/).
 */
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const run = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' })
const out = (f) => path.join(ROOT, 'video', 'out', f)

const LANGS = [
  { lang: 'en', ui: 'en', suffix: '' },
  { lang: 'zh', ui: 'sc', suffix: '-zh' },
]
for (const { lang, ui, suffix } of LANGS) {
  run('node', ['video/render.mjs', 'h', `--lang=${lang}`, `--ui=${ui}`])
  run('node', ['video/render.mjs', 'v', `--lang=${lang}`, `--ui=${ui}`])
  run('python', ['video/audio.py', lang])
  for (const [a, shape] of [
    ['h', '16x9'],
    ['v', '9x16'],
  ]) {
    const file = out(`roomix-intro${suffix}-${shape}.mp4`)
    run('ffmpeg', ['-y', '-loglevel', 'error', '-i', out(`video-${lang}-${a}.mp4`), '-i', out(`audio-${lang}.wav`), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', file])
    console.log('done', file)
  }
}
