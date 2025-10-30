import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import { Toaster } from 'react-hot-toast';
import axiosInstance from './api/axiosInstance.js';
import './i18n';
import { Suspense } from 'react';
import { logout } from './features/auth/authSlice';

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Interceptor: 401 Unauthorized detected. Logging out...');

      store.dispatch(logout());

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback="Loading...">
        <App />
      </Suspense>
      <Toaster position="top-right" />
    </Provider>
  </React.StrictMode>,
);

