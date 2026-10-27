import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentCard from './StudentCard';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // حالات التعديل
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editParentPhone, setEditParentPhone] = useState('');
    const [editPin, setEditPin] = useState(''); // حالة تعديل الرقم السري
    const [editImage, setEditImage] = useState(null); // صورة التعديل الجديدة

    // حالة عرض كارت الطالب
    const [selectedCardStudentId, setSelectedCardStudentId] = useState(null);

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://127.0.0.1:8000/api/students', { headers });
            setStudents(res.data.students || res.data.data || []);
        } catch (err) {
            console.error(err);
            setError('فشل في جلب قائمة الطلاب.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/students/${id}`, { headers });
            setSuccess('تم حذف الطالب بنجاح');
            setStudents(students.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء حذف الطالب.');
        }
    };

    const startEditing = (student) => {
        setEditingId(student.id);
        setEditName(student.name);
        setEditPhone(student.phone || '');
        setEditParentPhone(student.parent_phone || '');
        setEditPin(student.pin || ''); // تعيين قيمة الـ PIN عند بدء التعديل
        setEditImage(null);
    };

    // حفظ التحديث مع الصورة والـ PIN الجديد باستخدام FormData
    const handleUpdate = async (id, groupId) => {
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT'); // مهم جداً لتحديث الملفات في لارايفل
            formData.append('name', editName);
            formData.append('phone', editPhone);
            formData.append('parent_phone', editParentPhone);
            formData.append('pin', editPin); // إرسال الـ PIN المحدث
            formData.append('group_id', groupId);
            
            if (editImage) {
                formData.append('image', editImage);
            }

            await axios.post(`http://127.0.0.1:8000/api/students/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            });

            setSuccess('تم تحديث بيانات الطالب وصورته بنجاح');
            setEditingId(null);
            setEditImage(null);
            fetchStudents();
        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء تحديث بيانات الطالب.');
        }
    };

    // دالة إرسال التقرير عبر الواتساب المباشر لولي الأمر
    const sendWhatsAppReport = (student) => {
        if (!student.parent_phone) {
            alert('لا يوجد رقم ولي أمر مسجل لهذا الطالب!');
            return;
        }

        let phone = student.parent_phone.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
            phone = '20' + phone.substring(1);
        }

        const message = `مرحباً ولي أمر الطالب: ${student.name} 💐
نود إحاطتكم علماً بتقرير متابعة الطالب لدى منصة EduTrack التعليمية:
- المجموعة الدراسية: ${student.group?.name || 'عام'}
- حالة الحضور والتقييم: ممتاز ✅

شاكرين لكم حسن تعاونكم ومتابعتكم المستمرة!`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    };

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    return (
        <div style={{ padding: '24px', direction: 'rtl', maxWidth: '1250px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', fontFamily: 'Cairo, sans-serif' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', textAlign: 'right' }}>
                👥 عرض وإدارة الطلاب وتحديث الصور والتقارير
            </h2>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>❌ {error}</div>}
            {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>✅ {success}</div>}

            {loading && <div style={{ textAlign: 'center', padding: '30px', color: '#2563eb', fontWeight: 'bold' }}>⏳ جاري تحميل قائمة الطلاب...</div>}

            {!loading && students.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>لا يوجد طلاب مسجلين حتى الآن.</div>}

            {!loading && students.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', color: '#475569' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>الصورة</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>اسم الطالب</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>هاتف الطالب</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>الرقم السري (PIN)</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>رقم ولي الأمر</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>المجموعة</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>التحكم والتقارير</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => {
                                const studentImg = s.image ? `http://127.0.0.1:8000/storage/${s.image}` : defaultAvatar;
                                return (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        
                                        {/* صورة الطالب */}
                                        <td style={{ padding: '10px' }}>
                                            {editingId === s.id ? (
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={(e) => setEditImage(e.target.files[0])} 
                                                    style={{ fontSize: '11px', width: '120px' }} 
                                                />
                                            ) : (
                                                <img src={studentImg} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                                            )}
                                        </td>

                                        {/* اسم الطالب */}
                                        <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>
                                            {editingId === s.id ? (
                                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '6px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                            ) : (
                                                s.name
                                            )}
                                        </td>

                                        {/* هاتف الطالب */}
                                        <td style={{ padding: '12px', color: '#64748b' }}>
                                            {editingId === s.id ? (
                                                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={{ padding: '6px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                            ) : (
                                                s.phone || 'غير مسجل'
                                            )}
                                        </td>

                                        {/* الرقم السري (PIN) */}
                                        <td style={{ padding: '12px', color: '#16a34a', fontWeight: 'bold' }}>
                                            {editingId === s.id ? (
                                                <input type="text" value={editPin} onChange={(e) => setEditPin(e.target.value)} placeholder="PIN" style={{ padding: '6px', width: '100%', border: '1px solid #86efac', borderRadius: '6px', background: '#f0fdf4' }} />
                                            ) : (
                                                s.pin ? `🔑 ${s.pin}` : <span style={{ color: '#dc2626' }}>غير مسجل</span>
                                            )}
                                        </td>

                                        {/* ولي الأمر */}
                                        <td style={{ padding: '12px', color: '#2563eb', fontWeight: 'bold' }}>
                                            {editingId === s.id ? (
                                                <input type="text" value={editParentPhone} onChange={(e) => setEditParentPhone(e.target.value)} style={{ padding: '6px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                            ) : (
                                                s.parent_phone ? `👨‍👦 ${s.parent_phone}` : 'غير مسجل'
                                            )}
                                        </td>

                                        <td style={{ padding: '12px', color: '#475569' }}>📂 {s.group?.name || 'عام'}</td>

                                        {/* أزرار التحكم */}
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {editingId === s.id ? (
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button onClick={() => handleUpdate(s.id, s.group_id)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ</button>
                                                    <button onClick={() => setEditingId(null)} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>إلغاء</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    <button onClick={() => sendWhatsAppReport(s)} style={{ background: '#25d366', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>💬 واتساب</button>
                                                    <button onClick={() => setSelectedCardStudentId(s.id)} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🪪 الكارت</button>
                                                    <button onClick={() => startEditing(s)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>✏️ تعديل</button>
                                                    <button onClick={() => handleDelete(s.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>🗑️ حذف</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedCardStudentId && (
                <StudentCard studentId={selectedCardStudentId} onClose={() => setSelectedCardStudentId(null)} />
            )}
        </div>
    );
}