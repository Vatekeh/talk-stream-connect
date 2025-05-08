
const state = {
  enabled: true,
  last: null,
  peerCount: 0,
  roomUrl: null,
  roomName: "Support Room",
  isReady: false,
  needsSupport: false,
  hasActiveInvite: false,
  inviteTimeRemaining: 0,
  currentInviteId: null,
  isAuthenticated: false,
  userId: null
}

// Load auth state from storage
chrome.storage.local.get(
  ['lastDetection', 'detectionEnabled', 'peerCount', 'supportRoomUrl', 
   'supportRoomName', 'supportRoomReady', 'currentInviteId', 'inviteExpiresAt',
   'clutshToken', 'currentUserId'], 
  res => {
    state.last = res.lastDetection
    state.enabled = res.detectionEnabled !== false
    state.peerCount = res.peerCount || 0
    state.roomUrl = res.supportRoomUrl
    state.roomName = res.supportRoomName || "Support Room"
    state.isReady = res.supportRoomReady === true
    state.isAuthenticated = !!res.clutshToken
    state.userId = res.currentUserId || null
    
    // Check for active invite
    if (res.currentInviteId && res.inviteExpiresAt) {
      const now = new Date()
      const expiresAt = new Date(res.inviteExpiresAt)
      const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
      
      state.hasActiveInvite = timeRemaining > 0
      state.currentInviteId = res.currentInviteId
      state.inviteTimeRemaining = timeRemaining
    }
    
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
    
    // If there's an active invite, start countdown
    if (state.hasActiveInvite) {
      startCountdown()
    }
  }
)

// Request fresh auth status from background script
chrome.runtime.sendMessage({ type: 'GET_AUTH' }, response => {
  if (response) {
    state.isAuthenticated = response.isAuthenticated
    state.userId = response.userId
    render()
  }
})

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

// Request fresh invite status
chrome.runtime.sendMessage({ type: 'get-invite-status' }, response => {
  if (response) {
    state.hasActiveInvite = response.hasActiveInvite
    state.currentInviteId = response.inviteId
    state.inviteTimeRemaining = response.timeRemaining
    
    if (state.hasActiveInvite) {
      startCountdown()
    }
    
    render()
  }
})

// Start countdown for active invite
let countdownInterval = null

function startCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  countdownInterval = setInterval(() => {
    state.inviteTimeRemaining -= 1
    
    if (state.inviteTimeRemaining <= 0) {
      clearInterval(countdownInterval)
      state.hasActiveInvite = false
      state.inviteTimeRemaining = 0
    }
    
    render()
  }, 1000)
}

/**
 * Handle sign in button click
 */
function handleSignIn() {
  if (state.isAuthenticated) {
    // If already authenticated, sign out
    chrome.storage.local.remove(['clutshToken', 'currentUserId'], () => {
      state.isAuthenticated = false;
      state.userId = null;
      render();
    });
  } else {
    // Open sign in page
    chrome.tabs.create({ url: 'https://clutsh.live/auth' });
  }
}

/**
 * Handle support room button click
 */
function handleSupportRoomClick() {
  if (state.hasActiveInvite && state.currentInviteId) {
    // Join the invite
    chrome.runtime.sendMessage({ 
      type: 'join-invite', 
      inviteId: state.currentInviteId 
    }, response => {
      if (response && response.success) {
        chrome.runtime.sendMessage({
          type: 'OPEN_SUPPORT_ROOM',
          roomUrl: response.roomUrl
        });
      } else {
        // Show error
        const errorMessage = response?.error || 'Failed to join support room';
        alert(errorMessage);
      }
    });
  } else if (state.isAuthenticated) {
    chrome.runtime.sendMessage({
      type: 'OPEN_SUPPORT_ROOM',
      roomUrl: state.roomUrl
    });
  } else {
    alert('Please sign in to join a support room');
  }
}

/**
 * Create abbreviated user ID display
 */
function abbreviateUserId(userId) {
  if (!userId) return '';
  if (userId.length <= 8) return userId;
  
  const start = userId.substring(0, 4);
  const end = userId.substring(userId.length - 4);
  return `${start}...${end}`;
}

function render() {
  const app = document.getElementById('app')
  
  // Build auth section HTML
  const authSectionHtml = `
    <div class="auth-section">
      ${state.isAuthenticated 
        ? `<div class="user-info">
            <div class="user-icon">${state.userId ? state.userId[0].toUpperCase() : 'U'}</div>
            <span class="user-id">${abbreviateUserId(state.userId)}</span>
          </div>`
        : '<span>Not signed in</span>'
      }
      <button id="auth-button">
        ${state.isAuthenticated ? 'Sign Out' : 'Sign In'}
      </button>
    </div>
  `;
  
  // Build support button HTML based on status
  const supportButtonHtml = `
    <div class="support-section">
      <div class="support-status ${state.needsSupport || state.hasActiveInvite ? 'highlight' : ''}">
        ${state.needsSupport || state.hasActiveInvite 
          ? `<p><strong>Need support?</strong> ${state.isReady 
              ? `${state.peerCount} peer${state.peerCount !== 1 ? 's' : ''} available to help.` 
              : 'Connect with peers for help.'}
            </p>`
          : `<p>${state.isReady 
              ? `${state.peerCount} peer${state.peerCount !== 1 ? 's' : ''} available in support rooms.` 
              : 'No peers currently available.'}
            </p>`
        }
        ${state.hasActiveInvite ? 
          `<p class="invite-timer" style="color: ${state.inviteTimeRemaining > 10 ? '#059669' : '#ef4444'};">
            Join within <span id="time-remaining">${state.inviteTimeRemaining}</span> seconds to maintain your streak!
          </p>` 
          : ''}
      </div>
      <button 
        id="clutsh-in" 
        class="clutsh-button ${state.isReady ? 'ready' : ''}"
        ${(!state.isAuthenticated && !state.hasActiveInvite) ? 'disabled' : ''}
      >
        Clutsh In ${state.isReady || state.hasActiveInvite ? '➤' : ''}
      </button>
    </div>
  `;
  
  app.innerHTML = `
    ${authSectionHtml}
    
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
    <div class="footer">
      <a href="https://clutsh.live" target="_blank">Open Clutsh Dashboard</a>
      <a href="https://clutsh.live/privacy" target="_blank">Privacy Policy</a>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('toggle').onclick = () => {
    state.enabled = !state.enabled;
    chrome.runtime.sendMessage({ type: 'toggle-filter', enabled: state.enabled });
    render();
  };
  
  // Add event listener for auth button
  document.getElementById('auth-button').onclick = handleSignIn;
  
  // Add event listener for "Clutsh In" button if it exists
  const clutshButton = document.getElementById('clutsh-in');
  if (clutshButton) {
    clutshButton.onclick = handleSupportRoomClick;
  }
}
