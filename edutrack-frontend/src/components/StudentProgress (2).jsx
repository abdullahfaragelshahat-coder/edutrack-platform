import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentProgress() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    // جلب قائمة الطلاب عند التحميل
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/students', { headers })
            .then(res => {
                setStudents(res.data.data || []);
            })
            .catch(err => {
                console.error('خطأ في جلب الطلاب', err);
                setError('تعذر تحميل قائمة الطلاب');
            });
    }, []);

    return (
        <div style={{ padding: '24px', direction: 'rtl', maxWidth: '850px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', textAlign: 'right' }}>
                📈 متابعة نشاط وتقييم كل طالب (Student Progress)
            </h2>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>❌ {error}</div>}

            {/* صندوق اختيار الطالب */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569', textAlign: 'right' }}>
                    اختر الطالب لعرض سجله التقني والدراسي:
                </label>
                
                <select 
                    value={selectedStudent} 
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '8px', 
                        fontSize: '14px', 
                        background: '#fff', 
                        outline: 'none',
                        direction: 'rtl',
                        textAlign: 'right'
                    }}
                >
                    <option value="">-- اختر الطالب من القائمة --</option>
                    {students.map((student) => (
                        <option key={student.id} value={student.id}>
                            {student.name} {student.phone ? `- (${student.phone})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* منطقة عرض تفاصيل نشاط الطالب (تظهر عند اختيار طالب) */}
            {selectedStudent ? (
                <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '10px', textAlign: 'center', color: '#334155' }}>
                    <p style={{ fontSize: '15px', fontWeight: 'bold' }}>📊 جارٍ استعراض سجل الحضور والدرجات للطالب المحدد...</p>
                    {/* يمكنك إضافة تفاصيل الحضور والامتحانات الخاصة بالطالب هنا لاحقاً */}
                </div>
            ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    الرجاء اختيار طالب من القائمة أعلاه لعرض تقييمه ونشاطه بالتفصيل.
                </div>
            )}
        </div>
    );
}