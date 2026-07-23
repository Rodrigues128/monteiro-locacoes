import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemento principal da aplicação não encontrado.')
}

ReactDOM.createRoot(rootElement).render(
  <App />
)
