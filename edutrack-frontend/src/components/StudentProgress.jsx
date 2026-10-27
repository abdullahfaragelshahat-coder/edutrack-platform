import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentProgress() {
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });

            let studentsList = [];
            if (Array.isArray(response.data)) {
                studentsList = response.data;
            } else if (response.data.students && Array.isArray(response.data.students)) {
                studentsList = response.data.students;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                studentsList = response.data.data;
            }

            setStudents(studentsList);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('فشل في جلب قائمة الطلاب من السيرفر.');
        }
    };

    const handleStudentChange = async (e) => {
        const studentId = e.target.value;
        setSelectedStudentId(studentId);
        setProgressData(null);

        if (!studentId) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}/progress`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setProgressData(response.data);
            } else {
                setError('تعذر تحميل بيانات نشاط الطالب.');
            }
        } catch (err) {
            console.error('Error fetching student progress:', err);
            setError('حدث خطأ أثناء جلب سجل الطالب.');
        } finally {
            setLoading(false);
        }
    };

    const student = progressData?.student;
    const exams = progressData?.exams || [];
    const attendances = progressData?.attendances || [];

    // إحصائيات سريعة
    const totalExams = exams.length;
    const totalScoreSum = exams.reduce((acc, curr) => acc + Number(curr.score ?? curr.pivot?.score ?? 0), 0);
    const totalMaxSum = exams.reduce((acc, curr) => acc + Number(curr.total_marks || 100), 0);
    const overallPercentage = totalMaxSum > 0 ? Math.round((totalScoreSum / totalMaxSum) * 100) : 0;

    const totalAttendances = attendances.length;
    const presentCount = attendances.filter(a => a.status === 'present').length;
    const absentCount = attendances.filter(a => a.status === 'absent').length;
    const lateCount = attendances.filter(a => a.status === 'late').length;
    const attendanceRate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 0;

    return (
        <div style={{ padding: '25px', direction: 'rtl', fontFamily: 'Cairo, sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <div className="progress-report-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* هيدر الصفحة */}
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '22px', fontWeight: '800' }}>
                            📊 التقارير الشاملة ومتابعة النشاط
                        </h2>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>
                            متابعة دقيقة لدرجات الامتحانات، نسب الحضور، والتقييم الأكاديمي للطالب.
                        </p>
                    </div>
                    {student && (
                        <button 
                            onClick={() => window.print()}
                            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            🖨️ طباعة تقرير الطالب
                        </button>
                    )}
                </div>

                {/* صندوق اختيار الطالب (يختفي أثناء الطباعة) */}
                <div className="no-print" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#334155', fontSize: '14px' }}>
                        اختر الطالب المطلوب استعراض سجله:
                    </label>
                    <select 
                        value={selectedStudentId} 
                        onChange={handleStudentChange}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    >
                        <option value="">-- اضغط لاختيار طالب من القائمة ({students.length} متاحين) --</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} | الهاتف: {s.phone || s.parent_phone || 'غير متوفر'}
                            </option>
                        ))}
                    </select>
                </div>

                {error && <div className="no-print" style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px' }}>⚠️ {error}</div>}
                {loading && <div className="no-print" style={{ textAlign: 'center', padding: '30px', color: '#2563eb', fontSize: '15px', fontWeight: 'bold' }}>⏳ جاري تحميل سجل الطالب...</div>}

                {/* كارت معلومات الطالب والإحصائيات */}
                {student && (
                    <>
                        <div style={{ background: '#0f172a', color: '#fff', padding: '25px', borderRadius: '14px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                <div>
                                    <span style={{ background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>ملف طالب نشط</span>
                                    <h2 style={{ margin: '8px 0 4px 0', fontSize: '24px' }}>{student.name}</h2>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>المجموعة الدراسية: <strong style={{ color: '#38bdf8' }}>{student.group?.name || 'غير مسجل في مجموعة'}</strong></p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 18px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>المعدل التراكمي</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' }}>{overallPercentage}%</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 18px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>نسبة الحضور</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>{attendanceRate}%</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', fontSize: '13px', color: '#cbd5e1' }}>
                                <div>📞 <strong>رقم الهاتف:</strong> {student.phone || 'غير متوفر'}</div>
                                <div>🎓 <strong>الصف الدراسي:</strong> {student.grade || student.level || 'الصف العام'}</div>
                                <div>👥 <strong>حالة الحضور:</strong> {presentCount} حضور / {absentCount} غياب / {lateCount} تأخير</div>
                            </div>
                        </div>

                        {/* جدول الامتحانات */}
                        <div style={{ background: '#ffffff', padding: '22px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                <h3 style={{ color: '#0f172a', margin: 0, fontSize: '17px', fontWeight: '700' }}>🎓 سجل درجات الامتحانات والتقييمات الشهري</h3>
                                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>إجمالي الامتحانات: {totalExams}</span>
                            </div>

                            {exams.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '25px', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', fontSize: '14px' }}>
                                    لا توجد درجات امتحانات مسجلة لهذا الطالب حتى الآن.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', color: '#475569' }}>
                                                <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>اسم الامتحان</th>
                                                <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>الدرجة المحصلة</th>
                                                <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>الدرجة النهائية</th>
                                                <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>النسبة المئوية</th>
                                                <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>التقدير</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exams.map((exam, index) => {
                                                const score = Number(exam.score ?? exam.pivot?.score ?? 0);
                                                const total = Number(exam.total_marks || 100);
                                                const percentage = Math.round((score / total) * 100);
                                                let badgeBg = '#dcfce7', badgeColor = '#15803d', gradeText = 'ممتاز';
                                                if (percentage < 50) { badgeBg = '#fee2e2'; badgeColor = '#b91c1c'; gradeText = 'راسب'; }
                                                else if (percentage < 65) { badgeBg = '#fef3c7'; badgeColor = '#b45309'; gradeText = 'مقبول'; }
                                                else if (percentage < 85) { badgeBg = '#dbeafe'; badgeColor = '#1d4ed8'; gradeText = 'جيد جداً'; }

                                                return (
                                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '10px 12px', color: '#334155', fontWeight: '600' }}>{exam.exam_name || exam.title || 'امتحان تقييمي'}</td>
                                                        <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 'bold' }}>{score}</td>
                                                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{total}</td>
                                                        <td style={{ padding: '10px 12px', color: '#2563eb', fontWeight: 'bold' }}>{percentage}%</td>
                                                        <td style={{ padding: '10px 12px' }}>
                                                            <span style={{ background: badgeBg, color: badgeColor, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                                                {gradeText}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* جدول الحضور والغياب */}
                        <div style={{ background: '#ffffff', padding: '22px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                <h3 style={{ color: '#0f172a', margin: 0, fontSize: '17px', fontWeight: '700' }}>📅 سجل الحضور والغياب اليومي</h3>
                                <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>إجمالي الأيام المسجلة: {totalAttendances}</span>
                            </div>

                            {attendances.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '25px', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', fontSize: '14px' }}>
                                    لا توجد سجلات حضور أو غياب مسجلة لهذا الطالب حتى الآن.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', color: '#475569' }}>
                                                <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>التاريخ</th>
                                                <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0' }}>حالة الحضور</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendances.map((att, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '10px 12px', color: '#334155', fontWeight: '600' }}>{att.date}</td>
                                                    <td style={{ padding: '10px 12px' }}>
                                                        {att.status === 'present' && <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>✅ حاضر</span>}
                                                        {att.status === 'late' && <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>⚠️ متأخر</span>}
                                                        {att.status === 'absent' && <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>❌ غائب</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

            </div>

            {/* ستايل الطباعة لمنع ظهور القوائم الجانبية وضبط التقرير */}
            <style>{`
                @media print {
                    @page {
                        size: portrait;
                        margin: 10mm;
                    }
                    body, html {
                        background: #ffffff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    /* إخفاء القائمة الجانبية، الهيدر، وكل عناصر لوحة التحكم الخارجية بالكامل */
                    .no-print, 
                    aside, 
                    header, 
                    .sidebar, 
                    .top-header, 
                    .app-container > aside {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                        overflow: hidden !important;
                    }
                    /* جعل تقرير الطالب يأخذ عرض الصفحة بالكامل وبدون هوامش زائدة */
                    .progress-report-container {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}