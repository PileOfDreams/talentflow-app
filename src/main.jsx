// Entry point for our app

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ensureSeedData } from './api/seed.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from './context/ThemeContext';

const queryClient = new QueryClient();

async function prepareApp() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser.js');
    await worker.start();
  }
  await ensureSeedData();
}

prepareApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
});