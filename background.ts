// Background service worker that relays messages between content script and popup

export {}

console.log("Raian Extension: Background service worker started")

// Listen for messages from content script (which come from web app)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message)
  
  if (message.type === "FROM_WEB_APP") {
    // Store the message so popup can retrieve it
    chrome.storage.local.set({ 
      latestWebAppMessage: message.payload,
      webAppMessageTimestamp: Date.now()
    }, () => {
      console.log("Stored web app message")
    })
    
    // Try to send to popup if it's open
    chrome.runtime.sendMessage({
      type: "WEB_APP_DATA",
      payload: message.payload
    }).catch(() => {
      console.log("Popup not open, message stored for later")
    })
  }
  
  if (message.type === "FROM_POPUP") {
    // Send to active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "FROM_EXTENSION",
          payload: message.payload
        })
      }
    })
  }
  
  return true // Keep message channel open for async response
})
