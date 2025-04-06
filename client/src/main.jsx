import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {App} from './App.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <AuthProvider>
    <App />

      </AuthProvider>

    <ToastContainer position="top-right" autoClose={3000} />
  </StrictMode>,
)
