import React from 'react';

export default function StudentDashboard({ student, lessons, onLogout }) {
    if (!student) return <div style={{ textAlign: 'center', padding: '50px' }}>لا توجد بيانات متاحة للطالب</div>;

    return (
        <div style={{ padding: '20px', background: '#f4f6f9', minHeight: '100vh', direction: 'rtl', textAlign: 'right', fontFamily: 'Cairo, sans-serif' }}>
            
            {/* رأس الصفحة (البروفايل وزر الخروج) */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>أهلاً بك، {student.name}</h2>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>المجموعة: <span style={{ fontWeight: 'bold', color: '#007bff' }}>{student.group ? student.group.name : 'غير مسجل في مجموعة'}</span></p>
                </div>
                <button 
                    onClick={onLogout}
                    style={{ padding: '8px 15px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    تسجيل الخروج
                </button>
            </div>

            {/* شبكة المحتوى (الحضور والامتحانات) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                
                {/* قسم الحضور والغياب */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', color: '#007bff', marginTop: 0 }}>سجل الحضور والغياب</h3>
                    {student.attendances && student.attendances.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {student.attendances.map((att, index) => (
                                <li key={index} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#555' }}>التاريخ: {att.date || att.created_at?.split('T')[0]}</span>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold',
                                        background: att.status === 'present' ? '#d4edda' : '#f8d7da',
                                        color: att.status === 'present' ? '#155724' : '#721c24'
                                    }}>
                                        {att.status === 'present' ? 'حاضر ✅' : 'غائب ❌'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#888', textAlign: 'center' }}>لا توجد سجلات حضور مسجلة حتى الآن.</p>
                    )}
                </div>

                {/* قسم الامتحانات والدرجات */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #28a745', paddingBottom: '10px', color: '#28a745', marginTop: 0 }}>درجات الامتحانات</h3>
                    {student.exams && student.exams.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {student.exams.map((exam, index) => (
                                <li key={index} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#555' }}>{exam.title || 'اختبار شهري / أسبوعي'}</span>
                                    <span style={{ fontWeight: 'bold', color: '#333', background: '#e2e3e5', padding: '3px 8px', borderRadius: '5px' }}>
                                        {exam.score} درجة
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#888', textAlign: 'center' }}>لا توجد اختبارات مسجلة حتى الآن.</p>
                    )}
                </div>
            </div>

            {/* قسم الشروحات والدروس */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '2px solid #ffc107', paddingBottom: '10px', color: '#856404', marginTop: 0 }}>شروحات ودروس المجموعة</h3>
                {lessons && lessons.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '15px' }}>
                        {lessons.map((lesson, index) => (
                            <div key={index} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', background: '#fafafa' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{lesson.title}</h4>
                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px', lineHeight: '1.4' }}>{lesson.description}</p>
                                {lesson.file_url && (
                                    <a href={lesson.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
                                        عرض / تحميل الملف 📄
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#888', textAlign: 'center' }}>لا توجد دروس مرفوعة لهذه المجموعة حالياً.</p>
                )}
            </div>

        </div>
    );
}