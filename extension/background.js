import { updateRoomStatus } from './services/roomStatusService.js';
import { processEdgingDetection, processInviteJoin } from './services/edgingDetectionService.js';
import { createSubscription, openBillingPortal } from './services/subscriptionService.js';
import { PEER_CHECK_INTERVAL } from './api/roomService.js';

// Authentication constants - support both development and production
const getAuthUrlPattern = () => {
  // Check if we're in development by looking at the extension's origin
  const isDevelopment = chrome.runtime.getURL('').includes('chrome-extension://');
  
  // Support multiple domains for auth callback
  return [
    'https://clutsh.live/auth/callback*',
    'https://*.lovable.app/auth/callback*',
    'http://localhost:*/auth/callback*',
    'https://localhost:*/auth/callback*'
  ];
};

const AUTH_URL_PATTERNS = getAuthUrlPattern();

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
  if (changeInfo.url) {
    // Check if the URL matches any of our auth patterns
    const isAuthCallback = AUTH_URL_PATTERNS.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(changeInfo.url);
    });
    
    if (isAuthCallback) {
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
  
  // Handler for creating subscription
  if (msg.type === 'CREATE_SUBSCRIPTION') {
    chrome.storage.local.get(['clutshToken'], async (data) => {
      if (!data.clutshToken) {
        sendResponse({ error: 'User not authenticated' });
        return;
      }
      
      try {
        console.log('[BACKGROUND] Creating subscription with token and price_id:', { 
          hasToken: !!data.clutshToken,
          price_id: msg.price_id 
        });
        
        const result = await createSubscription(data.clutshToken, msg.price_id);
        
        if (result.success && result.clientSecret) {
          // Store the client secret for the checkout process
          chrome.storage.local.set({ 
            pendingSubscription: {
              clientSecret: result.clientSecret,
              subscriptionId: result.subscriptionId,
              createdAt: Date.now()
            }
          });
          
          // Open the web app's subscription checkout page
          const checkoutUrl = `https://clutsh.live/pricing?checkout=true&client_secret=${result.clientSecret}`;
          chrome.tabs.create({ url: checkoutUrl });
          sendResponse({ success: true });
        } else {
          console.error('[BACKGROUND] Subscription creation failed:', result);
          sendResponse(result);
        }
      } catch (error) {
        console.error('[BACKGROUND] Error in subscription creation:', error);
        sendResponse({ error: error.message || 'Failed to create subscription' });
      }
    });
    return true; // Needed for async response
  }
  
  // Handler for opening billing portal
  if (msg.type === 'OPEN_BILLING_PORTAL') {
    chrome.storage.local.get(['clutshToken'], async (data) => {
      if (!data.clutshToken) {
        sendResponse({ error: 'User not authenticated' });
        return;
      }
      
      try {
        const result = await openBillingPortal(data.clutshToken);
        sendResponse(result);
      } catch (error) {
        sendResponse({ error: error.message });
      }
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
