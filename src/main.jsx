import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import VConsole from 'vconsole';

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('debug') === 'true') {
  new VConsole({ theme: 'dark' });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode>
)
