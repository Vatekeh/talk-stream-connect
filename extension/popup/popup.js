
// Main popup script
import { loadState, getState, decrementInviteTimer, updateState } from './modules/state.js';
import { fetchAuthStatus, fetchRoomStatus, fetchInviteStatus } from './modules/api.js';
import { renderPopup, updateInviteTimerDisplay } from './modules/renderer.js';
import { attachEventHandlers } from './modules/handlers.js';

// Countdown interval reference
let countdownInterval = null;

/**
 * Start countdown for active invite
 */
function startCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  countdownInterval = setInterval(() => {
    const hasActiveTimer = decrementInviteTimer();
    
    if (!hasActiveTimer) {
      clearInterval(countdownInterval);
    }
    
    updateInviteTimerDisplay(getState().inviteTimeRemaining);
  }, 1000);
}

/**
 * Initialize the popup
 */
async function initPopup() {
  // Load initial state from storage
  await loadState();
  
  // Render initial UI
  renderPopup(getState());
  
  // If there's an active invite, start countdown
  if (getState().hasActiveInvite) {
    startCountdown();
  }
  
  // Attach event handlers
  attachEventHandlers();
  
  // Request fresh data from background script
  try {
    // Get auth status
    const authStatus = await fetchAuthStatus();
    updateState(authStatus);
    
    // Get room status
    const roomStatus = await fetchRoomStatus();
    updateState(roomStatus);
    
    // Get invite status
    const inviteStatus = await fetchInviteStatus();
    updateState(inviteStatus);
    
    // Start countdown if there's an active invite
    if (inviteStatus.hasActiveInvite) {
      startCountdown();
    }
    
    // Re-render with updated data
    renderPopup(getState());
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', initPopup);
