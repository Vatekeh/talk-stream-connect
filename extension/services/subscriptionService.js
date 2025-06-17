
// Subscription service for browser extension

const BASE_API_URL = 'https://ggbvhsuuwqwjghxpuapg.functions.supabase.co';

/**
 * Creates a subscription for the authenticated user
 * 
 * @param {string} token - Auth token for API request
 * @param {string} priceId - Optional Stripe price ID, defaults to Clutsh Pro
 * @returns {Promise<Object>} - Subscription creation result
 */
async function createSubscription(token, priceId = null) {
  try {
    console.log('[SUBSCRIPTION] Creating subscription...', { price_id: priceId });
    
    // Always send price_id field, even if null (for auto-create logic)
    const requestBody = { price_id: priceId };
    
    const response = await fetch(`${BASE_API_URL}/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SUBSCRIPTION] API error (${response.status}):`, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `Request failed with status ${response.status}` };
      }
      
      return { error: errorData.error || `Request failed with status ${response.status}` };
    }
    
    const data = await response.json();
    console.log('[SUBSCRIPTION] Subscription created successfully:', data);
    return data;
  } catch (error) {
    console.error('[SUBSCRIPTION] Error creating subscription:', error);
    return { error: error.message || 'Network error occurred' };
  }
}

/**
 * Opens the billing portal for subscription management
 * 
 * @param {string} token - Auth token for API request
 * @returns {Promise<Object>} - Billing portal session result
 */
async function openBillingPortal(token) {
  try {
    console.log('[SUBSCRIPTION] Opening billing portal...');
    
    const response = await fetch(`${BASE_API_URL}/billing-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SUBSCRIPTION] Billing portal error (${response.status}):`, errorText);
      return { error: `Request failed with status ${response.status}` };
    }
    
    const data = await response.json();
    if (data.url) {
      // Open billing portal in new tab
      chrome.tabs.create({ url: data.url });
      return { success: true };
    }
    
    return { error: 'No billing portal URL received' };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error opening billing portal:', error);
    return { error: error.message || 'Network error occurred' };
  }
}

export {
  createSubscription,
  openBillingPortal
};
