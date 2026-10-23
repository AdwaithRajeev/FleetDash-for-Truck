/**
 * main.tsx – Vite React entry point
 * Week 1: Standard React 18 root render.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found. Check index.html.');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
