// entry point
// "plugs" the react app into the html file (index.html)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // Ensure this file ONLY contains the @tailwind directives

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)