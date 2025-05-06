
import * as nsfwjs from 'https://cdn.jsdelivr.net/npm/nsfwjs/dist/nsfwjs.esm.js'

const THRESHOLD = 0.75
let model
let enabled = true
let detectionStats = {
  count: 0,
  lastDetection: null,
  highConfidenceCount: 0
}

chrome.storage.local.get(['detectionEnabled', 'detectionStats'], res => {
  if (res.detectionEnabled === false) enabled = false
  if (res.detectionStats) detectionStats = res.detectionStats
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
        
        // Update detection stats for "edging" detection
        updateDetectionStats(className, probability)
        
        report(el.src || el.currentSrc, className, probability)
      }
    } catch (e) { /* ignore cross-origin errors */ }
  })
}

function updateDetectionStats(className, probability) {
  // Increment total detections
  detectionStats.count++
  
  // Update last detection timestamp
  detectionStats.lastDetection = new Date().toISOString()
  
  // Count high confidence detections (>85%)
  if (probability > 0.85) {
    detectionStats.highConfidenceCount++
    
    // Check for "edging" pattern (frequent high confidence detections)
    const needsSupport = detectionStats.highConfidenceCount >= 3
    
    if (needsSupport) {
      // Check if we should show support notification
      chrome.storage.local.get(['lastSupportPrompt', 'supportRoomReady'], res => {
        const now = Date.now()
        const lastPrompt = res.lastSupportPrompt || 0
        
        // Only show support prompt max once per hour and if support room has peers
        if (res.supportRoomReady && (now - lastPrompt) > 3600000) {
          showSupportPrompt()
          chrome.storage.local.set({ lastSupportPrompt: now })
        }
      })
    }
  }
  
  // Store updated stats
  chrome.storage.local.set({ detectionStats })
}

function showSupportPrompt() {
  // Create prompt container
  const promptContainer = document.createElement('div')
  promptContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    z-index: 10000;
    max-width: 320px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `
  
  // Get room info
  chrome.runtime.sendMessage({ type: 'get-room-status' }, response => {
    promptContainer.innerHTML = `
      <h3 style="margin-top: 0; color: #1D4ED8; font-size: 16px;">Need Support?</h3>
      <p style="margin-bottom: 12px; font-size: 14px;">
        ${response.peerCount > 0 
          ? `${response.peerCount} peer${response.peerCount !== 1 ? 's are' : ' is'} available to talk.` 
          : 'Connect with peers for support.'}
      </p>
      <div style="display: flex; justify-content: space-between;">
        <button class="clutch-dismiss" style="
          background: transparent;
          border: none;
          color: #6B7280;
          cursor: pointer;
          font-size: 14px;
        ">Dismiss</button>
        <button class="clutch-support" style="
          background: #1D4ED8;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        ">Clutch In →</button>
      </div>
    `
    
    // Add to page
    document.body.appendChild(promptContainer)
    
    // Add event listeners
    promptContainer.querySelector('.clutch-dismiss').addEventListener('click', () => {
      promptContainer.remove()
    })
    
    promptContainer.querySelector('.clutch-support').addEventListener('click', () => {
      if (response.roomUrl) {
        window.open(response.roomUrl, '_blank')
      } else {
        window.open('https://ggbvhsuuwqwjghxpuapg.supabase.co', '_blank')
      }
      promptContainer.remove()
    })
    
    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (document.body.contains(promptContainer)) {
        promptContainer.remove()
      }
    }, 30000)
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
  const payload = { pageUrl, mediaUrl, detectedClass, confidence, timestamp: new Date().toISOString() }
  
  try {
    // Use the Supabase edge function endpoint instead of process.env.CLUTCH_API_URL
    await fetch('https://ggbvhsuuwqwjghxpuapg.supabase.co/functions/v1/nsfw-detections', {
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
