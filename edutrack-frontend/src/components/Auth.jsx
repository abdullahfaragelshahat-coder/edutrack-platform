import React, { useState } from 'react';
import axios from 'axios';

export default function Auth({ onLoginSuccess, onSwitchToStudent }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiBaseUrl = `http://${window.location.hostname}:8000/api/login`;
            const response = await axios.post(apiBaseUrl, {
                email,
                password
            });
            
            // استخراج التوكن سواء كان مباشر أو داخل كائن الـ data
            const token = response.data.token || response.data.data?.token;

            if (token) {
                localStorage.setItem('token', token);
                onLoginSuccess(token);
            } else {
                setError('لم يتم استلام رمز المصادقة من السيرفر');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'بيانات الدخول غير صحيحة');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', padding: '20px', direction: 'rtl' }}>
            <div style={{ background: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔑</div>
                <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>تسجيل الدخول</h2>
                <p style={{ margin: '0 0 25px 0', color: '#64748b', fontSize: '14px' }}>نظام إدارة المنظومة التعليمية EduTrack</p>

                {error && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>البريد الإلكتروني:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="admin@example.com"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>كلمة المرور:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}
                    >
                        {loading ? 'جاري الدخول...' : 'دخول الأدمن'}
                    </button>
                </form>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

                {/* زر دخول الطلاب المباشر والأكيد */}
                <div>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '10px' }}>هل أنت طالب؟</p>
                    <button 
                        type="button"
                        onClick={onSwitchToStudent}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        الدخول إلى بوابة الطلاب 🎓
                    </button>
                </div>
            </div>
        </div>
    );
}