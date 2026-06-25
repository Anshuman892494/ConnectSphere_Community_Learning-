import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { ToastProvider } from './contexts/ToastContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}

export default App;
