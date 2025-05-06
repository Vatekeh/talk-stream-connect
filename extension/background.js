
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    detectionEnabled: true,
    lastPeerCheck: 0,
    peerCount: 0,
    supportRoomUrl: null
  })
  chrome.runtime.openOptionsPage()
})

// Cache support room data (update every 2 minutes)
const PEER_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

// Update room status periodically
function updateRoomStatus() {
  chrome.storage.local.get(['clutchToken', 'lastPeerCheck'], async (res) => {
    const now = Date.now()
    const token = res.clutchToken
    const lastCheck = res.lastPeerCheck || 0
    
    // Only check if we have a token and it's been at least 2 minutes since last check
    if (token && (now - lastCheck) > PEER_CHECK_INTERVAL) {
      try {
        // Get user ID from token (JWT)
        const tokenParts = token.split('.')
        if (tokenParts.length !== 3) throw new Error('Invalid token format')
        
        const payload = JSON.parse(atob(tokenParts[1]))
        const userId = payload.sub
        
        // Call our edge function to get room status
        const response = await fetch('https://ggbvhsuuwqwjghxpuapg.supabase.co/functions/v1/get-room-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId })
        })
        
        const data = await response.json()
        
        if (data.error) {
          console.error('Error fetching room status:', data.error)
          return
        }
        
        // Update storage with latest room status
        chrome.storage.local.set({
          lastPeerCheck: now,
          peerCount: data.activePeers,
          supportRoomUrl: data.roomUrl,
          supportRoomId: data.roomId,
          supportRoomName: data.roomName,
          supportRoomReady: data.isReady
        })
      } catch (error) {
        console.error('Error updating room status:', error)
      }
    }
  })
}

// Run room status update when installed and then periodically
updateRoomStatus()
setInterval(updateRoomStatus, PEER_CHECK_INTERVAL)

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === 'toggle-filter') {
    chrome.storage.local.set({ detectionEnabled: msg.enabled })
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, msg))
    })
  }
  
  // New handler to get current room status
  if (msg.type === 'get-room-status') {
    chrome.storage.local.get(['peerCount', 'supportRoomUrl', 'supportRoomName', 'supportRoomReady'], (data) => {
      sendResponse({
        peerCount: data.peerCount || 0,
        roomUrl: data.supportRoomUrl,
        roomName: data.supportRoomName || "Support Room",
        isReady: !!data.supportRoomReady
      })
    })
    return true // Needed for async response
  }
  
  // Trigger a check for room status right away
  if (msg.type === 'check-room-status-now') {
    chrome.storage.local.set({ lastPeerCheck: 0 }, () => {
      updateRoomStatus()
      setTimeout(() => {
        chrome.storage.local.get(['peerCount', 'supportRoomUrl', 'supportRoomReady'], (data) => {
          sendResponse({
            peerCount: data.peerCount || 0,
            roomUrl: data.supportRoomUrl,
            isReady: !!data.supportRoomReady
          })
        })
      }, 1000) // Give time for the update to complete
    })
    return true // Needed for async response
  }
})
