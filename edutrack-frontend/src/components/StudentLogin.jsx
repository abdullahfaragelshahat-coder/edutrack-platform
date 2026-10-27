import React, { useState } from 'react';
import axios from 'axios';

export default function StudentLogin({ onLoginSuccess }) {
    const [phone, setPhone] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiBaseUrl = `http://${window.location.hostname}:8000/api/student/login`;
            const response = await axios.post(apiBaseUrl, { 
                phone, 
                pin_code: pinCode 
            });
            
            if (response.data.success) {
                localStorage.setItem('student_data', JSON.stringify(response.data.student));
                localStorage.setItem('student_lessons', JSON.stringify(response.data.lessons));
                
                onLoginSuccess(response.data.student, response.data.lessons);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'خطأ في بيانات الدخول، تأكد من الرقم والرقم السري');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f6f9' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'right', direction: 'rtl' }}>
                <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>بوابة الطالب التعليمية 🎓</h2>
                
                {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
                
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>رقم الهاتف الشخصي</label>
                        <input 
                            type="text" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            placeholder="أدخل رقم هاتفك..." 
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>الرقم السري (PIN)</label>
                        <input 
                            type="password" 
                            value={pinCode} 
                            onChange={(e) => setPinCode(e.target.value)} 
                            placeholder="أدخل الرقم السري..." 
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {loading ? 'جاري التحقق...' : 'دخول إلى صفحتي'}
                    </button>
                </form>
            </div>
        </div>
    );
}