
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Robust registration for proxied environments
    const swPath = './sw.js';
    navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('Forge Elite SW connected successfully at scope:', registration.scope);
      })
      .catch(error => {
        // Minimal log to maintain clean console
        console.warn('Forge Elite: Offline capabilities may be restricted in this environment.');
      });
  });
}
