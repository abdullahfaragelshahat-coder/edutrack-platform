import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddStudent() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [groupId, setGroupId] = useState('');
    const [grade, setGrade] = useState('');
    const [pin, setPin] = useState(''); // حالة الرقم السري للطالب
    const [image, setImage] = useState(null); // حالة ملف الصورة
    const [imagePreview, setImagePreview] = useState(null); // معاينة الصورة قبل الرفع
    const [groups, setGroups] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/groups', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            setGroups(res.data.data || []);
        } catch (err) {
            console.error('Error fetching groups:', err);
        }
    };

    // المعاينة المباشرة عند اختيار الصورة
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !groupId || !pin) {
            setError('يرجى إدخال اسم الطالب، المجموعة الدراسية، والرقم السري (PIN)');
            return;
        }

        try {
            setLoading(true);

            // استخدام FormData لرفع الملفات مع البيانات
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phone', phone);
            formData.append('parent_phone', parentPhone);
            formData.append('group_id', groupId);
            formData.append('grade', grade);
            formData.append('pin', pin); // إضافة الرقم السري للطلب
            if (image) {
                formData.append('image', image);
            }

            await axios.post('http://127.0.0.1:8000/api/students', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            });

            setSuccess('تم إضافة الطالب وصورته وبياناته بنجاح!');
            setName('');
            setPhone('');
            setParentPhone('');
            setGroupId('');
            setGrade('');
            setPin('');
            setImage(null);
            setImagePreview(null);
        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء حفظ بيانات الطالب.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', direction: 'rtl', maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', fontFamily: 'Cairo, sans-serif' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', textAlign: 'right' }}>
                👤 إضافة طالب جديد وصورته الشخصية
            </h2>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>❌ {error}</div>}
            {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>✅ {success}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* حقل اختيار وترع الصورة الشخصية */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>الصورة الشخصية للطالب:</label>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                        <img 
                            src={imagePreview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                            alt="معاينة" 
                            style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
                        />
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            style={{ fontSize: '13px' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>اسم الطالب الكامل:</label>
                    <input type="text" placeholder="مثال: أحمد محمد علي" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>رقم هاتف الطالب:</label>
                    <input type="text" placeholder="مثال: 01012345678" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                {/* حقل الرقم السري (PIN) للطالب */}
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#16a34a' }}>🔑 الرقم السري للطالب (PIN):</label>
                    <input type="text" placeholder="مثال: 1234" value={pin} onChange={(e) => setPin(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #86efac', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#f0fdf4' }} required />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#2563eb' }}>👨‍👦 رقم هاتف ولي الأمر:</label>
                    <input type="text" placeholder="مثال: 01112345678" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #93c5fd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: '#eff6ff' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>المجموعة الدراسية:</label>
                    <select value={groupId} onChange={(e) => setGroupId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff' }}>
                        <option value="">-- اختر المجموعة --</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>الصف الدراسي / السنة:</label>
                    <input type="text" placeholder="مثال: الصف الثاني الثانوي" value={grade} onChange={(e) => setGrade(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>
                    {loading ? '⏳ جاري الحفظ والتسجيل...' : '➕ حفظ الطالب وصورته'}
                </button>
            </form>
        </div>
    );
}