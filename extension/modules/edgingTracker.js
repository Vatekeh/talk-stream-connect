
/**
 * EdgingTracker
 * Tracks user behavior to detect edging patterns including:
 * - Video seek-backs
 * - Blur/focus events
 * - Dwell time
 * - Replays
 */
class EdgingTracker {
  constructor() {
    this.dwellTime = 0;
    this.seekBacks = 0;
    this.blurFocusToggles = 0;
    this.replays = 0;
    this.lastVideoTime = 0;
    this.lastActiveTs = Date.now();
    this.edgingScore = 0;
    this.edgingThreshold = 7; // The minimum score to consider edging behavior
  }

  /**
   * Increment dwell time (time spent on page)
   * @param {number} seconds - Number of seconds to increment
   */
  incrementDwellTime(seconds = 1) {
    this.dwellTime += seconds;
    this.updateEdgingScore();
  }

  /**
   * Track video time changes to detect seek-backs
   * @param {number} currentTime - Current video time
   * @param {number} previousTime - Previous video time
   */
  trackVideoTime(currentTime, previousTime) {
    // Detect seek-backs (going backward in video)
    if (previousTime > 0 && 
        currentTime < previousTime && 
        previousTime - currentTime > 3 && 
        previousTime - currentTime < 60) {
      this.seekBacks++;
      this.updateEdgingScore();
    }
    
    // Detect replays (going back to the beginning)
    if (previousTime > 30 && currentTime < 3) {
      this.replays++;
      this.updateEdgingScore();
    }
    
    this.lastVideoTime = currentTime;
  }

  /**
   * Track blur/focus events
   * @param {boolean} isFocused - Whether the window is focused
   */
  trackFocusChange(isFocused) {
    const now = Date.now();
    const timeDiff = now - this.lastActiveTs;
    
    // Only count toggles if there's a reasonable time between events
    if (timeDiff > 1000 && timeDiff < 30000) {
      this.blurFocusToggles++;
      this.updateEdgingScore();
    }
    
    this.lastActiveTs = now;
  }

  /**
   * Calculate and update current edging score based on behaviors
   */
  updateEdgingScore() {
    // Calculate score based on various tracking metrics
    this.edgingScore = 
      (this.seekBacks * 2) + 
      (this.blurFocusToggles * 1.5) + 
      (this.replays * 3) + 
      (this.dwellTime > 300 ? 3 : Math.floor(this.dwellTime / 100)); // Add points for lengthy dwell time
  }

  /**
   * Check if current behavior indicates edging
   * @returns {boolean} - True if edging behavior detected
   */
  isEdging() {
    return this.edgingScore >= this.edgingThreshold;
  }

  /**
   * Reset all tracking metrics
   */
  reset() {
    this.dwellTime = 0;
    this.seekBacks = 0;
    this.blurFocusToggles = 0;
    this.replays = 0;
    this.edgingScore = 0;
  }

  /**
   * Get current tracking data
   * @returns {Object} - Tracking metrics and score
   */
  getStats() {
    return {
      dwellTime: this.dwellTime,
      seekBacks: this.seekBacks,
      blurFocusToggles: this.blurFocusToggles,
      replays: this.replays,
      edgingScore: this.edgingScore,
      isEdging: this.isEdging()
    };
  }
}

/**
 * Attach listeners to all video elements on the page
 * @param {EdgingTracker} tracker - EdgingTracker instance
 */
function attachVideoListeners(tracker) {
  // Track existing videos
  document.querySelectorAll('video').forEach(video => {
    addVideoTracking(video, tracker);
  });
  
  // Set up mutation observer to track new videos
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === 'VIDEO') {
          addVideoTracking(node, tracker);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('video').forEach(video => {
            addVideoTracking(video, tracker);
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Add tracking to a specific video element
 * @param {HTMLVideoElement} video - Video element to track
 * @param {EdgingTracker} tracker - EdgingTracker instance
 */
function addVideoTracking(video, tracker) {
  let lastTime = 0;
  
  video.addEventListener('timeupdate', () => {
    if (lastTime > 0) {
      tracker.trackVideoTime(video.currentTime, lastTime);
    }
    lastTime = video.currentTime;
  });
  
  video.addEventListener('seeked', () => {
    tracker.trackVideoTime(video.currentTime, lastTime);
    lastTime = video.currentTime;
  });
}

/**
 * Attach blur/focus listeners to window
 * @param {EdgingTracker} tracker - EdgingTracker instance
 */
function attachBlurListeners(tracker) {
  window.addEventListener('blur', () => {
    tracker.trackFocusChange(false);
  });
  
  window.addEventListener('focus', () => {
    tracker.trackFocusChange(true);
  });
}

export {
  EdgingTracker,
  attachVideoListeners,
  attachBlurListeners
};
