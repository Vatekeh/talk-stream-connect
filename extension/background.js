
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    detectionEnabled: true,
    lastPeerCheck: 0,
    peerCount: 0,
    supportRoomUrl: null,
    supportNotificationShown: false,
    lastEdgingDetection: 0
  })
  chrome.runtime.openOptionsPage()
})

// Cache support room data (update every 2 minutes)
const PEER_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds
const EDGING_DETECTION_COOLDOWN = 10 * 60 * 1000; // 10 minutes in milliseconds

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

// Handle edging detection
async function handleEdgingDetection(userId) {
  try {
    chrome.storage.local.get(['clutchToken', 'lastEdgingDetection'], async (res) => {
      const now = Date.now()
      const lastDetection = res.lastEdgingDetection || 0
      
      // Check if we're within cooldown period
      if ((now - lastDetection) < EDGING_DETECTION_COOLDOWN) {
        console.log('Edging detection within cooldown period, ignoring')
        return
      }
      
      const token = res.clutchToken
      if (!token) {
        console.error('No auth token available for edging detection')
        return
      }
      
      // Call our edge function to handle edging detection
      const response = await fetch('https://ggbvhsuuwqwjghxpuapg.supabase.co/functions/v1/on-edging-detected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      })
      
      const data = await response.json()
      
      if (data.error) {
        console.error('Error handling edging detection:', data.error)
        return
      }
      
      // Update last detection timestamp
      chrome.storage.local.set({
        lastEdgingDetection: now,
        currentInviteId: data.invite.id,
        inviteExpiresAt: data.invite.expires_at
      })
      
      // We don't automatically show the notification here
      // It will be shown by content.js for a better user experience
      
      console.log('Edging detection handled successfully:', data)
      return data
    })
  } catch (error) {
    console.error('Error in handleEdgingDetection:', error)
  }
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
  
  // Handle edging detection from content script
  if (msg.type === 'edging-detected') {
    chrome.storage.local.get(['clutchToken'], async (res) => {
      const token = res.clutchToken
      if (!token) {
        sendResponse({ success: false, error: 'No auth token available' })
        return
      }
      
      // Get user ID from token (JWT)
      try {
        const tokenParts = token.split('.')
        if (tokenParts.length !== 3) throw new Error('Invalid token format')
        
        const payload = JSON.parse(atob(tokenParts[1]))
        const userId = payload.sub
        
        // Handle the edging detection
        const result = await handleEdgingDetection(userId)
        sendResponse({ success: true, invite: result?.invite })
      } catch (error) {
        console.error('Error processing edging detection:', error)
        sendResponse({ success: false, error: error.message })
      }
    })
    return true // Needed for async response
  }
  
  // Handle join invite from content script
  if (msg.type === 'join-invite') {
    const { inviteId } = msg
    chrome.storage.local.get(['clutchToken'], async (res) => {
      const token = res.clutchToken
      if (!token) {
        sendResponse({ success: false, error: 'No auth token available' })
        return
      }
      
      try {
        // Call join invite edge function
        const response = await fetch('https://ggbvhsuuwqwjghxpuapg.supabase.co/functions/v1/join-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ inviteId })
        })
        
        const data = await response.json()
        
        if (data.error) {
          console.error('Error joining invite:', data.error)
          sendResponse({ success: false, error: data.error })
          return
        }
        
        sendResponse({ success: true, roomUrl: data.roomUrl, streakCount: data.streakCount })
      } catch (error) {
        console.error('Error joining invite:', error)
        sendResponse({ success: false, error: error.message })
      }
    })
    return true // Needed for async response
  }
  
  // Get current invite status
  if (msg.type === 'get-invite-status') {
    chrome.storage.local.get(['currentInviteId', 'inviteExpiresAt'], (data) => {
      const now = new Date()
      const expiresAt = data.inviteExpiresAt ? new Date(data.inviteExpiresAt) : null
      const timeRemaining = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : 0
      
      sendResponse({
        inviteId: data.currentInviteId,
        expiresAt: data.inviteExpiresAt,
        timeRemaining: timeRemaining,
        hasActiveInvite: !!data.currentInviteId && timeRemaining > 0
      })
    })
    return true // Needed for async response
  }
})
