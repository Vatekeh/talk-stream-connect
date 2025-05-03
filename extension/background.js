chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ detectionEnabled: true })
  chrome.runtime.openOptionsPage()
})

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === 'toggle-filter') {
    chrome.storage.local.set({ detectionEnabled: msg.enabled })
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, msg))
    })
  }
})