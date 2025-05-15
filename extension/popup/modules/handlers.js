
// Event Handlers module
import { getState, toggleFilter } from './state.js';
import { handleAuth, joinSupportRoom } from './api.js';
import { renderPopup } from './renderer.js';

/**
 * Attach event handlers to UI elements
 */
export function attachEventHandlers() {
  // Handle toggle button click
  const toggleButton = document.getElementById('toggle');
  if (toggleButton) {
    toggleButton.onclick = handleToggleClick;
  }
  
  // Handle auth button click
  const authButton = document.getElementById('auth-button');
  if (authButton) {
    authButton.onclick = handleAuthClick;
  }
  
  // Handle "Clutsh In" button click
  const clutshButton = document.getElementById('clutsh-in');
  if (clutshButton) {
    clutshButton.onclick = handleSupportRoomClick;
  }
}

/**
 * Handle toggle button click
 */
function handleToggleClick() {
  const newState = toggleFilter();
  renderPopup(getState());
}

/**
 * Handle authentication button click
 */
async function handleAuthClick() {
  const state = getState();
  try {
    const result = await handleAuth(state.isAuthenticated);
    Object.assign(state, result);
    renderPopup(state);
  } catch (error) {
    console.error('Authentication error:', error);
  }
}

/**
 * Handle support room button click
 */
async function handleSupportRoomClick() {
  const state = getState();
  
  try {
    if (!state.isAuthenticated && !state.hasActiveInvite) {
      alert('Please sign in to join a support room');
      return;
    }
    
    await joinSupportRoom(state.hasActiveInvite, state.currentInviteId);
  } catch (error) {
    console.error('Support room error:', error);
    alert(error.message);
  }
}
