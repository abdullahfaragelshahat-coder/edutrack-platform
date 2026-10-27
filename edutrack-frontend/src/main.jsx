import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './App.css';
import axios from 'axios';

// إعداد الـ Axios لتضمين توكن الأدمن تلقائياً مع استثناء مسارات تسجيل الدخول
axios.interceptors.request.use((config) => {
    // عدم إرفاق التوكن مع طلبات تسجيل الدخول لتفادي حظر الـ 401
    if (config.url && config.url.includes('login')) {
        return config;
    }

    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
