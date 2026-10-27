import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddGroup() {
    const [groupName, setGroupName] = useState('');
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

    const fetchGroups = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/groups', { headers });
            setGroups(res.data.data);
        } catch (err) {
            console.error('خطأ في جلب المجموعات', err);
        }
    };

    useEffect(() => { fetchGroups(); }, []);

    const handleAddGroup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            const token = localStorage.getItem('token');
            console.log('Using Token:', token); // للتأكد من وجود التوكن

            const res = await axios.post('http://127.0.0.1:8000/api/groups', 
                { name: groupName }, 
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`, 
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    } 
                }
            );

            if (res.data.success) {
                setSuccess('تم إضافة المجموعة بنجاح');
                setGroupName('');
                fetchGroups();
            }
        } catch (err) {
            console.error('API Error:', err.response);
            if (err.response && err.response.data && err.response.data.message) {
                setError('خطأ من السيرفر: ' + err.response.data.message);
            } else {
                setError('حدث خطأ في الاتصال بالسيرفر (تأكد من حالة الـ Token)');
            }
        }
    };
    

    return (
        <div style={{ padding: '20px', direction: 'rtl', maxWidth: '500px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b', textAlign: 'right' }}>
                ➕ إضافة مجموعة جديدة فقط
            </h3>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>❌ {error}</div>}
            {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>✅ {success}</div>}

            <form onSubmit={handleAddGroup}>
                <div style={{ marginBottom: '14px', textAlign: 'right' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>اسم المجموعة / الصف:</label>
                    <input 
                        type="text" 
                        placeholder="مثال: Code 2Bac Group1" 
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required 
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                    حفظ المجموعة
                </button>
            </form>
            <div style={{ marginTop: '15px', fontSize: '13px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>
                المجموعات الحالية ({groups.length}):
            </div>
        </div>
    );
}