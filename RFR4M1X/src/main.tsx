import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import App from '@/App';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '18px',
              background: '#111111',
              color: '#ffffff',
              boxShadow: '0 18px 50px rgba(10, 10, 10, 0.28)',
            },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
