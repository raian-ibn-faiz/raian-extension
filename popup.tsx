import { useState, useEffect } from "react"

function IndexPopup() {
  const [data, setData] = useState("")
  const [webAppData, setWebAppData] = useState<any>(null)
  const [status, setStatus] = useState("Ready")

  useEffect(() => {
    // Check for stored messages on popup open
    chrome.storage.local.get(['latestWebAppMessage', 'webAppMessageTimestamp'], (result) => {
      if (result.latestWebAppMessage) {
        console.log("Popup found stored message:", result.latestWebAppMessage)
        setWebAppData(result.latestWebAppMessage)
        setStatus("Loaded message from web app")
      }
    })

    // Listen for messages from web app (via background script)
    const handleMessage = (message: any) => {
      if (message.type === "WEB_APP_DATA") {
        console.log("Popup received from web app:", message.payload)
        setWebAppData(message.payload)
        setStatus("Received message from web app")
      }
    }

    // Listen for storage changes (when popup is open and new message arrives)
    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes.latestWebAppMessage) {
        console.log("Popup detected storage change:", changes.latestWebAppMessage.newValue)
        setWebAppData(changes.latestWebAppMessage.newValue)
        setStatus("Received message from web app")
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const sendToWebApp = () => {
    if (!data.trim()) return

    const payload = {
      message: data,
      timestamp: new Date().toISOString(),
      source: "extension-popup"
    }

    // Send to background script, which will forward to content script
    chrome.runtime.sendMessage({
      type: "FROM_POPUP",
      payload: payload
    })

    setStatus(`Sent: "${data}"`)
    setData("")
  }

  return (
    <div
      style={{
        padding: 16,
        width: 400,
        minHeight: 300
      }}>
      <h2 style={{ margin: "0 0 16px 0" }}>
        Extension ↔️ Web App
      </h2>
      
      <div style={{ 
        padding: 10, 
        background: "#f0f0f0", 
        borderRadius: 4, 
        marginBottom: 16,
        color: "#333"
      }}>
        <strong>Status:</strong> {status}
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>📤 Send to Web App</h3>
        <input 
          onChange={(e) => setData(e.target.value)} 
          value={data}
          placeholder="Type message to send..."
          style={{
            width: "100%",
            padding: 8,
            marginBottom: 8,
            border: "1px solid #ccc",
            borderRadius: 4,
            boxSizing: "border-box"
          }}
        />
        <button 
          onClick={sendToWebApp}
          style={{
            width: "100%",
            padding: 10,
            background: "#646cff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold"
          }}>
          Send to Web App
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>📥 From Web App</h3>
        <div style={{
          padding: 12,
          background: "#f9f9f9",
          borderRadius: 4,
          minHeight: 80,
          color: "#333",
          fontSize: 12,
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        }}>
          {webAppData ? JSON.stringify(webAppData, null, 2) : "Waiting for data..."}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#666", marginTop: 16 }}>
        <strong>Instructions:</strong>
        <ol style={{ margin: "8px 0", paddingLeft: 20 }}>
          <li>Run the React web app</li>
          <li>Navigate to localhost:5173</li>
          <li>Send messages between app and extension</li>
        </ol>
      </div>
    </div>
  )
}

export default IndexPopup
