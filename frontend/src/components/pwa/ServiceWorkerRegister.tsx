'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Gbairai Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Gbairai Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}

