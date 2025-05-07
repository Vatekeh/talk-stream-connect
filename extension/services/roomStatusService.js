
import { fetchRoomStatus, PEER_CHECK_INTERVAL } from '../api/roomService.js';
import { getUserIdFromToken } from '../api/authService.js';

/**
 * Updates room status and stores the result in local storage
 */
async function updateRoomStatus() {
  chrome.storage.local.get(['clutchToken', 'lastPeerCheck'], async (res) => {
    const now = Date.now();
    const token = res.clutchToken;
    const lastCheck = res.lastPeerCheck || 0;
    
    // Only check if we have a token and it's been at least 2 minutes since last check
    if (token && (now - lastCheck) > PEER_CHECK_INTERVAL) {
      try {
        // Get user ID from token
        const userId = getUserIdFromToken(token);
        
        if (!userId) {
          console.error('Failed to get user ID from token');
          return;
        }
        
        // Call our edge function to get room status
        const data = await fetchRoomStatus(token, userId);
        
        if (data.error) {
          console.error('Error fetching room status:', data.error);
          return;
        }
        
        // Update storage with latest room status
        chrome.storage.local.set({
          lastPeerCheck: now,
          peerCount: data.activePeers,
          supportRoomUrl: data.roomUrl,
          supportRoomId: data.roomId,
          supportRoomName: data.roomName,
          supportRoomReady: data.isReady
        });
      } catch (error) {
        console.error('Error updating room status:', error);
      }
    }
  });
}

export {
  updateRoomStatus
}
