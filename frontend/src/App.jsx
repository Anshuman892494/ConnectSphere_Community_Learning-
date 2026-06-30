import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </LanguageProvider>
      </ToastProvider>
    </Provider>
  );
}

export default App;
