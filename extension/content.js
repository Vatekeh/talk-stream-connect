
import { initModel, unblurAll } from './modules/nsfwDetection.js';
import { initDetectionStats } from './modules/detectionStats.js';
import { initScanner } from './modules/contentScanner.js';

let enabled = true;
let scanner = null;

// Initialize from storage
chrome.storage.local.get(['detectionEnabled'], async res => {
  // Set enabled state from storage or default to true
  enabled = res.detectionEnabled !== false;
  
  if (enabled) {
    // Initialize all components
    await initDetectionStats();
    await initModel();
    scanner = await initScanner();
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
      });
    } else {
      // If disabled, remove all blurring
      unblurAll();
    }
  }
});
