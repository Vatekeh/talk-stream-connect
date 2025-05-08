
import { initModel, unblurAll } from './modules/nsfwDetection.js';
import { initDetectionStats } from './modules/detectionStats.js';
import { initScanner } from './modules/contentScanner.js';
import { EdgingTracker, attachVideoListeners, attachBlurListeners } from './modules/edgingTracker.js';

let enabled = true;
let scanner = null;
let tracker = new EdgingTracker();
let isUnloading = false;

// Set flag on page unload to prevent errors
window.addEventListener('beforeunload', () => {
  isUnloading = true;
});

// Initialize from storage
chrome.storage.local.get(['detectionEnabled'], async res => {
  // Set enabled state from storage or default to true
  enabled = res.detectionEnabled !== false;
  
  if (enabled) {
    // Initialize all components
    await initDetectionStats();
    await initModel();
    scanner = await initScanner();
    
    // Initialize edging tracker
    attachVideoListeners(tracker);
    attachBlurListeners(tracker);
    startEdgingDetection();
  }
});

// Listen for messages from the extension popup or background script
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'toggle-filter') {
    enabled = msg.enabled;
    
    if (enabled) {
      // If enabled and not already initialized, initialize components
      initModel().then(() => {
        if (!scanner) {
          initScanner().then(newScanner => {
            scanner = newScanner;
          });
        }
        if (!tracker) {
          tracker = new EdgingTracker();
          attachVideoListeners(tracker);
          attachBlurListeners(tracker);
          startEdgingDetection();
        }
      });
    } else {
      // If disabled, remove all blurring
      unblurAll();
    }
  }
});

/**
 * Safe wrapper for API requests that handles context invalidated errors
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - API response
 */
async function safePostToApi(endpoint, data, token) {
  if (isUnloading) {
    return Promise.reject(new Error('Page is unloading'));
  }
  
  try {
    const response = await fetch(`https://ggbvhsuuwqwjghxpuapg.functions.supabase.co${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    return { error: error.message };
  }
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
 * Start edging detection loop
 */
function startEdgingDetection() {
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
