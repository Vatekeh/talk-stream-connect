
const state = {
  enabled: true,
  last: null,
  peerCount: 0,
  roomUrl: null,
  roomName: "Support Room",
  isReady: false,
  needsSupport: false
}

// Load state from storage
chrome.storage.local.get(
  ['lastDetection', 'detectionEnabled', 'peerCount', 'supportRoomUrl', 'supportRoomName', 'supportRoomReady'], 
  res => {
    state.last = res.lastDetection
    state.enabled = res.detectionEnabled !== false
    state.peerCount = res.peerCount || 0
    state.roomUrl = res.supportRoomUrl
    state.roomName = res.supportRoomName || "Support Room"
    state.isReady = res.supportRoomReady === true
    
    // Check if recent detections indicate user might need support
    if (state.last) {
      const detectionTime = new Date(state.last.timestamp || Date.now())
      const now = new Date()
      const minutesSinceDetection = (now - detectionTime) / (1000 * 60)
      
      // If detection was in the last 5 minutes and confidence was high
      if (minutesSinceDetection < 5 && state.last.confidence > 0.85) {
        state.needsSupport = true
      }
    }
    
    render()
  }
)

// Request fresh room status from background script
chrome.runtime.sendMessage({ type: 'get-room-status' }, response => {
  if (response) {
    state.peerCount = response.peerCount
    state.roomUrl = response.roomUrl
    state.roomName = response.roomName
    state.isReady = response.isReady
    render()
  }
})

function render() {
  const app = document.getElementById('app')
  
  // Build support button HTML based on status
  const supportButtonHtml = state.roomUrl 
    ? `
      <div class="support-section">
        <div class="support-status ${state.needsSupport ? 'highlight' : ''}">
          ${state.needsSupport 
            ? `<p><strong>Need support?</strong> ${state.isReady 
                ? `${state.peerCount} peer${state.peerCount !== 1 ? 's' : ''} available to help.` 
                : 'Connect with peers for help.'}
              </p>`
            : `<p>${state.isReady 
                ? `${state.peerCount} peer${state.peerCount !== 1 ? 's' : ''} available in support rooms.` 
                : 'No peers currently available.'}
              </p>`
          }
        </div>
        <button 
          id="clutch-in" 
          class="clutch-button ${state.isReady ? 'ready' : ''}"
          ${!state.isReady ? 'disabled' : ''}
        >
          Clutch In ${state.isReady ? '➤' : ''}
        </button>
      </div>
    ` 
    : '';
  
  app.innerHTML = `
    <h1>${state.enabled ? '✅ Enabled' : '⛔️ Disabled'}</h1>
    ${state.last
      ? `<div class="detection-info">
          <p><b>${state.last.detectedClass}</b> (${(state.last.confidence * 100).toFixed()}%)</p>
          <a target="_blank" href="${state.last.mediaUrl}">${state.last.mediaUrl}</a>
        </div>`
      : '<p>No detections yet.</p>'}
    <button id="toggle">${state.enabled ? 'Disable' : 'Enable'} Filter</button>
    
    ${supportButtonHtml}
    
    <hr/>
    <a href="https://ggbvhsuuwqwjghxpuapg.supabase.co" target="_blank">Open Clutch Dashboard</a>
  `
  
  // Add event listeners
  document.getElementById('toggle').onclick = () => {
    state.enabled = !state.enabled
    chrome.runtime.sendMessage({ type: 'toggle-filter', enabled: state.enabled })
    render()
  }
  
  // Add event listener for "Clutch In" button if it exists
  const clutchButton = document.getElementById('clutch-in')
  if (clutchButton && state.roomUrl) {
    clutchButton.onclick = () => {
      chrome.tabs.create({ url: state.roomUrl })
    }
  }
}
