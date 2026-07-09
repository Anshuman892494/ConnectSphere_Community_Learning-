import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AppRoutes from './routes/AppRoutes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  // Using a fallback so the app doesn't crash if env is missing
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={clientId}>
        <Provider store={store}>
          <ToastProvider>
            <LanguageProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </LanguageProvider>
          </ToastProvider>
        </Provider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
