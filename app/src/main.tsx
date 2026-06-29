import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from '@/components/ui'
import { AppStoreProvider } from '@/store/AppStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AppStoreProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppStoreProvider>
    </ToastProvider>
  </StrictMode>,
)
