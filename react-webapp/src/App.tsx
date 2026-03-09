import { useState, useEffect } from 'react'
import './App.css'

interface ExtensionMessage {
  type: string
  payload: any
}

function App() {
  const [webAppData, setWebAppData] = useState('')
  const [extensionData, setExtensionData] = useState<any>(null)
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false)

  useEffect(() => {
    // Listen for messages from extension
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'FROM_EXTENSION') {
        console.log('Web app received from extension:', event.data.payload)
        setExtensionData(event.data.payload)
        setIsExtensionInstalled(true)
      }
    }

    window.addEventListener('message', handleMessage)

    // Ping extension to check if installed
    sendToExtension({ ping: true })

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const sendToExtension = (data: any) => {
    console.log('Web app sending to extension:', data)
    window.postMessage({
      type: 'FROM_WEB_APP',
      payload: data
    }, '*')
  }

  const handleSendData = () => {
    if (!webAppData.trim()) return
    
    sendToExtension({
      message: webAppData,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="app-container">
      <h1>React Web App ↔️ Chrome Extension</h1>
      
      <div className="status">
        <span className={`status-indicator ${isExtensionInstalled ? 'connected' : 'disconnected'}`}>
          {isExtensionInstalled ? '🟢 Extension Connected' : '🔴 Extension Not Detected'}
        </span>
      </div>

      <div className="section">
        <h2>📤 Send Data to Extension</h2>
        <input
          type="text"
          value={webAppData}
          onChange={(e) => setWebAppData(e.target.value)}
          placeholder="Type message to send to extension..."
          className="input-field"
        />
        <button onClick={handleSendData} className="btn-primary">
          Send to Extension
        </button>
      </div>

      <div className="section">
        <h2>📥 Received from Extension</h2>
        <div className="data-display">
          {extensionData ? (
            <pre>{JSON.stringify(extensionData, null, 2)}</pre>
          ) : (
            <p className="placeholder">Waiting for data from extension...</p>
          )}
        </div>
      </div>

      <div className="instructions">
        <h3>📋 Setup Instructions</h3>
        <ol>
          <li>Make sure the Chrome extension is installed and loaded</li>
          <li>The extension should be running on this page (check DevTools console)</li>
          <li>Send messages from either side to test communication</li>
        </ol>
      </div>
    </div>
  )
}

export default App
