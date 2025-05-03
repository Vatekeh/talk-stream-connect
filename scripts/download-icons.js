import fetch from 'node-fetch'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

(async () => {
  const icons = [
    { size: 16, url: 'https://img.icons8.com/ios-glyphs/16/000000/eye--v2.png' },
    { size: 48, url: 'https://img.icons8.com/ios-glyphs/48/000000/eye--v2.png' },
    { size: 128, url: 'https://img.icons8.com/ios-glyphs/128/000000/eye--v2.png' }
  ]

  const outDir = resolve(__dirname, 'extension', 'icons')
  mkdirSync(outDir, { recursive: true })

  for (const { size, url } of icons) {
    console.log(`Downloading icon ${size}x${size} from ${url}`)
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
    }
    const buffer = await res.arrayBuffer()
    writeFileSync(resolve(outDir, `${size}.png`), Buffer.from(buffer))
  }
  console.log('All icons downloaded')
})().catch(err => {
  console.error(err)
  process.exit(1)
})