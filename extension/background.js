
import { updateRoomStatus } from './services/roomStatusService.js';
import { processEdgingDetection, processInviteJoin } from './services/edgingDetectionService.js';
import { PEER_CHECK_INTERVAL } from './api/roomService.js';

// Authentication constants
const AUTH_URL_PATTERN = 'https://clutsh.live/auth/callback*';

// Initialize extension settings
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Extension] Extension installed, initializing settings");
  chrome.storage.local.set({ 
    detectionEnabled: true,
    lastPeerCheck: 0,
    peerCount: 0,
    supportRoomUrl: null,
    supportNotificationShown: false,
    lastEdgingDetection: 0,
    lastNudgeTs: 0
  });
  chrome.runtime.openOptionsPage();
});

// Listen for tab updates to detect auth callback
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes(AUTH_URL_PATTERN)) {
    try {
      console.log("[Extension] Auth callback detected:", changeInfo.url);
      
      // Extract token and userId from hash fragment
      const url = new URL(changeInfo.url);
      console.log("[Extension] Auth URL parsed:", {
        origin: url.origin,
        pathname: url.pathname,
        hash: url.hash ? "Present (hidden)" : "Missing",
        hashLength: url.hash ? url.hash.length : 0
      });
      
      const params = new URLSearchParams(url.hash.substring(1));
      console.log("[Extension] Auth params extracted:", {
        hasToken: params.has('token'),
        hasUserId: params.has('userId')
      });
      
      const token = params.get('token');
      const userId = params.get('userId');
      
      if (token && userId) {
        console.log("[Extension] Auth credentials found, storing credentials");
        // Store auth data in local storage
        chrome.storage.local.set({
          clutshToken: token,
          currentUserId: userId,
          authTs: Date.now()
        }, () => {
          console.log("[Extension] Credentials stored, closing auth tab and showing notification");
          // Close the auth tab
          chrome.tabs.remove(tabId);
          
          // Show success notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Clutsh Sign-in Successful',
            message: 'You are now signed in to Clutsh NSFW Monitor.'
          });
        });
      } else {
        console.error("[Extension] Auth error: Token or userId missing");
      }
    } catch (error) {
      console.error('[Extension] Error processing auth callback:', error);
    }
  }
});

// Update room status when installed and then periodically
updateRoomStatus();
setInterval(updateRoomStatus, PEER_CHECK_INTERVAL);

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'toggle-filter') {
    chrome.storage.local.set({ detectionEnabled: msg.enabled });
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, msg));
    });
  }
  
  // Handler to get current auth status
  if (msg.type === 'GET_AUTH') {
    chrome.storage.local.get(['clutshToken', 'currentUserId'], (data) => {
      sendResponse({
        token: data.clutshToken || null,
        userId: data.currentUserId || null,
        isAuthenticated: !!data.clutshToken
      });
    });
    return true; // Needed for async response
  }
  
  // Handler for opening support room
  if (msg.type === 'OPEN_SUPPORT_ROOM') {
    const url = msg.roomUrl || 'https://clutsh.live/support-room';
    chrome.tabs.create({ url });
    return true;
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
