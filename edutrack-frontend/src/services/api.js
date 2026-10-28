import axios from 'axios';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_BASE_URL + '/api'
// أو

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// إضافة الـ Token تلقائياً لأي طلب لو كان المستخدم عامل Login
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;