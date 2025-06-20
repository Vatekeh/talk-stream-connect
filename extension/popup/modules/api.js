// API module for communicating with background script

// Get current auth status
export function fetchAuthStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH' }, response => {
      if (response) {
        resolve({
          isAuthenticated: response.isAuthenticated,
          userId: response.userId
        });
      } else {
        resolve({ isAuthenticated: false, userId: null });
      }
    });
  });
}

// Create subscription
export function createSubscription(priceId = null) {
  return new Promise((resolve) => {
    console.log('[POPUP-API] Creating subscription with price_id:', priceId);
    
    chrome.runtime.sendMessage({ 
      type: 'CREATE_SUBSCRIPTION',
      price_id: priceId  // Use snake_case to match the API
    }, response => {
      console.log('[POPUP-API] Subscription response:', response);
      resolve(response || { error: 'No response from background script' });
    });
  });
}

// Open billing portal for subscription management
export function openBillingPortal() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'OPEN_BILLING_PORTAL' }, response => {
      resolve(response || { error: 'No response from background script' });
    });
  });
}

// Get room status
export function fetchRoomStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'get-room-status' }, response => {
      if (response) {
        resolve({
          peerCount: response.peerCount,
          roomUrl: response.roomUrl,
          roomName: response.roomName,
          isReady: response.isReady
        });
      } else {
        resolve({ peerCount: 0, roomUrl: null, roomName: "Support Room", isReady: false });
      }
    });
  });
}

// Get invite status
export function fetchInviteStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'get-invite-status' }, response => {
      if (response) {
        resolve({
          hasActiveInvite: response.hasActiveInvite,
          currentInviteId: response.inviteId,
          inviteTimeRemaining: response.timeRemaining
        });
      } else {
        resolve({ hasActiveInvite: false, currentInviteId: null, inviteTimeRemaining: 0 });
      }
    });
  });
}

// Handle authentication (sign in/out)
export function handleAuth(isAuthenticated) {
  if (isAuthenticated) {
    // Sign out if authenticated
    return new Promise((resolve) => {
      chrome.storage.local.remove(['clutshToken', 'currentUserId'], () => {
        resolve({ isAuthenticated: false, userId: null });
      });
    });
  } else {
    // Sign in if not authenticated
    chrome.tabs.create({ url: 'https://clutsh.live/auth' });
    return Promise.resolve({ isAuthenticating: true });
  }
}

// Join support room
export function joinSupportRoom(hasActiveInvite, currentInviteId) {
  return new Promise((resolve, reject) => {
    if (hasActiveInvite && currentInviteId) {
      // Join the invite
      chrome.runtime.sendMessage({ 
        type: 'join-invite', 
        inviteId: currentInviteId 
      }, response => {
        if (response && response.success) {
          chrome.runtime.sendMessage({
            type: 'OPEN_SUPPORT_ROOM',
            roomUrl: response.roomUrl
          });
          resolve({ success: true });
        } else {
          // Error handling
          const errorMessage = response?.error || 'Failed to join support room';
          reject(new Error(errorMessage));
        }
      });
    } else {
      // Open regular support room
      chrome.runtime.sendMessage({
        type: 'OPEN_SUPPORT_ROOM'
      });
      resolve({ success: true });
    }
  });
}
