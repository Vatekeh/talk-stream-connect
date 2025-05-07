
import { handleEdgingDetection, joinInvite } from '../api/roomService.js';
import { getUserIdFromToken } from '../api/authService.js';

// Configuration constants
const EDGING_DETECTION_COOLDOWN = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Check if we're within the cooldown period for edging detection
 * 
 * @param {number} lastDetection - Timestamp of last detection
 * @returns {boolean} - True if within cooldown period
 */
function isWithinCooldownPeriod(lastDetection) {
  const now = Date.now();
  return (now - lastDetection) < EDGING_DETECTION_COOLDOWN;
}

/**
 * Validate auth token is available and extract user ID
 * 
 * @param {string|null} token - Authentication token
 * @returns {Object} - Validation result with success and userId or error
 */
function validateAuthToken(token) {
  if (!token) {
    return { 
      success: false, 
      error: 'No auth token available' 
    };
  }
  
  const userId = getUserIdFromToken(token);
  
  if (!userId) {
    return { 
      success: false, 
      error: 'Invalid token format' 
    };
  }
  
  return { 
    success: true, 
    userId 
  };
}

/**
 * Handle successful edging detection
 * 
 * @param {Object} result - Result from handleEdgingDetection API call
 * @param {Function} sendResponse - Function to send response to caller
 */
function handleSuccessfulDetection(result, sendResponse) {
  const now = Date.now();
  
  // Update storage with invite details
  chrome.storage.local.set({
    lastEdgingDetection: now,
    currentInviteId: result.invite.id,
    inviteExpiresAt: result.invite.expires_at
  });
  
  sendResponse({ 
    success: true, 
    invite: result.invite 
  });
}

/**
 * Processes edging detection and creates invite if needed
 * 
 * @param {Function} sendResponse - Function to send response to the caller
 */
function processEdgingDetection(sendResponse) {
  chrome.storage.local.get(['clutshToken', 'lastEdgingDetection'], async (res) => {
    const lastDetection = res.lastEdgingDetection || 0;
    
    // Check if we're within cooldown period
    if (isWithinCooldownPeriod(lastDetection)) {
      console.log('Edging detection within cooldown period, ignoring');
      sendResponse({ 
        success: false, 
        error: 'Detection in cooldown period' 
      });
      return;
    }
    
    const token = res.clutshToken;
    const tokenValidation = validateAuthToken(token);
    
    if (!tokenValidation.success) {
      console.error('Auth token validation failed:', tokenValidation.error);
      sendResponse({ 
        success: false, 
        error: tokenValidation.error 
      });
      return;
    }
    
    try {
      // Handle the edging detection
      const result = await handleEdgingDetection(token, tokenValidation.userId);
      
      if (result.error) {
        console.error('Error handling edging detection:', result.error);
        sendResponse({ 
          success: false, 
          error: result.error 
        });
        return;
      }
      
      handleSuccessfulDetection(result, sendResponse);
    } catch (error) {
      console.error('Error processing edging detection:', error);
      sendResponse({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      });
    }
  });
}

/**
 * Processes invite join request
 * 
 * @param {string} inviteId - ID of the invite to join
 * @param {Function} sendResponse - Function to send response to the caller
 */
function processInviteJoin(inviteId, sendResponse) {
  chrome.storage.local.get(['clutshToken'], async (res) => {
    const token = res.clutshToken;
    const tokenValidation = validateAuthToken(token);
    
    if (!tokenValidation.success) {
      sendResponse({ 
        success: false, 
        error: tokenValidation.error 
      });
      return;
    }
    
    try {
      const data = await joinInvite(token, inviteId);
      
      if (data.error) {
        console.error('Error joining invite:', data.error);
        sendResponse({ 
          success: false, 
          error: data.error 
        });
        return;
      }
      
      sendResponse({ 
        success: true, 
        roomUrl: data.roomUrl, 
        streakCount: data.streakCount 
      });
    } catch (error) {
      console.error('Error joining invite:', error);
      sendResponse({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      });
    }
  });
}

export {
  processEdgingDetection,
  processInviteJoin,
  // Export these for testing purposes
  isWithinCooldownPeriod,
  validateAuthToken,
  EDGING_DETECTION_COOLDOWN
}
