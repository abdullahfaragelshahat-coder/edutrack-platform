import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentCard({ studentId, onClose }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

    useEffect(() => {
        if (studentId) {
            fetchStudentReport();
        }
    }, [studentId]);

    const fetchStudentReport = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}/report`, { headers });
            setReport(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, color: '#fff', fontWeight: 'bold' }}>⏳ جاري تحميل كارت الطالب...</div>;
    if (!report) return null;

    const { student, attendance, academic } = report;

    // صورة التخلف في حالة عدم رفع صورة
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    const studentImageUrl = student.image ? `http://127.0.0.1:8000/storage/${student.image}` : defaultAvatar;

    return (
        <div style={{ background: 'rgba(0,0,0,0.6)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                
                {/* أزرار التحكم بالطباعة والإغلاق */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }} className="no-print">
                    <button onClick={handlePrint} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        🖨️ طباعة كارت الطالب
                    </button>
                    <button onClick={onClose} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ✖ إغلاق
                    </button>
                </div>

                {/* تصميم الكارت المطبوع */}
                <div style={{ border: '2px solid #2563eb', padding: '20px', borderRadius: '12px', background: '#fafafa' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '12px', marginBottom: '16px' }}>
                        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '22px' }}>🎓 كارت متابعة طالب - EduTrack</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>بطاقة الأداء الأكاديمي الشاملة</p>
                    </div>

                    {/* الصورة الشخصية والبيانات الأساسية */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', background: '#eff6ff', padding: '14px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                        <img 
                            src={studentImageUrl} 
                            alt={student.name} 
                            style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb', background: '#fff' }} 
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', fontSize: '14px' }}>
                            <div><strong>اسم الطالب:</strong> {student.name}</div>
                            <div><strong>المجموعة:</strong> {student.group?.name || 'عام'}</div>
                            <div><strong>رقم ولي الأمر:</strong> {student.parent_phone || 'غير مسجل'}</div>
                            <div><strong>التقدير العام:</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{academic.rating}</span></div>
                        </div>
                    </div>

                    {/* سجل الحضور والغياب */}
                    <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '8px' }}>📝 سجل الحضور والغياب:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '6px', color: '#15803d', fontWeight: 'bold' }}>حضور: {attendance.present_days} أيام</div>
                        <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '6px', color: '#b91c1c', fontWeight: 'bold' }}>غياب: {attendance.absent_days} أيام</div>
                        <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '6px', color: '#0369a1', fontWeight: 'bold' }}>النسبة: {attendance.percentage}</div>
                    </div>

                    {/* التقدير النهائي */}
                    <div style={{ textAlign: 'center', background: '#f8fafc', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>
                        المعدل الأكاديمي الإجمالي: <span style={{ color: '#2563eb' }}>{academic.overall_percentage}</span> — التقدير النهائي: <span style={{ color: '#16a34a' }}>{academic.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}