import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ensureSeedData } from './api/seed.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from './context/ThemeContext';

const queryClient = new QueryClient();

async function prepareApp() {
  // we have to run MSW in both development AND production.
  const { worker } = await import('./mocks/browser.js');
  await worker.start({
    // This is important for Netlify deployment
    onUnhandledRequest: 'bypass',
  });
  
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