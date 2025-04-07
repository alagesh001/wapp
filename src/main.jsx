import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Register PWA
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("A new version is available. Refresh now?")) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline.")
  }
})