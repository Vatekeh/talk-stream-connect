
import { detectNsfw, report } from './nsfwDetection.js';
import { updateDetectionStats, needsSupport } from './detectionStats.js';
import { showSupportPrompt } from './supportUI.js';

/**
 * Scan a DOM node and its children for images and videos
 * @param {Node} root - Root node to scan
 * @returns {Promise<void>}
 */
async function scan(root) {
  if (!root) return;
  
  // Find all images and videos in the provided root element
  const mediaElements = [...root.querySelectorAll('img, video')];
  
  for (const el of mediaElements) {
    // Skip elements that have already been scanned
    if (el.dataset.__nsfw_scanned) continue;
    
    // Scan the element with the NSFW model
    const result = await detectNsfw(el, (mediaUrl, className, probability) => {
      // Report the detection to the backend
      report(mediaUrl, className, probability);
      
      // Update detection statistics
      const stats = updateDetectionStats(className, probability);
      
      // Check if we should show support notification
      if (needsSupport()) {
        chrome.storage.local.get(['lastSupportPrompt', 'supportRoomReady'], res => {
          const now = Date.now();
          const lastPrompt = res.lastSupportPrompt || 0;
          
          // Only show support prompt max once per hour and if support room has peers
          if (res.supportRoomReady && (now - lastPrompt) > 3600000) {
            // Send edging detection to background script
            chrome.runtime.sendMessage({ type: 'edging-detected' }, response => {
              if (response && response.success) {
                showSupportPrompt();
                chrome.storage.local.set({ lastSupportPrompt: now });
              }
            });
          }
        });
      }
    });
  }
}

/**
 * Initialize the content scanner
 * @returns {Promise<MutationObserver>} - DOM Mutation Observer
 */
async function initScanner() {
  // Scan the initial page content
  scan(document.body);
  
  // Set up mutation observer to scan new content
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => scan(node));
    });
  });
  
  // Start observing the document body for DOM changes
  observer.observe(document.body, { childList: true, subtree: true });
  
  return observer;
}

export {
  scan,
  initScanner
};
