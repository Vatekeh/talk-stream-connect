
/**
 * Safe wrapper for API requests that handles context invalidated errors
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - API response
 */
async function safePostToApi(endpoint, data, token) {
  try {
    const response = await fetch(`https://ggbvhsuuwqwjghxpuapg.functions.supabase.co${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      return { error: `Request failed with status ${response.status}` };
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    return { error: error.message };
  }
}

export {
  safePostToApi
};
