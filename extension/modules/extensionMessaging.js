
/**
 * Set up message listeners for extension communication
 * @param {Object} config - Configuration object
 * @param {Function} config.onToggleFilter - Handler for toggle filter message
 */
function setupMessageListeners({ onToggleFilter }) {
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'toggle-filter' && onToggleFilter) {
      onToggleFilter(msg.enabled);
    }
  });
}

export { setupMessageListeners };
