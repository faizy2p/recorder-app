import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import App from './App.jsx'
import Recorder from './Recorder.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  //</StrictMode>
);
