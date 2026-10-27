import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard({ setActiveSection }) {
    const [stats, setStats] = useState({
        studentsCount: 0,
        groupsCount: 0,
        lessonsCount: 0,
        examsCount: 0,
        attendanceRate: 95,
        completionRate: 88,
        satisfactionRate: 94,
        systemHealth: 99
    });
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [studentsRes, groupsRes, lessonsRes, examsRes] = await Promise.allSettled([
                axios.get('http://127.0.0.1:8000/api/students', { headers }),
                axios.get('http://127.0.0.1:8000/api/groups', { headers }),
                axios.get('http://127.0.0.1:8000/api/lessons', { headers }),
                axios.get('http://127.0.0.1:8000/api/exams', { headers })
            ]);

            const students = studentsRes.status === 'fulfilled' ? (studentsRes.value.data.students || studentsRes.value.data.data || []) : [];
            const groups = groupsRes.status === 'fulfilled' ? (groupsRes.value.data.data || []) : [];
            const lessons = lessonsRes.status === 'fulfilled' ? (lessonsRes.value.data.data || []) : [];
            const exams = examsRes.status === 'fulfilled' ? (examsRes.value.data.exams || examsRes.value.data.data || []) : [];

            setStats({
                studentsCount: students.length,
                groupsCount: groups.length,
                lessonsCount: lessons.length,
                examsCount: exams.length,
                attendanceRate: 95,
                completionRate: 88,
                satisfactionRate: 94,
                systemHealth: 99
            });
        } catch (err) {
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const chartData = [
        { name: 'الطلاب', count: stats.studentsCount },
        { name: 'المجموعات', count: stats.groupsCount },
        { name: 'المحاضرات', count: stats.lessonsCount },
        { name: 'الامتحانات', count: stats.examsCount },
    ];

    // مكون المؤشر الدائري الفخم والمتطور
    const PremiumProgressRing = ({ percentage, color, title, subtitle, icon }) => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="stat-card" style={{
                background: '#ffffff',
                padding: '24px 20px',
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* شريط توهج علوي ملون */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: color }}></div>
                
                <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r={radius} stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle 
                            cx="50" 
                            cy="50" 
                            r={radius} 
                            stroke={color} 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={strokeDashoffset} 
                            strokeLinecap="round" 
                            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <span style={{ fontSize: '19px', fontWeight: '900', color: '#0f172a', display: 'block', lineHeight: '1' }}>
                            {percentage}%
                        </span>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>{icon}</span>
                    </div>
                </div>
                
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>{title}</div>
                    <div style={{ color: '#64748b', fontSize: '12px', marginTop: '3px', fontWeight: '500' }}>{subtitle}</div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '24px', direction: 'rtl', fontFamily: 'Cairo, sans-serif', maxWidth: '1240px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
            
            {/* الهيدر والترحيب بالنمط الداكن الفاخر */}
            <div style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                padding: '28px 36px', 
                borderRadius: '24px', 
                color: '#fff', 
                marginBottom: '32px', 
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)', 
                display: 'flex', 
                justify: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        <span style={{ width: '8px', height: '8px', background: '#38bdf8', borderRadius: '50%', display: 'inline-block' }}></span>
                        مركز القيادة الرقمية والأداء 🚀
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                        مؤسسة EduTrack التعليمية
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                        لوحة التحكم المركزية لمتابعة حركة الطلاب، المجموعات، والمحاضرات لحظياً.
                    </p>
                </div>

                {setActiveSection && (
                    <button 
                        onClick={() => setActiveSection('certificates')}
                        style={{
                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '14px 26px',
                            borderRadius: '14px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(217, 119, 6, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s',
                            position: 'relative',
                            zIndex: 2
                        }}
                    >
                        🏆 إصدار شهادات التقدير
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px', color: '#2563eb', fontWeight: 'bold', fontSize: '17px' }}>
                    ⏳ جاري تحميل لوحة الإحصائيات...
                </div>
            ) : (
                <>
                    {/* شبكة المؤشرات الدائرية التفاعلية */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🎯 مؤشرات الأداء التشغيلي
                        </h3>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', 
                            gap: '20px' 
                        }}>
                            <PremiumProgressRing percentage={stats.attendanceRate} color="#2563eb" title="نسبة الحضور العام" subtitle="متابعة الالتزام بالحضور" icon="📈" />
                            <PremiumProgressRing percentage={stats.completionRate} color="#16a34a" title="إنجاز المناهج" subtitle="الدروس والمحاضرات المكتملة" icon="📚" />
                            <PremiumProgressRing percentage={stats.satisfactionRate} color="#d97706" title="معدل تقييم الطلاب" subtitle="الأداء والتفاعل الأكاديمي" icon="⭐" />
                            <PremiumProgressRing percentage={stats.systemHealth} color="#0284c7" title="استقرار المنظومة" subtitle="جاهزية وكفاءة الخوادم" icon="⚡" />
                        </div>
                    </div>

                    {/* كروت الأرقام الرئيسية المعاصرة */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📋 الإحصائيات والعناصر النشطة
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px' }}>
                            
                            {/* كارت الطلاب */}
                            <div className="stat-card" style={modernCardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>إجمالي الطلاب المسجلين</div>
                                        <div style={{ fontSize: '34px', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>{stats.studentsCount}</div>
                                    </div>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👥</div>
                                </div>
                            </div>

                            {/* كارت المجموعات */}
                            <div className="stat-card" style={modernCardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>المجموعات الدراسية</div>
                                        <div style={{ fontSize: '34px', fontWeight: '900', color: '#d97706', marginTop: '4px' }}>{stats.groupsCount}</div>
                                    </div>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📚</div>
                                </div>
                            </div>

                            {/* كارت المحاضرات */}
                            <div className="stat-card" style={modernCardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>المحاضرات والدروس</div>
                                        <div style={{ fontSize: '34px', fontWeight: '900', color: '#0284c7', marginTop: '4px' }}>{stats.lessonsCount}</div>
                                    </div>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📖</div>
                                </div>
                            </div>

                            {/* كارت الاختبارات */}
                            <div className="stat-card" style={modernCardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>الاختبارات المنفذة</div>
                                        <div style={{ fontSize: '34px', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>{stats.examsCount}</div>
                                    </div>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📝</div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* قسم الرسم البياني التفاعلي الفاخر */}
                    <div style={{ background: '#ffffff', padding: '28px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                📊 توزيع البيانات التراكمي
                            </h3>
                            <span style={{ fontSize: '12px', background: '#f1f5f9', color: '#475569', padding: '5px 14px', borderRadius: '10px', fontWeight: '700' }}>تحديث فوري</span>
                        </div>
                        
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 13, fontWeight: '700' }} />
                                    <YAxis stroke="#64748b" allowDecimals={false} tick={{ fontSize: 13 }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', color: '#fff', border: 'none', padding: '12px 18px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} 
                                        itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="count" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* تأثيرات الحركة السلسة عند الوقوف على الكروت */}
            <style>{`
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important;
                }
            `}</style>
        </div>
    );
}

const modernCardStyle = {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
};