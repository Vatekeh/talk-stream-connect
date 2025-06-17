
// UI Renderer module

/**
 * Abbreviate user ID for display
 */
function abbreviateUserId(userId) {
  if (!userId) return '';
  if (userId.length <= 8) return userId;
  
  const start = userId.substring(0, 4);
  const end = userId.substring(userId.length - 4);
  return `${start}...${end}`;
}

/**
 * Render the entire popup UI based on current state
 */
export function renderPopup(state) {
  const app = document.getElementById('app');
  
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
  
  // Build subscription section HTML
  const subscriptionSectionHtml = state.isAuthenticated ? `
    <div class="subscription-section">
      <div class="subscription-status ${state.isSubscribed ? 'pro' : 'free'}">
        ${state.isSubscribed 
          ? `<p><strong>✨ Clutsh Pro</strong></p>
             <p>Premium features unlocked</p>`
          : `<p><strong>Free Plan</strong></p>
             <p>Upgrade to unlock premium features</p>`
        }
      </div>
      ${state.isSubscribed 
        ? `<button id="manage-subscription" class="subscription-button secondary">
            Manage Subscription
          </button>`
        : `<button id="subscription-button" class="subscription-button success">
            Upgrade to Pro
          </button>`
      }
    </div>
  ` : '';
  
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
    
    ${subscriptionSectionHtml}
    
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
}

/**
 * Update just the invite timer display without re-rendering entire UI
 */
export function updateInviteTimerDisplay(timeRemaining) {
  const timerElement = document.getElementById('time-remaining');
  if (timerElement) {
    timerElement.textContent = timeRemaining.toString();
    
    // Update color based on remaining time
    const timerContainer = timerElement.parentElement;
    if (timerContainer) {
      timerContainer.style.color = timeRemaining > 10 ? '#059669' : '#ef4444';
    }
  }
}
