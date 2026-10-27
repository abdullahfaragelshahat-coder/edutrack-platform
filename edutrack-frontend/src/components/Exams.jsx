import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Exams() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [examName, setExamName] = useState('');
    const [maxScore, setMaxScore] = useState('100');
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [students, setStudents] = useState([]);
    const [scores, setScores] = useState({});
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    // جلب المجموعات عند التحميل
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/groups', { headers })
            .then(res => setGroups(res.data.data || []))
            .catch(err => console.error('خطأ في جلب المجموعات', err));
    }, []);

    // جلب الطلاب عند اختيار المجموعة
    useEffect(() => {
        if (selectedGroup) {
            axios.get(`http://127.0.0.1:8000/api/students?group_id=${selectedGroup}`, { headers })
                .then(res => {
                    const groupStudents = (res.data.data || []).filter(s => s.group_id == selectedGroup);
                    setStudents(groupStudents);
                })
                .catch(err => console.error('خطأ في جلب الطلاب', err));
        } else {
            setStudents([]);
        }
    }, [selectedGroup]);

    const handleScoreChange = (studentId, value) => {
        setScores(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSaveExams = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedGroup || !examName) {
            setError('يرجى اختيار المجموعة وتحديد عنوان الامتحان');
            return;
        }

        try {
            const payload = {
                group_id: selectedGroup,
                title: examName,
                max_score: maxScore,
                date: examDate,
                scores: Object.keys(scores).map(studentId => ({
                    student_id: studentId,
                    score: scores[studentId]
                }))
            };

            await axios.post('http://127.0.0.1:8000/api/exams', payload, { headers });
            setSuccess('تم حفظ درجات الامتحان بنجاح');
            setExamName('');
            setScores({});
        } catch (err) {
            console.error('Exams Error:', err);
            setError('حدث خطأ أثناء حفظ درجات الامتحانات');
        }
    };

    return (
        <div style={{ padding: '24px', direction: 'rtl', maxWidth: '850px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', textAlign: 'right' }}>
                🎓 قسم الامتحانات ورصد الدرجات
            </h2>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>❌ {error}</div>}
            {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>✅ {success}</div>}

            {/* إعدادات الامتحان */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ textAlign: 'right' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>المجموعة:</label>
                    <select 
                        value={selectedGroup} 
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', outline: 'none' }}
                    >
                        <option value="">-- اختر المجموعة --</option>
                        {groups.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>عنوان الامتحان:</label>
                    <input 
                        type="text" 
                        placeholder="مثال: امتحان الشهر الأول" 
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ textAlign: 'right' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>الدرجة النهائية:</label>
                    <input 
                        type="number" 
                        value={maxScore}
                        onChange={(e) => setMaxScore(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ textAlign: 'right' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>التاريخ:</label>
                    <input 
                        type="date" 
                        value={examDate} 
                        onChange={(e) => setExamDate(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
            </div>

            {/* جدول رصد درجات الطلاب */}
            {selectedGroup && (
                <form onSubmit={handleSaveExams}>
                    {students.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                            ⚠️ لا يوجد طلاب مسجلين في هذه المجموعة لرصد درجاتهم.
                        </div>
                    ) : (
                        <div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'right' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9', color: '#334155', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold' }}>اسم الطالب</th>
                                        <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>الدرجة المستحقة (من {maxScore})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                                👤 {student.name}
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    placeholder="0"
                                                    value={scores[student.id] || ''}
                                                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                                    style={{ width: '120px', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center', fontSize: '14px', outline: 'none' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button 
                                type="submit" 
                                style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                            >
                                💾 حفظ ورصد درجات الامتحان
                            </button>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}