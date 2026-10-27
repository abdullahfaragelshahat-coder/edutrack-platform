import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Lessons() {
    const [lessons, setLessons] = useState([]);
    const [groups, setGroups] = useState([]);

    const [title, setTitle] = useState('');
    const [unit, setUnit] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    useEffect(() => {
        fetchLessons();
        fetchGroups();
    }, []);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://127.0.0.1:8000/api/lessons', { headers });
            setLessons(res.data.data || res.data.lessons || []);
        } catch (err) {
            console.error(err);
            setError('فشل في جلب الدروس والمحاضرات.');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/groups', { headers });
            setGroups(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title || !selectedGroup) {
            setError('يرجى إدخال عنوان الدرس واختيار المجموعة');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('unit', unit);
        formData.append('unit_name', unit);
        formData.append('group_id', selectedGroup);
        formData.append('video_url', videoUrl);
        formData.append('description', description);
        
        for (let i = 0; i < files.length; i++) {
            formData.append('pdf_files[]', files[i]);
        }

        try {
            setSubmitting(true);
            await axios.post('http://127.0.0.1:8000/api/lessons', formData, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('تم إضافة الدرس وجميع الملفات بنجاح');
            setTitle('');
            setUnit('');
            setVideoUrl('');
            setDescription('');
            setFiles([]);
            fetchLessons();
        } catch (err) {
            console.error(err.response?.data);
            const errorMsg = err.response?.data?.message || 'حدث خطأ أثناء حفظ الدرس.';
            const validationErrors = err.response?.data?.errors;
            
            if (validationErrors) {
                const firstKey = Object.keys(validationErrors)[0];
                setError(validationErrors[firstKey][0]);
            } else {
                setError(errorMsg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه المحاضرة؟')) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/lessons/${id}`, { headers });
            setSuccess('تم حذف المحاضرة بنجاح');
            setLessons(lessons.filter(l => l.id !== id));
        } catch (err) {
            console.error(err);
            setError('خطأ أثناء الحذف.');
        }
    };

    // دالة فحص الذكاء: لو الاسم عبارة عن كود هاش عشوائي طويل، تستبدله باسم تعليمي أنيق، وإلا تعرض الاسم الحقيقي
    const getFormattedFileName = (fileItem, index) => {
        if (!fileItem) return `📄 ملف PDF (${index + 1})`;

        let rawName = '';
        if (typeof fileItem === 'object' && fileItem.name) {
            rawName = fileItem.name;
        } else {
            const path = typeof fileItem === 'object' ? fileItem.path : fileItem;
            const parts = path.split('/');
            rawName = parts[parts.length - 1];
        }

        // إزالة الامتداد مؤقتاً للفحص
        const nameWithoutExt = rawName.replace(/\.[^/.]+$/, "");

        // لو الاسم عبارة عن حروف عشوائية طويلة (مثل الـ Hash الظاهر في صورتك طوله أكتر من 20 حرف وعشوائي)
        const isRandomHash = /^[a-zA-Z0-9]{20,}$/.test(nameWithoutExt);

        if (isRandomHash) {
            // أسماء افتراضية منظمة للملفات القديمة العشوائية
            const smartNames = [
                '📄 ملف الشرح الرئيسي',
                '📄 تدريبات وتطبيقات',
                '📄 أسئلة واختبارات',
                '📄 ملخص الدرس',
                '📄 نموذج الإجابة'
            ];
            return smartNames[index] || `📄 ملف PDF رقم (${index + 1})`;
        }

        // لو اسم حقيقي مدخل من المستخدم، نعرضه بجمالية
        return `📄 ${rawName.replace(/^\d+[-_]/, '')}`;
    };

    const getFilePath = (fileItem) => {
        if (typeof fileItem === 'object' && fileItem.path) {
            return fileItem.path;
        }
        return fileItem;
    };

    const groupedLessons = lessons.reduce((acc, lesson) => {
        const unitKey = lesson.unit || lesson.unit_name || 'وحدة عامة / دروس متفرقة';
        if (!acc[unitKey]) {
            acc[unitKey] = [];
        }
        acc[unitKey].push(lesson);
        return acc;
    }, {});

    return (
        <div style={{ padding: '24px', direction: 'rtl', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Cairo, sans-serif' }}>
            
            {/* بطاقة إضافة درس جديد */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '18px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', textAlign: 'right' }}>
                    📚 إضافة درس جديد (يدعم عدة ملفات PDF)
                </h2>

                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>❌ {error}</div>}
                {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>✅ {success}</div>}

                <form onSubmit={handleAddLesson} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>المجموعة الدراسية:</label>
                        <select 
                            value={selectedGroup} 
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff' }}
                        >
                            <option value="">-- اختر المجموعة --</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>اسم الوحدة:</label>
                        <input 
                            type="text" 
                            placeholder="مثال: الوحدة الأولى" 
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>عنوان الدرس:</label>
                        <input 
                            type="text" 
                            placeholder="مثال: شرح درس الدوال" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>رابط الفيديو (اختياري):</label>
                        <input 
                            type="text" 
                            placeholder="رابط يوتيوب أو فيديو" 
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>ملفات الشرح (يمكنك تحديد أكثر من ملف PDF):</label>
                        <input 
                            type="file" 
                            multiple 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setFiles(e.target.files)}
                            style={{ width: '100%', padding: '7px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff' }}
                        />
                        {files.length > 0 && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>تم اختيار {files.length} ملفات</span>}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                        >
                            {submitting ? '⏳ جاري الحفظ والنشر...' : '➕ إضافة ونشر المحاضرة'}
                        </button>
                    </div>
                </form>
            </div>

            {/* قسم عرض المحتوى التعليمي بأسماء منظمة واحترافية */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px', textAlign: 'right', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                    📖 المحتوى التعليمي مقسم حسب الوحدات والملفات
                </h3>

                {loading && <div style={{ textAlign: 'center', padding: '30px', color: '#2563eb', fontWeight: 'bold' }}>⏳ جاري تحميل المحاضرات...</div>}

                {!loading && lessons.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>لا توجد دروس أو محاضرات مسجلة حتى الآن.</div>
                )}

                {!loading && Object.keys(groupedLessons).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {Object.entries(groupedLessons).map(([unitName, unitLessons], index) => (
                            <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
                                
                                <div style={{ background: '#f1f5f9', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>
                                        📂 {unitName}
                                    </div>
                                    <div style={{ fontSize: '12px', background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                                        {unitLessons.length} دروس
                                    </div>
                                </div>

                                <div style={{ padding: '12px 16px' }}>
                                    {unitLessons.map((lesson, lIdx) => {
                                        let pdfList = [];
                                        if (lesson.pdf_files) {
                                            try {
                                                pdfList = typeof lesson.pdf_files === 'string' ? JSON.parse(lesson.pdf_files) : lesson.pdf_files;
                                            } catch (e) {
                                                pdfList = [lesson.pdf_files];
                                            }
                                        } else if (lesson.file_path) {
                                            pdfList = [lesson.file_path];
                                        } else if (lesson.file) {
                                            pdfList = [lesson.file];
                                        } else if (lesson.pdf_file) {
                                            pdfList = [lesson.pdf_file];
                                        }

                                        if (!Array.isArray(pdfList)) {
                                            pdfList = [pdfList].filter(Boolean);
                                        }

                                        return (
                                            <div 
                                                key={lesson.id || lIdx} 
                                                style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center', 
                                                    padding: '16px 0', 
                                                    borderBottom: lIdx !== unitLessons.length - 1 ? '1px solid #f1f5f9' : 'none',
                               flexWrap: 'wrap',
                                                    gap: '12px'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ background: '#eff6ff', color: '#2563eb', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                                                        {lIdx + 1}
                                                    </span>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>{lesson.title}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>المجموعة: <strong style={{ color: '#2563eb' }}>{lesson.group?.name || 'عام'}</strong></div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    {lesson.video_url && (
                                                        <a 
                                                            href={lesson.video_url} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '7px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                        >
                                                            🎥 فيديو الشرح
                                                        </a>
                                                    )}
                                                    
                                                    {/* عرض أزرار بأسماء منظمة تلقائياً تتجنب الرموز العشوائية */}
                                                    {pdfList.map((fileItem, pIdx) => {
                                                        const filePath = getFilePath(fileItem);
                                                        const displayName = getFormattedFileName(fileItem, pIdx);

                                                        return (
                                                            <a 
                                                                key={pIdx}
                                                                href={`http://127.0.0.1:8000/storage/${filePath}`} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '7px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                            >
                                                                {displayName}
                                                            </a>
                                                        );
                                                    })}

                                                    <button 
                                                        onClick={() => handleDelete(lesson.id)}
                                                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                                    >
                                                        🗑️ حذف
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}