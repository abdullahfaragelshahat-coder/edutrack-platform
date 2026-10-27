import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AccountReports() {
    const [reports, setReports] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    // جلب المجموعات
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/groups', { headers })
            .then(res => setGroups(res.data.data || []))
            .catch(err => console.error(err));
    }, []);

    // جلب بيانات الحسابات المحفوظة
    const fetchReports = () => {
        setLoading(true);
        let url = `http://127.0.0.1:8000/api/accounts?month=${selectedMonth}`;
        if (selectedGroup) {
            url += `&group_id=${selectedGroup}`;
        }

        axios.get(url, { headers })
            .then(res => {
                setReports(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('خطأ في جلب تقرير الحسابات:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchReports();
    }, [selectedMonth, selectedGroup]);

    // حساب الإجمالي الكلي للمبالغ المحصلة بشكل آمن ودقيق
    const totalAmount = reports.reduce((sum, item) => {
        const val = parseFloat(item.amount);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const getStatusBadge = (status) => {
        if (status === 'paid') return <span style={{ color: '#16a34a', fontWeight: 'bold', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>✅ تم الدفع</span>;
        if (status === 'partial') return <span style={{ color: '#d97706', fontWeight: 'bold', background: '#fef3c7', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>⚠️ دفع جزء</span>;
        return <span style={{ color: '#dc2626', fontWeight: 'bold', background: '#fee2e2', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>❌ لم يدفع</span>;
    };

    return (
        <div style={{ padding: '24px', direction: 'rtl', maxWidth: '950px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', textAlign: 'right' }}>
                📊 كشف وملخص الحسابات الإجمالي
            </h2>

            {/* أدوات تصفية الشهر والمجموعة */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ textAlign: 'right' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>اختر الشهر:</label>
                    <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ textAlign: 'right' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>تصفية بالمجموعة (اختياري):</label>
                    <select 
                        value={selectedGroup} 
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: '#fff', outline: 'none' }}
                    >
                        <option value="">-- كل المجموعات --</option>
                        {groups.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* بطاقة الإجمالي الكلي (Total Card) */}
            <div style={{ background: '#3b82f6', color: '#fff', padding: '18px 24px', borderRadius: '10px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span style={{ fontSize: '14px', opacity: 0.9, display: 'block' }}>إجمالي المبالغ المحصلة لشهر ({selectedMonth}):</span>
                    <strong style={{ fontSize: '26px' }}>{totalAmount.toLocaleString()} ج.م</strong>
                </div>
                <div style={{ fontSize: '32px' }}>💵</div>
            </div>

            {/* جدول تفاصيل الحسابات */}
            {loading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>جارٍ تحضير التقرير...</div>
            ) : reports.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    لا توجد سجلات حسابات محفوظة لهذا الشهر بعد.
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold' }}>اسم الطالب</th>
                            <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold' }}>المجموعة</th>
                            <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>المبلغ المدفوع</th>
                            <th style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                    👤 {item.student ? item.student.name : 'طالب غير معروف'}
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>
                                    {item.group ? item.group.name : '-'}
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: '15px', fontWeight: 'bold', textAlign: 'center', color: '#16a34a' }}>
                                    {Number(item.amount || 0).toLocaleString()} ج.م
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                    {getStatusBadge(item.status)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {/* صف الإجمالي في أسفل الجدول */}
                    <tfoot>
                        <tr style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1', fontWeight: 'bold' }}>
                            <td colSpan="2" style={{ padding: '14px 16px', fontSize: '15px', color: '#0f172a' }}>
                                الإجمـــالي الكلي:
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '16px', textAlign: 'center', color: '#2563eb' }}>
                                {totalAmount.toLocaleString()} ج.م
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            )}
        </div>
    );
}