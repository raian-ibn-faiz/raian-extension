// Content script that bridges communication between web page and extension

console.log("Raian Extension: Content script loaded")

// Listen for messages from the web page
window.addEventListener("message", (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return

  if (event.data.type && event.data.type === "FROM_WEB_APP") {
    console.log("Content script received from web app:", event.data.payload)
    
    // Forward message to extension background/popup
    chrome.runtime.sendMessage({
      type: "FROM_WEB_APP",
      payload: event.data.payload
    })
  }
})

// Listen for messages from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FROM_EXTENSION") {
    console.log("Content script received from extension:", message.payload)
    
    // Forward message to web page
    window.postMessage({
      type: "FROM_EXTENSION",
      payload: message.payload
    }, "*")
  }
})
