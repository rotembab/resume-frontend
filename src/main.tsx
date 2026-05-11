import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { BrowserRouter } from 'react-router';
import './lang/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from './components/ui/snackbar/snackbar-provider';
import { DirectionProvider } from './components/ui/direction-provider/direction-provider';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <DirectionProvider>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </DirectionProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
