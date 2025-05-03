const state = {}
chrome.storage.local.get(['lastDetection', 'detectionEnabled'], res => {
  state.last = res.lastDetection
  state.enabled = res.detectionEnabled !== false
  render()
})

function render() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <h1>${state.enabled ? '✅ Enabled' : '⛔️ Disabled'}</h1>
    ${state.last
      ? `<p><b>${state.last.detectedClass}</b> (${(state.last.confidence * 100).toFixed()}%)</p>
         <a target="_blank" href="${state.last.mediaUrl}">${state.last.mediaUrl}</a>`
      : '<p>No detections yet.</p>'}
    <button id="toggle">${state.enabled ? 'Disable' : 'Enable'} Filter</button>
    <hr/>
    <a href="https://clutch.your-domain.com" target="_blank">Open Clutch Dashboard</a>
  `
  document.getElementById('toggle').onclick = () => {
    state.enabled = !state.enabled
    chrome.runtime.sendMessage({ type: 'toggle-filter', enabled: state.enabled })
    render()
  }
}