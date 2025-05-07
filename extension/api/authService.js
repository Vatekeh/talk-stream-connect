
/**
 * Extracts user ID from a JWT token
 * 
 * @param {string} token - JWT token
 * @returns {string|null} - User ID or null if token is invalid
 */
function getUserIdFromToken(token) {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.sub;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

export {
  getUserIdFromToken
}
