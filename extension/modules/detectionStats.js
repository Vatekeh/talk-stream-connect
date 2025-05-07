
// Track detection statistics
let detectionStats = {
  count: 0,
  lastDetection: null,
  highConfidenceCount: 0
};

/**
 * Initialize detection statistics from storage
 * @returns {Promise<object>} - Detection statistics
 */
async function initDetectionStats() {
  const result = await chrome.storage.local.get(['detectionStats']);
  if (result.detectionStats) {
    detectionStats = result.detectionStats;
  }
  return detectionStats;
}

/**
 * Update detection statistics with new detection
 * @param {string} className - NSFW class detected
 * @param {number} probability - Confidence score
 * @returns {object} - Updated detection stats
 */
function updateDetectionStats(className, probability) {
  // Increment total detections
  detectionStats.count++;
  
  // Update last detection timestamp
  detectionStats.lastDetection = new Date().toISOString();
  
  // Count high confidence detections (>85%)
  if (probability > 0.85) {
    detectionStats.highConfidenceCount++;
  }
  
  // Store updated stats
  chrome.storage.local.set({ detectionStats });
  
  return detectionStats;
}

/**
 * Check if user needs support based on detection patterns
 * @returns {boolean} - Whether user needs support
 */
function needsSupport() {
  return detectionStats.highConfidenceCount >= 3;
}

/**
 * Reset high confidence counter
 */
function resetHighConfidenceCount() {
  detectionStats.highConfidenceCount = 0;
  chrome.storage.local.set({ detectionStats });
}

export {
  initDetectionStats,
  updateDetectionStats,
  needsSupport,
  resetHighConfidenceCount
};
