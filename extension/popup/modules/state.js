
// State management for popup
const initialState = {
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
  userId: null,
  isSubscribed: false
};

let state = { ...initialState };

// Load state from storage
export function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['lastDetection', 'detectionEnabled', 'peerCount', 'supportRoomUrl', 
      'supportRoomName', 'supportRoomReady', 'currentInviteId', 'inviteExpiresAt',
      'clutshToken', 'currentUserId', 'isSubscribed'], 
      res => {
        state.last = res.lastDetection;
        state.enabled = res.detectionEnabled !== false;
        state.peerCount = res.peerCount || 0;
        state.roomUrl = res.supportRoomUrl;
        state.roomName = res.supportRoomName || "Support Room";
        state.isReady = res.supportRoomReady === true;
        state.isAuthenticated = !!res.clutshToken;
        state.userId = res.currentUserId || null;
        state.isSubscribed = res.isSubscribed === true;
        
        // Check for active invite
        if (res.currentInviteId && res.inviteExpiresAt) {
          const now = new Date();
          const expiresAt = new Date(res.inviteExpiresAt);
          const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
          
          state.hasActiveInvite = timeRemaining > 0;
          state.currentInviteId = res.currentInviteId;
          state.inviteTimeRemaining = timeRemaining;
        }
        
        // Check if recent detections indicate user might need support
        if (state.last) {
          const detectionTime = new Date(state.last.timestamp || Date.now());
          const now = new Date();
          const minutesSinceDetection = (now - detectionTime) / (1000 * 60);
          
          // If detection was in the last 5 minutes and confidence was high
          if (minutesSinceDetection < 5 && state.last.confidence > 0.85) {
            state.needsSupport = true;
          }
        }
        
        resolve(state);
      }
    );
  });
}

// Get current state
export function getState() {
  return state;
}

// Update invite timer
export function decrementInviteTimer() {
  state.inviteTimeRemaining -= 1;
  
  if (state.inviteTimeRemaining <= 0) {
    state.hasActiveInvite = false;
    state.inviteTimeRemaining = 0;
    return false;
  }
  
  return true;
}

// Toggle filter state
export function toggleFilter() {
  state.enabled = !state.enabled;
  chrome.runtime.sendMessage({ type: 'toggle-filter', enabled: state.enabled });
  return state.enabled;
}

// Update state from background data
export function updateState(updates) {
  Object.assign(state, updates);
}
