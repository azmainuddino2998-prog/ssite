// Patch window.fetch to allow polyfills (e.g., formdata-polyfill) to assign to window.fetch without throwing getter-only TypeError
try {
  let _fetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    get() {
      return _fetch;
    },
    set(fn) {
      _fetch = fn;
    },
  });
} catch (e) {
  // Silent fallback
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
