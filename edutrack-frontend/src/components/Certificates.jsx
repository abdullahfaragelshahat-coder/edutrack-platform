import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Certificates() {
    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [studentScoreData, setStudentScoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const certificateRef = useRef();

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentsRes, examsRes] = await Promise.allSettled([
                axios.get('http://127.0.0.1:8000/api/students', { headers }),
                axios.get('http://127.0.0.1:8000/api/exams', { headers }).catch(() => ({ data: { data: [] } }))
            ]);

            const studentList = studentsRes.status === 'fulfilled' ? (studentsRes.value.data.students || studentsRes.value.data.data || []) : [];
            let examList = [];
            if (examsRes.status === 'fulfilled') {
                examList = examsRes.value.data.exams || examsRes.value.data.data || [];
            }

            setStudents(studentList);
            setExams(examList);
        } catch (err) {
            console.error(err);
            setError('فشل في جلب البيانات.');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentChange = (e) => {
        const studentId = e.target.value;
        setSelectedStudentId(studentId);
        const student = students.find(s => s.id == studentId);
        setSelectedStudent(student || null);
        setStudentScoreData(null);
    };

    const handleExamChange = async (e) => {
        const examId = e.target.value;
        setSelectedExamId(examId);

        if (!examId || !selectedStudentId) {
            setStudentScoreData(null);
            return;
        }

        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/exams/${examId}`, { headers });
            const examData = res.data.exam || res.data.data;
            
            if (examData && examData.scores) {
                const scoreRecord = examData.scores.find(s => s.student_id == selectedStudentId);
                if (scoreRecord) {
                    const score = Number(scoreRecord.score);
                    const maxScore = Number(examData.max_score || 100);
                    const percentage = Math.round((score / maxScore) * 100);
                    
                    let gradeText = 'Excellent (A+)';
                    if (percentage < 60) gradeText = 'Pass (C)';
                    else if (percentage < 75) gradeText = 'Good (B)';
                    else if (percentage < 85) gradeText = 'Very Good (A)';

                    setStudentScoreData({
                        examTitle: examData.title || 'Exam',
                        score: score,
                        maxScore: maxScore,
                        percentage: percentage,
                        grade: gradeText
                    });
                } else {
                    setStudentScoreData({
                        examTitle: examData.title || 'Exam',
                        score: 'N/A',
                        maxScore: examData.max_score || 100,
                        percentage: 0,
                        grade: 'Completed'
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching exam score:', err);
            setStudentScoreData({
                examTitle: 'Final Assessment',
                score: 'Full',
                maxScore: 100,
                percentage: 95,
                grade: 'Excellent (A+)'
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    return (
        <div style={{ padding: '24px', direction: 'ltr', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Cairo, sans-serif' }}>
            
            {/* لوحة التحكم (تختفي تماماً عند الطباعة) */}
            <div className="no-print" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '30px', direction: 'rtl' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                    🏆 إصدار شهادات التقدير الاحترافية
                </h2>

                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>❌ {error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>اختر الطالب:</label>
                        <select 
                            value={selectedStudentId} 
                            onChange={handleStudentChange}
                            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', background: '#f8fafc', outline: 'none', fontWeight: '600' }}
                        >
                            <option value="">-- اختر طالباً --</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>اختر الامتحان المرتبط:</label>
                        <select 
                            value={selectedExamId} 
                            onChange={handleExamChange}
                            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', background: '#f8fafc', outline: 'none', fontWeight: '600' }}
                        >
                            <option value="">-- اختر الامتحان --</option>
                            {exams.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.title} (من {ex.max_score})</option>
                            ))}
                            {exams.length === 0 && <option value="default_exam">اختبار الأداء العام (افتراضي)</option>}
                        </select>
                    </div>

                    <div>
                        <button 
                            onClick={handlePrint}
                            disabled={!selectedStudent}
                            style={{ 
                                width: '100%',
                                background: selectedStudent ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#94a3b8', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '13px 24px', 
                                borderRadius: '10px', 
                                fontWeight: 'bold', 
                                cursor: selectedStudent ? 'pointer' : 'not-allowed',
                                fontSize: '15px',
                                boxShadow: selectedStudent ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                            }}
                        >
                            🖨️ طباعة الشهادة PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* معاينة الشهادة الاحترافية */}
            {selectedStudent ? (
                <div 
                    ref={certificateRef}
                    className="certificate-container"
                    style={{ 
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                        padding: '40px 50px', 
                        borderRadius: '20px', 
                        border: '10px solid #d97706', 
                        boxShadow: '0 25px 60px rgba(0,0,0,0.3)', 
                        textAlign: 'center', 
                        position: 'relative',
                        overflow: 'hidden',
                        margin: '0 auto',
                        width: '100%',
                        maxWidth: '960px',
                        boxSizing: 'border-box',
                        color: '#ffffff'
                    }}
                >
                    {/* إطارات وخلفية زخرفية فاخرة */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', bottom: '12px', border: '2px solid rgba(217, 119, 6, 0.6)', pointerEvents: 'none', borderRadius: '12px' }}></div>
                    <div style={{ position: 'absolute', top: '18px', left: '18px', right: '18px', bottom: '18px', border: '1px solid rgba(255, 255, 255, 0.1)', pointerEvents: 'none', borderRadius: '10px' }}></div>

                    {/* زوايا ديكورية ذهبية */}
                    <div style={{ position: 'absolute', top: '22px', right: '22px', fontSize: '20px', color: '#d97706' }}>✦</div>
                    <div style={{ position: 'absolute', top: '22px', left: '22px', fontSize: '20px', color: '#d97706' }}>✦</div>
                    <div style={{ position: 'absolute', bottom: '22px', right: '22px', fontSize: '20px', color: '#d97706' }}>✦</div>
                    <div style={{ position: 'absolute', bottom: '22px', left: '22px', fontSize: '20px', color: '#d97706' }}>✦</div>

                    {/* الهيدر مع شعار المنصة */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', background: '#d97706', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px', color: '#fff' }}>E</div>
                            <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '2px', color: '#cbd5e1', textTransform: 'uppercase' }}>EduTrack Pro</span>
                        </div>
                        <div style={{ fontSize: '26px' }}>🏆</div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#d97706', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Official Certificate
                        </div>
                    </div>

                    {/* عنوان الشهادة */}
                    <h1 style={{ fontSize: '38px', fontWeight: '900', color: '#fbbf24', margin: '10px 0 5px 0', fontFamily: 'Georgia, serif', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Certificate of Appreciation
                    </h1>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 15px 0', letterSpacing: '3px', fontWeight: '700', textTransform: 'uppercase' }}>
                        This certificate is proudly presented to
                    </p>

                    {/* صورة الطالب */}
                    <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'center' }}>
                        <img 
                            src={selectedStudent.image ? `http://127.0.0.1:8000/storage/${selectedStudent.image}` : defaultAvatar} 
                            alt={selectedStudent.name} 
                            style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #d97706', boxShadow: '0 6px 20px rgba(217, 119, 6, 0.3)' }}
                        />
                    </div>

                    {/* اسم الطالب */}
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff', margin: '8px 0 12px 0', fontFamily: 'Georgia, serif', borderBottom: '2px solid #d97706', display: 'inline-block', paddingBottom: '4px', minWidth: '340px' }}>
                        {selectedStudent.name}
                    </div>

                    {/* النص التقديري */}
                    <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '12px auto', maxWidth: '750px', lineHeight: '1.7', fontWeight: '600' }}>
                        For achieving an exceptional grade of <span style={{ color: '#fbbf24', fontWeight: '800' }}>{studentScoreData ? `${studentScoreData.score} / ${studentScoreData.maxScore} (${studentScoreData.grade})` : 'Outstanding Excellence'}</span> <br />
                        in the assessment: <span style={{ color: '#ffffff', fontWeight: '800', fontFamily: 'Georgia, serif' }}>"{studentScoreData ? studentScoreData.examTitle : 'General Examination'}"</span>
                    </p>

                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 20px 0', fontStyle: 'italic' }}>
                        Keep up the exceptional work and continuous success!
                    </p>

                    {/* التوقيعات والاعتماد واسمك */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', padding: '0 20px' }}>
                        {/* توقيعك الشخصي */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#fbbf24', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                               Eng Abdallah Farag
                            </div>
                            <div style={{ width: '150px', height: '1px', background: '#d97706', margin: '4px auto 3px auto' }}></div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>Instructor & Founder</div>
                        </div>

                        {/* ختم التحقق الذهبي */}
                        <div style={{ textAlign: 'center', marginBottom: '-5px' }}>
                            <div style={{ width: '55px', height: '55px', borderRadius: '50%', border: '2px dashed #fbbf24', background: 'rgba(217,119,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#fbbf24', fontSize: '20px' }}>
                                🌟
                            </div>
                            <span style={{ fontSize: '9px', color: '#fbbf24', fontWeight: '800', display: 'block', marginTop: '3px', letterSpacing: '1px' }}>
                                {studentScoreData ? studentScoreData.grade : 'VERIFIED'}
                            </span>
                        </div>

                        {/* اعتماد المنصة */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', fontFamily: 'Georgia, serif' }}>
                                EduTrack Academy
                            </div>
                            <div style={{ width: '150px', height: '1px', background: '#ffffff', margin: '4px auto 3px auto' }}></div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>Authorized Signature</div>
                        </div>
                    </div>

                </div>
            ) : (
                <div style={{ background: '#fff', padding: '60px', textAlign: 'center', borderRadius: '16px', color: '#64748b', border: '1px solid #e2e8f0', direction: 'rtl', fontSize: '16px', fontWeight: 'bold' }}>
                    ☝️ يرجى اختيار الطالب والامتحان من الأعلى لتوليد الشهادة بالتقدير الأوتوماتيكي.
                </div>
            )}

            {/* ستايل الطباعة لتثبيت الشهادة في صفحة A4 Landscape */}
            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0mm;
                    }
                    body, html {
                        background: #0f172a !important;
                        height: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
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
                    .certificate-container {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        border: 10px solid #d97706 !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 30px 40px !important;
                        box-sizing: border-box !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>

        </div>
    );
}