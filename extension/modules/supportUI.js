
/**
 * Show support prompt UI
 * @returns {Promise<void>}
 */
async function showSupportPrompt() {
  // Create prompt container
  const promptContainer = document.createElement('div');
  promptContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    z-index: 10000;
    max-width: 320px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;
  
  // Get room info and current invite status
  const roomResponse = await getRoomStatus();
  const inviteResponse = await getInviteStatus();
  
  let timeRemaining = inviteResponse?.timeRemaining || 60;
  const hasActiveInvite = inviteResponse?.hasActiveInvite || false;
  const inviteId = inviteResponse?.inviteId;
  
  // Create content for the prompt
  promptContainer.innerHTML = `
    <h3 style="margin-top: 0; color: #1D4ED8; font-size: 16px;">Need Support?</h3>
    <p style="margin-bottom: 12px; font-size: 14px;">
      ${roomResponse.peerCount > 0 
        ? `${roomResponse.peerCount} peer${roomResponse.peerCount !== 1 ? 's are' : ' is'} available to talk.` 
        : 'Connect with peers for support.'}
    </p>
    <div id="timer-display" style="margin-bottom: 12px; font-size: 14px;">
      Join within <span id="time-remaining">${timeRemaining}</span> seconds to maintain your streak!
    </div>
    <div style="display: flex; justify-content: space-between;">
      <button class="clutch-dismiss" style="
        background: transparent;
        border: none;
        color: #6B7280;
        cursor: pointer;
        font-size: 14px;
      ">Dismiss</button>
      <button class="clutch-support" style="
        background: #1D4ED8;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      ">Clutch In →</button>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(promptContainer);
  
  // Start countdown timer
  const timerElement = promptContainer.querySelector('#time-remaining');
  const countdownInterval = setInterval(() => {
    timeRemaining -= 1;
    if (timerElement) timerElement.textContent = timeRemaining;
    
    if (timeRemaining <= 0) {
      clearInterval(countdownInterval);
      
      // Update the message if timer expires
      const timerDisplay = promptContainer.querySelector('#timer-display');
      if (timerDisplay) {
        timerDisplay.innerHTML = '<span style="color: #ef4444;">Time expired! Your streak has been reset.</span>';
      }
      
      // Disable the clutch in button
      const supportButton = promptContainer.querySelector('.clutch-support');
      if (supportButton) {
        supportButton.disabled = true;
        supportButton.style.backgroundColor = '#9CA3AF';
        supportButton.style.cursor = 'not-allowed';
      }
    }
  }, 1000);
  
  // Add event listeners
  promptContainer.querySelector('.clutch-dismiss').addEventListener('click', () => {
    clearInterval(countdownInterval);
    promptContainer.remove();
  });
  
  promptContainer.querySelector('.clutch-support').addEventListener('click', () => {
    clearInterval(countdownInterval);
    
    if (hasActiveInvite && inviteId) {
      // Join the invite
      chrome.runtime.sendMessage({ 
        type: 'join-invite', 
        inviteId: inviteId 
      }, response => {
        if (response && response.success) {
          window.open(response.roomUrl, '_blank');
          
          // Show streak celebration if applicable
          if (response.streakCount > 1) {
            showStreakCelebration(response.streakCount);
          }
        } else {
          // Show error
          const errorMessage = response?.error || 'Failed to join support room';
          alert(errorMessage);
        }
        promptContainer.remove();
      });
    } else if (roomResponse.roomUrl) {
      window.open(roomResponse.roomUrl, '_blank');
      promptContainer.remove();
    } else {
      window.open('https://clutch.live', '_blank');
      promptContainer.remove();
    }
  });
  
  // Auto-dismiss after 65 seconds (slightly longer than the timer)
  setTimeout(() => {
    if (document.body.contains(promptContainer)) {
      clearInterval(countdownInterval);
      promptContainer.remove();
    }
  }, 65000);
}

/**
 * Show streak celebration UI
 * @param {number} streakCount - User's current streak count
 */
function showStreakCelebration(streakCount) {
  // Create celebration container
  const celebrationContainer = document.createElement('div');
  celebrationContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    padding: 24px;
    z-index: 10001;
    max-width: 400px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;
  
  celebrationContainer.innerHTML = `
    <h2 style="margin-top: 0; color: #1D4ED8; font-size: 20px;">Streak Continued!</h2>
    <div style="font-size: 48px; margin: 12px 0;">🎉</div>
    <p style="margin-bottom: 24px; font-size: 16px;">
      You've maintained a <strong>${streakCount}-day streak</strong> of successful interventions!
    </p>
    <button class="celebration-close" style="
      background: #1D4ED8;
      color: white;
      border: none;
      padding: 8px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 16px;
    ">Continue</button>
  `;
  
  document.body.appendChild(celebrationContainer);
  
  celebrationContainer.querySelector('.celebration-close').addEventListener('click', () => {
    celebrationContainer.remove();
  });
  
  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    if (document.body.contains(celebrationContainer)) {
      celebrationContainer.remove();
    }
  }, 8000);
}

/**
 * Get room status from background script
 * @returns {Promise<object>} - Room status
 */
function getRoomStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'get-room-status' }, response => {
      resolve(response || { peerCount: 0, roomUrl: null, isReady: false });
    });
  });
}

/**
 * Get invite status from background script
 * @returns {Promise<object>} - Invite status
 */
function getInviteStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'get-invite-status' }, response => {
      resolve(response || { hasActiveInvite: false, timeRemaining: 60 });
    });
  });
}

export {
  showSupportPrompt,
  showStreakCelebration
};
