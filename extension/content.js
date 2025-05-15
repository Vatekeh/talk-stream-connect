
import { initModel, unblurAll } from './modules/nsfwDetection.js';
import { initDetectionStats } from './modules/detectionStats.js';
import { initScanner } from './modules/contentScanner.js';
import { EdgingTracker, attachVideoListeners, attachBlurListeners } from './modules/edgingTracker.js';
import { startEdgingDetection } from './modules/edgingDetection.js';
import { setupMessageListeners } from './modules/extensionMessaging.js';

// Global state
let enabled = true;
let scanner = null;
let tracker = new EdgingTracker();
let isUnloading = false;

// Set flag on page unload to prevent errors
window.addEventListener('beforeunload', () => {
  isUnloading = true;
});

/**
 * Initialize filter components
 */
async function initializeFilter() {
  await initDetectionStats();
  await initModel();
  scanner = await initScanner();
  
  // Initialize edging tracker
  attachVideoListeners(tracker);
  attachBlurListeners(tracker);
  startEdgingDetection(enabled, isUnloading, tracker);
}

// Initialize from storage
chrome.storage.local.get(['detectionEnabled'], async res => {
  // Set enabled state from storage or default to true
  enabled = res.detectionEnabled !== false;
  
  if (enabled) {
    await initializeFilter();
  }
});

// Set up message listener for toggle filter
setupMessageListeners({
  onToggleFilter: (newEnabledState) => {
    enabled = newEnabledState;
    
    if (enabled && !scanner) {
      // If enabled and not already initialized, initialize components
      initializeFilter();
    } else if (!enabled) {
      // If disabled, remove all blurring
      unblurAll();
    }
  }
});
