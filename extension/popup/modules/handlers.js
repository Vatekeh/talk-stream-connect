
// Event Handlers module
import { getState, toggleFilter } from './state.js';
import { handleAuth, joinSupportRoom, createSubscription, openBillingPortal } from './api.js';
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
  
  // Handle subscription button click
  const subscriptionButton = document.getElementById('subscription-button');
  if (subscriptionButton) {
    subscriptionButton.onclick = handleSubscriptionClick;
  }
  
  // Handle manage subscription button click
  const manageButton = document.getElementById('manage-subscription');
  if (manageButton) {
    manageButton.onclick = handleManageSubscriptionClick;
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

/**
 * Handle subscription button click
 */
async function handleSubscriptionClick() {
  const state = getState();
  
  if (!state.isAuthenticated) {
    alert('Please sign in to subscribe');
    return;
  }
  
  try {
    // Show loading state
    const button = document.getElementById('subscription-button');
    if (button) {
      button.textContent = 'Creating...';
      button.disabled = true;
      button.classList.add('loading');
    }
    
    const result = await createSubscription(); // Use default price
    
    if (result.success) {
      // Success message will be shown by the background script opening checkout
      console.log('Subscription creation initiated successfully');
    } else {
      throw new Error(result.error || 'Failed to create subscription');
    }
  } catch (error) {
    console.error('Subscription error:', error);
    alert(error.message || 'Failed to create subscription');
  } finally {
    // Reset button state
    const button = document.getElementById('subscription-button');
    if (button) {
      button.disabled = false;
      button.classList.remove('loading');
      renderPopup(getState()); // Re-render to restore proper button text
    }
  }
}

/**
 * Handle manage subscription button click
 */
async function handleManageSubscriptionClick() {
  const state = getState();
  
  if (!state.isAuthenticated) {
    alert('Please sign in to manage your subscription');
    return;
  }
  
  try {
    // Show loading state
    const button = document.getElementById('manage-subscription');
    if (button) {
      button.textContent = 'Opening...';
      button.disabled = true;
      button.classList.add('loading');
    }
    
    const result = await openBillingPortal();
    
    if (!result.success && result.error) {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Billing portal error:', error);
    alert(error.message || 'Failed to open billing portal');
  } finally {
    // Reset button state
    const button = document.getElementById('manage-subscription');
    if (button) {
      button.disabled = false;
      button.classList.remove('loading');
      renderPopup(getState()); // Re-render to restore proper button text
    }
  }
}
