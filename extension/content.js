import * as nsfwjs from 'https://cdn.jsdelivr.net/npm/nsfwjs/dist/nsfwjs.esm.js'

const THRESHOLD = 0.75
let model
let enabled = true

chrome.storage.local.get(['detectionEnabled'], res => {
  if (res.detectionEnabled === false) enabled = false
  enabled && init()
})

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'toggle-filter') {
    enabled = msg.enabled
    enabled ? init() : unblurAll()
  }
})

async function init() {
  if (!model) model = await nsfwjs.load()
  scan(document.body)
  new MutationObserver(muts => {
    muts.forEach(m => m.addedNodes.forEach(scan))
  }).observe(document.body, { childList: true, subtree: true })
}

function scan(root) {
  if (!enabled || !root) return
  ;[...root.querySelectorAll('img, video')].forEach(async el => {
    if (el.dataset.__nsfw_scanned) return
    el.dataset.__nsfw_scanned = '1'
    try {
      const pred = await model.classify(el)
      const { className, probability } = pred.sort((a, b) => b.probability - a.probability)[0]
      if (probability >= THRESHOLD && className !== 'Neutral') {
        blur(el)
        report(el.src || el.currentSrc, className, probability)
      }
    } catch (e) { /* ignore cross-origin errors */ }
  })
}

function blur(el) {
  el.style.filter = 'blur(24px)'
  el.style.transition = 'filter .3s'
}

function unblurAll() {
  document.querySelectorAll('[data-__nsfw_scanned]').forEach(el => {
    el.style.filter = ''
  })
}

async function report(mediaUrl, detectedClass, confidence) {
  const pageUrl = location.href
  const { clutchToken } = await chrome.storage.local.get('clutchToken')
  const payload = { pageUrl, mediaUrl, detectedClass, confidence }
  try {
    await fetch(process.env.CLUTCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clutchToken}`
      },
      body: JSON.stringify(payload)
    })
    chrome.storage.local.set({ lastDetection: payload })
  } catch {
    /* network error */
  }
}