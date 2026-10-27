import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function GroupPlans() {
    const [plans, setPlans] = useState([]);
    const [groups, setGroups] = useState([]);

    const [selectedGroup, setSelectedGroup] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetDate, setTargetDate] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // بيانات التعديل
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editTargetDate, setEditTargetDate] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    useEffect(() => {
        fetchPlans();
        fetchGroups();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://127.0.0.1:8000/api/group-plans', { headers });
            setPlans(res.data.data || []);
        } catch (err) {
            console.error(err);
            setError('فشل في جلب خطط المجموعات.');
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

    const handleAddPlan = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedGroup || !title || !content) {
            setError('يرجى اختيار المجموعة وعنوان الخطة والتفاصيل');
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/group-plans', {
                group_id: selectedGroup,
                title: title,
                content: content,
                target_date: targetDate
            }, { headers });

            setSuccess('تم إضافة خطة المجموعة بنجاح');
            setSelectedGroup('');
            setTitle('');
            setContent('');
            setTargetDate('');
            fetchPlans();
        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء حفظ الخطة.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الخطة؟')) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/group-plans/${id}`, { headers });
            setSuccess('تم حذف الخطة بنجاح');
            setPlans(plans.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            setError('خطأ أثناء الحذف.');
        }
    };

    const startEditing = (plan) => {
        setEditingId(plan.id);
        setEditTitle(plan.title);
        setEditContent(plan.content);
        setEditTargetDate(plan.target_date || '');
    };

    const handleUpdate = async (id, groupId) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/group-plans/${id}`, {
                group_id: groupId,
                title: editTitle,
                content: editContent,
                target_date: editTargetDate
            }, { headers });

            setSuccess('تم تحديث الخطة بنجاح');
            setEditingId(null);
            fetchPlans();
        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء التحديث.');
        }
    };

    return (
        <div style={{ padding: '24px', direction: 'rtl', maxWidth: '950px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', fontFamily: 'Cairo, sans-serif' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', textAlign: 'right' }}>
                📋 خطط المنهج والبرامج التعليمية للمجموعات
            </h2>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>❌ {error}</div>}
            {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>✅ {success}</div>}

            {/* نموذج إضافة خطة جديدة */}
            <form onSubmit={handleAddPlan} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>اختر المجموعة:</label>
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>عنوان الخطة (الأسبوع):</label>
                    <input 
                        type="text" 
                        placeholder="مثال: خطة الأسبوع الأول" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>التاريخ أو الموعد:</label>
                    <input 
                        type="text" 
                        placeholder="مثال: من 1 أكتوبر إلى 7 أكتوبر" 
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', color: '#475569' }}>تفاصيل المنهج / الخطة:</label>
                    <textarea 
                        rows="3"
                        placeholder="اكتب تفاصيل الدروس والواجبات والمقرر لهذه المجموعة..." 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    ></textarea>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                    <button 
                        type="submit" 
                        style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                    >
                        ➕ حفظ وإضافة خطة للمجموعة
                    </button>
                </div>
            </form>

            {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#2563eb' }}>⏳ جاري تحميل الخطط...</div>}

            {!loading && plans.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>لا توجد خطط للمجموعات مسجلة حتى الآن.</div>
            )}

            {/* جدول عرض خطط المجموعات */}
            {!loading && plans.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', color: '#475569' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>المجموعة</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>عنوان الخطة</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>التفاصيل والموعد</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>التحكم</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>
                                        📂 {plan.group?.name || 'مجموعة عامة'}
                                    </td>
                                    
                                    <td style={{ padding: '12px' }}>
                                        {editingId === plan.id ? (
                                            <input 
                                                type="text" 
                                                value={editTitle} 
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                style={{ padding: '6px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                        ) : (
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{plan.title}</div>
                                        )}
                                    </td>

                                    <td style={{ padding: '12px' }}>
                                        {editingId === plan.id ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <input 
                                                    type="text" 
                                                    value={editTargetDate} 
                                                    placeholder="التاريخ"
                                                    onChange={(e) => setEditTargetDate(e.target.value)}
                                                    style={{ padding: '6px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                                />
                                                <textarea 
                                                    value={editContent} 
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    style={{ padding: '6px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                                ></textarea>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ color: '#475569', marginBottom: '4px' }}>{plan.content}</div>
                                                {plan.target_date && <span style={{ fontSize: '12px', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px' }}>📅 {plan.target_date}</span>}
                                            </div>
                                        )}
                                    </td>

                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {editingId === plan.id ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => handleUpdate(plan.id, plan.group_id)}
                                                    style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    حفظ
                                                </button>
                                                <button 
                                                    onClick={() => setEditingId(null)}
                                                    style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => startEditing(plan)}
                                                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    ✏️ تعديل
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(plan.id)}
                                                    style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    🗑️ حذف
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}