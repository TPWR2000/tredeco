import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

function renderOfflineFallback() {
  const root = document.getElementById('root');
  if (!root) {
    return;
  }

  root.innerHTML =
    '<div style="min-height:100vh;display:grid;place-items:center;padding:24px;font-family:system-ui,sans-serif;text-align:center;">' +
    '<div><h1 style="margin:0 0 8px;">Brak połączenia</h1>' +
    '<p style="margin:0;color:#64748b;">Nie udało się załadować widoku. Spróbuj ponownie po odzyskaniu sieci.</p></div>' +
    '</div>';
}

function isRouteChunkError(message?: string): boolean {
  if (!message) {
    return false;
  }

  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed')
  );
}

window.addEventListener('error', (event) => {
  if (!navigator.onLine && isRouteChunkError(event.message)) {
    renderOfflineFallback();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason as { message?: string } | undefined;
  if (!navigator.onLine && isRouteChunkError(reason?.message)) {
    renderOfflineFallback();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
