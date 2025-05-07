
import { updateRoomStatus } from './services/roomStatusService.js';
import { processEdgingDetection, processInviteJoin } from './services/edgingDetectionService.js';
import { PEER_CHECK_INTERVAL } from './api/roomService.js';

// Initialize extension settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    detectionEnabled: true,
    lastPeerCheck: 0,
    peerCount: 0,
    supportRoomUrl: null,
    supportNotificationShown: false,
    lastEdgingDetection: 0
  });
  chrome.runtime.openOptionsPage();
});

// Update room status when installed and then periodically
updateRoomStatus();
setInterval(updateRoomStatus, PEER_CHECK_INTERVAL);

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === 'toggle-filter') {
    chrome.storage.local.set({ detectionEnabled: msg.enabled });
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, msg));
    });
  }
  
  // Handler to get current room status
  if (msg.type === 'get-room-status') {
    chrome.storage.local.get(['peerCount', 'supportRoomUrl', 'supportRoomName', 'supportRoomReady'], (data) => {
      sendResponse({
        peerCount: data.peerCount || 0,
        roomUrl: data.supportRoomUrl,
        roomName: data.supportRoomName || "Support Room",
        isReady: !!data.supportRoomReady
      });
    });
    return true; // Needed for async response
  }
  
  // Trigger a check for room status right away
  if (msg.type === 'check-room-status-now') {
    chrome.storage.local.set({ lastPeerCheck: 0 }, () => {
      updateRoomStatus();
      setTimeout(() => {
        chrome.storage.local.get(['peerCount', 'supportRoomUrl', 'supportRoomReady'], (data) => {
          sendResponse({
            peerCount: data.peerCount || 0,
            roomUrl: data.supportRoomUrl,
            isReady: !!data.supportRoomReady
          });
        });
      }, 1000); // Give time for the update to complete
    });
    return true; // Needed for async response
  }
  
  // Handle edging detection from content script
  if (msg.type === 'edging-detected') {
    processEdgingDetection(sendResponse);
    return true; // Needed for async response
  }
  
  // Handle join invite from content script
  if (msg.type === 'join-invite') {
    processInviteJoin(msg.inviteId, sendResponse);
    return true; // Needed for async response
  }
  
  // Get current invite status
  if (msg.type === 'get-invite-status') {
    chrome.storage.local.get(['currentInviteId', 'inviteExpiresAt'], (data) => {
      const now = new Date();
      const expiresAt = data.inviteExpiresAt ? new Date(data.inviteExpiresAt) : null;
      const timeRemaining = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : 0;
      
      sendResponse({
        inviteId: data.currentInviteId,
        expiresAt: data.inviteExpiresAt,
        timeRemaining: timeRemaining,
        hasActiveInvite: !!data.currentInviteId && timeRemaining > 0
      });
    });
    return true; // Needed for async response
  }
});
