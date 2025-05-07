
import { handleEdgingDetection } from '../api/roomService.js';
import { getUserIdFromToken } from '../api/authService.js';

// Edging detection cooldown period
const EDGING_DETECTION_COOLDOWN = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Processes edging detection and creates invite if needed
 * 
 * @param {Function} sendResponse - Function to send response to the caller
 */
function processEdgingDetection(sendResponse) {
  chrome.storage.local.get(['clutchToken', 'lastEdgingDetection'], async (res) => {
    const now = Date.now();
    const lastDetection = res.lastEdgingDetection || 0;
    
    // Check if we're within cooldown period
    if ((now - lastDetection) < EDGING_DETECTION_COOLDOWN) {
      console.log('Edging detection within cooldown period, ignoring');
      sendResponse({ success: false, error: 'Detection in cooldown period' });
      return;
    }
    
    const token = res.clutchToken;
    if (!token) {
      console.error('No auth token available for edging detection');
      sendResponse({ success: false, error: 'No auth token available' });
      return;
    }
    
    try {
      // Get user ID from token
      const userId = getUserIdFromToken(token);
      
      if (!userId) {
        sendResponse({ success: false, error: 'Invalid token format' });
        return;
      }
      
      // Handle the edging detection
      const result = await handleEdgingDetection(token, userId);
      
      if (result.error) {
        console.error('Error handling edging detection:', result.error);
        sendResponse({ success: false, error: result.error });
        return;
      }
      
      // Update last detection timestamp
      chrome.storage.local.set({
        lastEdgingDetection: now,
        currentInviteId: result.invite.id,
        inviteExpiresAt: result.invite.expires_at
      });
      
      sendResponse({ success: true, invite: result.invite });
    } catch (error) {
      console.error('Error processing edging detection:', error);
      sendResponse({ success: false, error: error.message });
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
  chrome.storage.local.get(['clutchToken'], async (res) => {
    const token = res.clutchToken;
    if (!token) {
      sendResponse({ success: false, error: 'No auth token available' });
      return;
    }
    
    try {
      // Import join invite function dynamically to avoid circular dependencies
      const { joinInvite } = await import('../api/roomService.js');
      const data = await joinInvite(token, inviteId);
      
      if (data.error) {
        console.error('Error joining invite:', data.error);
        sendResponse({ success: false, error: data.error });
        return;
      }
      
      sendResponse({ success: true, roomUrl: data.roomUrl, streakCount: data.streakCount });
    } catch (error) {
      console.error('Error joining invite:', error);
      sendResponse({ success: false, error: error.message });
    }
  });
}

export {
  processEdgingDetection,
  processInviteJoin
}
