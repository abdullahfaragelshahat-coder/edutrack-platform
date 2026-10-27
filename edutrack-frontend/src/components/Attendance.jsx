import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Attendance() {
    const [activeTab, setActiveTab] = useState('record'); // 'record' أو 'report'
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [students, setStudents] = useState([]);
    
    // حالات التسجيل اليومي
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    
    // حالات التقرير والفترة الزمنية
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]); // أول الشهر
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // اليوم
    const [reportData, setReportData] = useState([]);
    const [totalReportSessions, setTotalReportSessions] = useState(0);

    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [message, setMessage] = useState({ type: '', text: '' });

    const getToken = () => {
        return localStorage.getItem('token') || 
               localStorage.getItem('access_token') || 
               localStorage.getItem('user_token') || '';
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoadingGroups(true);
        try {
            const token = getToken();
            const response = await axios.get('http://127.0.0.1:8000/api/groups', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });

            let groupList = [];
            if (Array.isArray(response.data)) {
                groupList = response.data;
            } else if (response.data.groups && Array.isArray(response.data.groups)) {
                groupList = response.data.groups;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                groupList = response.data.data;
            }

            setGroups(groupList);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setMessage({ type: 'error', text: '❌ فشل في جلب المجموعات.' });
        } finally {
            setLoadingGroups(false);
        }
    };

    // جلب الطلاب للتسجيل اليومي
    const handleGroupChange = async (e) => {
        const groupId = e.target.value;
        setSelectedGroup(groupId);
        setStudents([]);
        setAttendanceData({});
        setMessage({ type: '', text: '' });

        if (!groupId) return;

        setLoadingStudents(true);
        try {
            const token = getToken();
            const response = await axios.get(`http://127.0.0.1:8000/api/students?group_id=${groupId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });

            let allStudents = [];
            if (Array.isArray(response.data)) {
                allStudents = response.data;
            } else if (response.data.students && Array.isArray(response.data.students)) {
                allStudents = response.data.students;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                allStudents = response.data.data;
            }

            setStudents(allStudents);

            const initialAttendance = {};
            allStudents.forEach(s => {
                initialAttendance[s.id] = 'present';
            });
            setAttendanceData(initialAttendance);
        } catch (err) {
            console.error('Error fetching students:', err);
            setMessage({ type: 'error', text: '❌ فشل في جلب قائمة الطلاب.' });
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    // حفظ الحضور اليومي
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGroup) return;

        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = getToken();
            const formattedAttendances = Object.keys(attendanceData).map(studentId => ({
                student_id: Number(studentId),
                status: attendanceData[studentId]
            }));

            const payload = {
                group_id: Number(selectedGroup),
                date: attendanceDate,
                attendances: formattedAttendances
            };

            const response = await axios.post('http://127.0.0.1:8000/api/attendances', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.status === 200 || response.status === 201) {
                setMessage({ type: 'success', text: '✅ تم حفظ سجل الحضور والغياب بنجاح!' });
            }
        } catch (err) {
            console.error('Attendance Save Error:', err);
            setMessage({ type: 'error', text: '❌ حدث خطأ أثناء الحفظ.' });
        } finally {
            setSubmitting(false);
        }
    };

    // جلب تقرير النسب والحضور بالفترة الزمنية
    const fetchReport = async () => {
        if (!selectedGroup) {
            setMessage({ type: 'warning', text: '⚠️ يرجى اختيار المجموعة أولاً لعرض التقرير.' });
            return;
        }

        setLoadingReport(true);
        setMessage({ type: '', text: '' });
        try {
            const token = getToken();
            const response = await axios.get(`http://127.0.0.1:8000/api/attendances/report?group_id=${selectedGroup}&start_date=${startDate}&end_date=${endDate}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });

            if (response.data.success) {
                setReportData(response.data.data || []);
                setTotalReportSessions(response.data.total_sessions || 0);
            }
        } catch (err) {
            console.error('Report Fetch Error:', err);
            setMessage({ type: 'error', text: '❌ فشل في جلب تقرير الحضور.' });
        } finally {
            setLoadingReport(false);
        }
    };

    return (
        <div style={{ padding: '25px', direction: 'rtl', fontFamily: 'Cairo, sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <div style={{ maxWidth: '950px', margin: '0 auto' }}>
                
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '22px', fontWeight: '800' }}>
                            📝 إدارة الحضور والغياب والتقارير
                        </h2>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>
                            تسجيل الحضور اليومي واستخراج نسب حضور الطلاب بدقة.
                        </p>
                    </div>

                    {/* أزرار التنقل بين التبويبات */}
                    <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
                        <button 
                            onClick={() => setActiveTab('record')}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'record' ? '#2563eb' : 'transparent', color: activeTab === 'record' ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                        >
                            تسجيل الحضور اليومي
                        </button>
                        <button 
                            onClick={() => { setActiveTab('report'); if(selectedGroup) fetchReport(); }}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'report' ? '#2563eb' : 'transparent', color: activeTab === 'report' ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                        >
                            تقرير النسب والفترات
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        background: message.type === 'success' ? '#dcfce7' : message.type === 'warning' ? '#fef3c7' : '#fee2e2',
                        color: message.type === 'success' ? '#15803d' : message.type === 'warning' ? '#b45309' : '#b91c1c',
                        border: `1px solid ${message.type === 'success' ? '#86efac' : message.type === 'warning' ? '#fde047' : '#fca5a5'}`
                    }}>
                        {message.text}
                    </div>
                )}

                {/* اختيار المجموعة المشترك */}
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#334155', fontSize: '14px' }}>
                                اختر المجموعة:
                            </label>
                            <select 
                                value={selectedGroup} 
                                onChange={(e) => {
                                    handleGroupChange(e);
                                    if(activeTab === 'report' && e.target.value) {
                                        setTimeout(fetchReport, 100);
                                    }
                                }}
                                disabled={loadingGroups}
                                style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none' }}
                            >
                                <option value="">{loadingGroups ? 'جاري التحميل...' : '-- اختر مجموعة --'}</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        {activeTab === 'record' ? (
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#334155', fontSize: '14px' }}>
                                    تاريخ الحضور:
                                </label>
                                <input 
                                    type="date" 
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none' }}
                                />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px', gridColumn: 'span 2' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#334155', fontSize: '14px' }}>من تاريخ:</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#334155', fontSize: '14px' }}>إلى تاريخ:</label>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button 
                                        onClick={fetchReport}
                                        style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                                    >
                                        بحث التقرير
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* المحتوى حسب التبويب النشط */}
                {activeTab === 'record' ? (
                    selectedGroup && (
                        <form onSubmit={handleSubmit} style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                            {loadingStudents ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#2563eb', fontWeight: 'bold' }}>⏳ جاري جلب قائمة الطلاب...</div>
                            ) : students.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '14px' }}>لا يوجد طلاب مسجلين في هذه المجموعة.</div>
                            ) : (
                                <>
                                    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                                            <thead>
                                                <tr style={{ background: '#f8fafc', color: '#475569' }}>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>اسم الطالب</th>
                                                    <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>الحالة</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map((student) => (
                                                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px', color: '#1e293b', fontWeight: '600' }}>👤 {student.name}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <div style={{ display: 'inline-flex', gap: '15px', background: '#f8fafc', padding: '6px 15px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                                <label style={{ cursor: 'pointer', color: '#15803d', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <input type="radio" name={`status-${student.id}`} value="present" checked={attendanceData[student.id] === 'present'} onChange={() => handleStatusChange(student.id, 'present')} /> حاضر
                                                                </label>
                                                                <label style={{ cursor: 'pointer', color: '#b91c1c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <input type="radio" name={`status-${student.id}`} value="absent" checked={attendanceData[student.id] === 'absent'} onChange={() => handleStatusChange(student.id, 'absent')} /> غائب
                                                                </label>
                                                                <label style={{ cursor: 'pointer', color: '#b45309', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <input type="radio" name={`status-${student.id}`} value="late" checked={attendanceData[student.id] === 'late'} onChange={() => handleStatusChange(student.id, 'late')} /> متأخر
                                                                </label>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        style={{ width: '100%', background: submitting ? '#94a3b8' : '#2563eb', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer' }}
                                    >
                                        {submitting ? '⏳ جاري الحفظ...' : '💾 حفظ سجل الحضور'}
                                    </button>
                                </>
                            )}
                        </form>
                    )
                ) : (
                    /* تَبويب تقرير النسب والفترات */
                    <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                                📊 تقرير نسب الحضور خلال الفترة (إجمالي الحصص المسجلة: <span style={{ color: '#2563eb' }}>{totalReportSessions}</span> حصة)
                            </h3>
                        </div>

                        {loadingReport ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#2563eb', fontWeight: 'bold' }}>⏳ جاري احتساب التقرير والنسب...</div>
                        ) : reportData.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '14px' }}>لا توجد بيانات حضور مسجلة لهذه المجموعة في هذه الفترة.</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', color: '#475569' }}>
                                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>اسم الطالب</th>
                                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>عدد مرات الحضور</th>
                                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>عدد مرات الغياب</th>
                                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>النسبة والشكل (من إجمالي الحصص)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((row) => (
                                            <tr key={row.student_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px', color: '#1e293b', fontWeight: '600' }}>👤 {row.student_name}</td>
                                                <td style={{ padding: '12px', textAlign: 'center', color: '#15803d', fontWeight: 'bold' }}>{row.present_count} حصص</td>
                                                <td style={{ padding: '12px', textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>{row.absent_count} حصص</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                        <span style={{ fontWeight: '800', color: row.percentage >= 75 ? '#15803d' : row.percentage >= 50 ? '#b45309' : '#b91c1c' }}>
                                                            حاضر {row.present_count} من {row.total_sessions} ({row.percentage}%)
                                                        </span>
                                                    </div>
                                                    <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${row.percentage}%`, background: row.percentage >= 75 ? '#22c55e' : row.percentage >= 50 ? '#f59e0b' : '#ef4444', height: '100%', transition: 'width 0.3s ease' }}></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}