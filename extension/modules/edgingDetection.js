
import { EdgingTracker, attachVideoListeners, attachBlurListeners } from './edgingTracker.js';

/**
 * Show edging detection banner with countdown
 * @param {Object} invite - Invite data
 */
function showBanner(invite) {
  if (!invite || !invite.id) return;
  
  // Create banner container
  const bannerContainer = document.createElement('div');
  bannerContainer.style.cssText = `
    position: fixed;
    bottom: -150px;
    left: 0;
    width: 100%;
    background: rgba(20, 20, 40, 0.9);
    color: white;
    padding: 20px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    transition: bottom 0.5s ease-in-out;
    font-family: Arial, sans-serif;
    text-align: center;
  `;
  
  // Create banner content
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="margin: 0 0 10px; font-size: 18px;">Need support?</h3>
    <p style="margin: 0 0 15px;">Join a support room to maintain your streak.</p>
    <div style="font-weight: bold; margin-bottom: 10px;">
      Time remaining: <span id="clutsh-countdown">60</span> seconds
    </div>
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button id="clutsh-join" style="
        background: #1D4ED8;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Clutsh In</button>
      <button id="clutsh-ignore" style="
        background: #6B7280;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      ">Ignore</button>
    </div>
  `;
  bannerContainer.appendChild(content);
  document.body.appendChild(bannerContainer);
  
  // Slide up the banner after a short delay
  setTimeout(() => {
    bannerContainer.style.bottom = '0';
  }, 100);
  
  // Set up countdown
  let countdown = 60;
  const countdownElement = document.getElementById('clutsh-countdown');
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdownElement) {
      countdownElement.textContent = countdown.toString();
    }
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      bannerContainer.style.bottom = '-150px';
      setTimeout(() => bannerContainer.remove(), 500);
    }
  }, 1000);
  
  // Set up button listeners
  document.getElementById('clutsh-join').addEventListener('click', () => {
    chrome.runtime.sendMessage({ 
      type: 'join-invite', 
      inviteId: invite.id 
    }, response => {
      if (response && response.success) {
        chrome.runtime.sendMessage({
          type: 'OPEN_SUPPORT_ROOM',
          roomUrl: response.roomUrl
        });
      }
      clearInterval(countdownInterval);
      bannerContainer.style.bottom = '-150px';
      setTimeout(() => bannerContainer.remove(), 500);
    });
  });
  
  document.getElementById('clutsh-ignore').addEventListener('click', () => {
    clearInterval(countdownInterval);
    bannerContainer.style.bottom = '-150px';
    setTimeout(() => bannerContainer.remove(), 500);
  });
}

/**
 * Get authentication data from background script
 * @returns {Promise<Object>} - Auth data including token, userId and isAuthenticated
 */
function getAuthData() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH' }, response => {
      resolve(response || { token: null, userId: null, isAuthenticated: false });
    });
  });
}

/**
 * Start edging detection loop
 * @param {boolean} enabled - Whether detection is enabled
 * @param {boolean} isUnloading - Whether page is unloading
 * @param {EdgingTracker} tracker - Edging tracker instance
 */
function startEdgingDetection(enabled, isUnloading, tracker) {
  setInterval(async () => {
    if (!enabled || isUnloading) return;
    
    // Increment dwell time
    tracker.incrementDwellTime(15);
    
    // Check for last nudge time to prevent excessive prompting
    const { lastNudgeTs } = await chrome.storage.local.get(['lastNudgeTs']);
    if (lastNudgeTs && (Date.now() - lastNudgeTs < 10 * 60 * 1000)) {
      return; // Skip if within cooldown period (10 minutes)
    }
    
    // Check if edging behavior is detected
    if (tracker.isEdging()) {
      // Get auth status
      const { token, userId, isAuthenticated } = await getAuthData();
      
      if (isAuthenticated) {
        try {
          // Call API to record edging detection
          const result = await chrome.runtime.sendMessage({ 
            type: 'edging-detected' 
          });
          
          // Show invite banner if successful
          if (result && result.success && result.invite) {
            // Update last nudge timestamp
            chrome.storage.local.set({ lastNudgeTs: Date.now() });
            showBanner(result.invite);
          }
        } catch (error) {
          console.error('Error handling edging detection:', error);
        }
      }
    }
  }, 15000); // Check every 15 seconds
}

export {
  showBanner,
  getAuthData,
  startEdgingDetection
};
