import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { FinanceProvider } from './context/FinanceContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <FinanceProvider>
        <App />
      </FinanceProvider>
    </HashRouter>
  </StrictMode>,
)
