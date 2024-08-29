import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <GoogleOAuthProvider clientId="803250168982-darab049allvfetssboncu7o4prgpllr.apps.googleusercontent.com">
   <AuthProvider>
      <App />
      </AuthProvider>
      </GoogleOAuthProvider>

  </React.StrictMode>
);
