# React Web App ↔️ Chrome Extension Communication

This project demonstrates bidirectional communication between a React web app and a Chrome extension using the Chrome Extension Messaging API.

## Project Structure

```
raian-extension/
├── raian-extension/          # Chrome Extension (Plasmo)
│   ├── popup.tsx            # Extension popup UI
│   ├── background.ts        # Background service worker
│   ├── content.ts           # Content script (injected into web pages)
│   └── package.json
└── react-webapp/            # React Web App (Vite)
    └── src/
        ├── App.tsx          # Main app with extension communication
        └── App.css
```

## How It Works

### Communication Flow

1. **Web App → Extension:**
   - Web app calls `window.postMessage()` with type `FROM_WEB_APP`
   - Content script listens and forwards to background script via `chrome.runtime.sendMessage()`
   - Background script broadcasts to extension popup
   - Popup receives and displays the data

2. **Extension → Web App:**
   - Popup sends message to background script via `chrome.runtime.sendMessage()`
   - Background script forwards to content script in active tab via `chrome.tabs.sendMessage()`
   - Content script forwards to web page via `window.postMessage()`
   - Web app listens and displays the data

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│  React Web  │◄───────►│   Content    │◄───────►│  Background  │
│     App     │  window │    Script    │ chrome  │    Script    │
│ (localhost) │ postMsg │ (content.ts) │ runtime │(background.ts│
└─────────────┘         └──────────────┘  msgs   └──────┬───────┘
                                                         │
                                                         │ chrome
                                                         │ runtime
                                                         │ msgs
                                                         ▼
                                                  ┌──────────────┐
                                                  │   Extension  │
                                                  │    Popup     │
                                                  │ (popup.tsx)  │
                                                  └──────────────┘
```

## Setup & Running

### 1. Install Extension Dependencies

```powershell
cd E:\raian-extension\raian-extension
cmd /c "npm install"
```

### 2. Install Web App Dependencies

```powershell
cd E:\raian-extension\raian-extension\react-webapp
cmd /c "npm install"
```

### 3. Start Extension Development Server

```powershell
cd E:\raian-extension\raian-extension
cmd /c "npm run dev"
```

This will build the extension in development mode with hot-reload.

### 4. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the folder: `E:\raian-extension\raian-extension\build\chrome-mv3-dev`
5. The extension should now appear in your extensions list

### 5. Start React Web App

```powershell
cd E:\raian-extension\raian-extension\react-webapp
cmd /c "npm run dev"
```

The app will be available at `http://localhost:5173`

### 6. Test Communication

1. Open your browser to `http://localhost:5173`
2. Open the browser DevTools console (F12) to see communication logs
3. Click the extension icon in Chrome toolbar to open the popup
4. Try sending messages:
   - **From Web App:** Type in the input field and click "Send to Extension"
   - **From Extension:** Type in the popup input and click "Send to Web App"
5. Observe messages appearing on both sides

## Key Files Explained

### Extension Files

- **`content.ts`**: Injected into web pages, bridges `window.postMessage` ↔ Chrome runtime messages
- **`background.ts`**: Service worker that relays messages between content script and popup
- **`popup.tsx`**: React UI for the extension popup, sends/receives data

### Web App Files

- **`App.tsx`**: Main React component with `window.postMessage` communication logic
- **`App.css`**: Styled UI for the communication interface

## Debugging Tips

### Check Console Logs

All components log their messages:
- **Web App Console**: Shows messages sent/received by web app
- **Extension Popup Console**: Right-click extension icon → "Inspect popup"
- **Background Script Console**: Go to `chrome://extensions/` → Click "service worker" link
- **Content Script Console**: Check main page console (F12) for content script logs

### Common Issues

1. **Extension not communicating:**
   - Ensure extension is loaded and enabled
   - Check that you granted localhost permissions
   - Reload the extension after code changes

2. **Web app not receiving messages:**
   - Verify content script is injected (check console for "Content script loaded")
   - Make sure you're on `http://localhost:5173`
   - Reload the page after loading extension

3. **"Extension not detected" message:**
   - This is normal on first load before any message exchange
   - Send a message from either side to establish connection

## Message Format

### From Web App to Extension
```typescript
window.postMessage({
  type: 'FROM_WEB_APP',
  payload: {
    message: 'Hello Extension',
    timestamp: '2026-03-07T...'
  }
}, '*')
```

### From Extension to Web App
```typescript
chrome.runtime.sendMessage({
  type: 'FROM_POPUP',
  payload: {
    message: 'Hello Web App',
    timestamp: '2026-03-07T...',
    source: 'extension-popup'
  }
})
```

## Development Workflow

1. **Make changes to extension code** → Plasmo auto-rebuilds → Click "Reload" on extension in `chrome://extensions/`
2. **Make changes to web app code** → Vite hot-reloads automatically
3. **Test communication** → Send messages from both sides

## Production Build

### Build Extension
```powershell
cd E:\raian-extension\raian-extension
cmd /c "npm run build"
```

### Build Web App
```powershell
cd E:\raian-extension\raian-extension\react-webapp
cmd /c "npm run build"
```

## Next Steps

- Add authentication between web app and extension
- Implement persistent storage (chrome.storage.local)
- Add more complex data synchronization
- Handle multiple tabs/windows
- Add error handling and retry logic
