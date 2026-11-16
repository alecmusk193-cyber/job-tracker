import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { isFirebaseConfigured } from './config/firebase';
import { AuthProvider } from './context/AuthContext';
import './index.css';

/**
 * HashRouter is used instead of BrowserRouter because GitHub Pages is a
 * static host: deep links like /job-tracker/jobs would 404 on refresh,
 * while /job-tracker/#/jobs always loads index.html.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      {/* Without a Firebase config there is nothing to authenticate against */}
      {isFirebaseConfigured ? (
        <AuthProvider>
          <App />
        </AuthProvider>
      ) : (
        <App />
      )}
    </HashRouter>
  </React.StrictMode>,
);
