import React, { useState, useEffect } from 'react';
import './App.css';
import AccountReports from './components/AccountReports';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import StudentProgress from './components/StudentProgress';
import AddGroup from './components/AddGroup';     
import AddStudent from './components/AddStudent'; 
import Auth from './components/Auth';
import Exams from './components/Exams';
import Accounts from './components/Accounts';
import Students from './components/Students';   
import Groups from './components/Groups';
import Lessons from './components/Lessons';
import GroupPlans from './components/GroupPlans';
import Certificates from './components/Certificates'; // 🔑 1. استيراد صفحة شهادات التقدير

// استدعاء المكونات الخاصة ببوابة الطالب
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard';

export default function App() {
    const [currentTab, setCurrentTab] = useState('dashboard');
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    
    // حالة جلسة الطالب
    const [student, setStudent] = useState(null);
    const [studentLessons, setStudentLessons] = useState([]);
    const [isStudentView, setIsStudentView] = useState(false);

    useEffect(() => {
        const savedStudent = localStorage.getItem('student_data');
        const savedLessons = localStorage.getItem('student_lessons');
        if (savedStudent) {
            setStudent(JSON.parse(savedStudent));
            setStudentLessons(savedLessons ? JSON.parse(savedLessons) : []);
            setIsStudentView(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
    };

    const handleStudentLoginSuccess = (studentData, lessonsData) => {
        setStudent(studentData);
        setStudentLessons(lessonsData);
        setIsStudentView(true);
    };

    const handleStudentLogout = () => {
        localStorage.removeItem('student_data');
        localStorage.removeItem('student_lessons');
        setStudent(null);
        setStudentLessons([]);
        setIsStudentView(false);
    };

    if (isStudentView && student) {
        return (
            <StudentDashboard 
                student={student} 
                lessons={studentLessons} 
                onLogout={handleStudentLogout} 
            />
        );
    }

    if (isStudentView && !student) {
        return (
            <div style={{ position: 'relative' }}>
                <button 
                    onClick={() => setIsStudentView(false)}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '10px 18px',
                        background: '#64748b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        zIndex: 1000
                    }}
                >
                    ⬅️ العودة لتسجيل دخول الإدارة
                </button>
                <StudentLogin onLoginSuccess={handleStudentLoginSuccess} />
            </div>
        );
    }

    if (!token) {
        return (
            <Auth 
                onLoginSuccess={(newToken) => setToken(newToken)} 
                onSwitchToStudent={() => setIsStudentView(true)} 
            />
        );
    }

    return (
        <div className="app-container" dir="rtl">
            {/* Sidebar القائمة الجانبية */}
            <aside className="sidebar">
                <div>
                    <div className="brand">
                        <div className="brand-icon">E</div>
                        <div>
                            <div className="brand-title">EduTrack</div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Pro Management</span>
                        </div>
                    </div>

                    <nav className="nav-menu">
                        <button 
                            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('dashboard')}
                        >
                            <span>📊 لوحة التحكم</span>
                        </button>

                        <button 
                            className={`nav-item ${currentTab === 'groups' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('groups')}
                        >
                            <span>📚 إدارة المجموعات</span>
                        </button>

                        <button 
                            className={`nav-item ${currentTab === 'add-student' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('add-student')}
                        >
                            <span>👤 إضافة طالب جديد</span>
                        </button>

                        <button 
                            className={`nav-item ${currentTab === 'students' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('students')}
                        >
                            <span>👥 عرض وإدارة الطلاب</span>
                        </button>
                        
                        <button 
                            className={`nav-item ${currentTab === 'lessons' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('lessons')}
                        >
                            <span>📚 الدروس والمحاضرات</span>
                        </button>

                        <button 
                            className={`nav-item ${currentTab === 'attendance' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('attendance')}
                        >
                            <span>📝 تسجيل الحضور</span>
                        </button>

                        {/* 🔑 2. زرار شهادات التقدير في القائمة الجانبية */}
                        <button 
                            className={`nav-item ${currentTab === 'certificates' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('certificates')}
                        >
                            <span>🏆 شهادات التقدير</span>
                        </button>

                        <button 
                            className={`nav-item ${currentTab === 'progress' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('progress')}
                        >
                            <span>📈 نشاط الطالب</span>
                            <span className="nav-badge">جديد</span>
                        </button>

                        <button 
                            className={`nav-item ${currentTab === 'exams' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('exams')}
                        >
                            <span>🎓 الامتحانات والدرجات</span>
                        </button>

                        <button 
                            className={`nav-item ${currentTab === 'accounts' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('accounts')}
                        >
                            <span>💰 قسم الحسابات</span>
                        </button>

                        <button 
                            className={`nav-item ${currentTab === 'reports' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('reports')}
                        >
                            <span>📄 تقارير PDF</span>
                        </button>

                        <button 
                            className={`nav-item ${currentTab === 'group-plans' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('group-plans')}
                        >
                            <span>📋 خطط المجموعات</span>
                        </button>
                    </nav>
                </div>

                <div>
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Main Area المنطقة الرئيسية */}
            <div className="main-wrapper">
                <header className="top-header">
                    <input type="text" placeholder="ابحث عن طالب أو مجموعة..." className="search-input" />
                    <span style={{ fontWeight: 'bold', color: '#2563eb' }}>العام الدراسي 2026/2027</span>
                </header>

                <main className="content-area">
                    {currentTab === 'dashboard' && <Dashboard setActiveSection={setCurrentTab} />}
                    {currentTab === 'add-group' && <AddGroup />}
                    {currentTab === 'add-student' && <AddStudent />}
                    {currentTab === 'students' && <Students />}
                    {currentTab === 'attendance' && <Attendance />}
                    {currentTab === 'certificates' && <Certificates />} {/* 🔑 3. عرض صفحة الشهادات عند اختيارها */}
                    {currentTab === 'progress' && <StudentProgress />}
                    {currentTab === 'exams' && <Exams />}
                    {currentTab === 'accounts' && <Accounts />}
                    {currentTab === 'reports' && <AccountReports />}
                    {currentTab === 'groups' && <Groups />}
                    {currentTab === 'lessons' && <Lessons />}
                    {currentTab === 'group-plans' && <GroupPlans />}
                </main>
            </div>
        </div>
    );
}