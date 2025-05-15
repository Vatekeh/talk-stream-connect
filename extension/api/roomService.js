
// Room service module - handles all room-related API calls

const BASE_API_URL = 'https://ggbvhsuuwqwjghxpuapg.functions.supabase.co';

// Cache support room data (update every 2 minutes)
const PEER_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

/**
 * Fetches room status from the Supabase edge function
 * 
 * @param {string} token - Auth token for API request
 * @param {string} userId - User ID to check room status for
 * @returns {Promise<Object>} - Room status information
 */
async function fetchRoomStatus(token, userId) {
  try {
    const response = await fetch(`${BASE_API_URL}/get-room-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Room status API error (${response.status}):`, errorText);
      return { error: `Request failed with status ${response.status}` };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching room status:', error);
    return { error: error.message || 'Network error occurred' };
  }
}

/**
 * Handles edging detection by calling Supabase edge function
 * 
 * @param {string} token - Auth token for API request
 * @param {string} userId - User ID for edging detection
 * @returns {Promise<Object>} - Detection handling result
 */
async function handleEdgingDetection(token, userId) {
  try {
    const response = await fetch(`${BASE_API_URL}/on-edging-detected`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edging detection API error (${response.status}):`, errorText);
      return { error: `Request failed with status ${response.status}` };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error handling edging detection:', error);
    return { error: error.message || 'Network error occurred' };
  }
}

/**
 * Joins an invite using the invite ID
 * 
 * @param {string} token - Auth token for API request
 * @param {string} inviteId - ID of the invite to join
 * @returns {Promise<Object>} - Join invite result
 */
async function joinInvite(token, inviteId) {
  try {
    const response = await fetch(`${BASE_API_URL}/join-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ inviteId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Join invite API error (${response.status}):`, errorText);
      return { error: `Request failed with status ${response.status}` };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error joining invite:', error);
    return { error: error.message || 'Network error occurred' };
  }
}

export {
  fetchRoomStatus,
  handleEdgingDetection,
  joinInvite,
  PEER_CHECK_INTERVAL,
}
