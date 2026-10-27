import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // بيانات التعديل
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/groups', { headers });
            setGroups(response.data.data || []);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError('فشل في جلب المجموعات.');
        } finally {
            setLoading(false);
        }
    };

    // إضافة مجموعة جديدة
    const handleAddGroup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newGroupName.trim()) {
            setError('يرجى إدخال اسم المجموعة');
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/groups', { name: newGroupName }, { headers });
            setSuccess('تم إضافة المجموعة بنجاح');
            setNewGroupName('');
            fetchGroups();
        } catch (err) {
            console.error('Error adding group:', err);
            setError('حدث خطأ أثناء إضافة المجموعة.');
        }
    };

    // حذف مجموعة
    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/groups/${id}`, { headers });
            setSuccess('تم حذف المجموعة بنجاح');
            setGroups(groups.filter(g => g.id !== id));
        } catch (err) {
            console.error('Error deleting group:', err);
            setError('حدث خطأ أثناء حذف المجموعة.');
        }
    };

    // بدء التعديل
    const startEditing = (group) => {
        setEditingId(group.id);
        setEditName(group.name);
    };

    // حفظ التعديل
    const handleUpdate = async (id) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/groups/${id}`, { name: editName }, { headers });
            setSuccess('تم تحديث المجموعة بنجاح');
            setEditingId(null);
            fetchGroups();
        } catch (err) {
            console.error('Error updating group:', err);
            setError('حدث خطأ أثناء تحديث المجموعة.');
        }
    };

    return (
        <div style={{ padding: '24px', direction: 'rtl', maxWidth: '850px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', fontFamily: 'Cairo, sans-serif' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', textAlign: 'right' }}>
                📚 إدارة وعرض المجموعات (إضافة، تعديل، وحذف)
            </h2>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>❌ {error}</div>}
            {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>✅ {success}</div>}

            {/* نموذج إضافة مجموعة جديدة */}
            <form onSubmit={handleAddGroup} style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <input 
                    type="text" 
                    placeholder="اسم المجموعة الجديدة..." 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
                <button 
                    type="submit" 
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                >
                    ➕ إضافة المجموعة
                </button>
            </form>

            {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#2563eb' }}>⏳ جاري تحميل المجموعات...</div>}

            {!loading && groups.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>لا توجد مجموعات مسجلة حالياً.</div>
            )}

            {!loading && groups.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', color: '#475569' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>اسم المجموعة</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>التحكم (تعديل / حذف)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((group) => (
                                <tr key={group.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>
                                        {editingId === group.id ? (
                                            <input 
                                                type="text" 
                                                value={editName} 
                                                onChange={(e) => setEditName(e.target.value)}
                                                style={{ padding: '6px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                        ) : (
                                            group.name
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {editingId === group.id ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => handleUpdate(group.id)}
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
                                                    onClick={() => startEditing(group)}
                                                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    ✏️ تعديل
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(group.id)}
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