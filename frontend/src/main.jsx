import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { store } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: 'toast-custom',
              style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#374151',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                maxWidth: '380px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </StrictMode>,
)
