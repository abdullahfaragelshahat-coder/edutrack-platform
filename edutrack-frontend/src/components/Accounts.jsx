import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [students, setStudents] = useState([]);
    
    // نموذج إضافة دفع طالب
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState('');

    // نموذج إضافة مصروف جديد
    const [expenseTitle, setExpenseTitle] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenseNotes, setExpenseNotes] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // بيانات تعديل إيراد
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editMonth, setEditMonth] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
    };

    useEffect(() => {
        fetchData();
        fetchStudents();
    }, []);

    // جلب الحسابات والمصروفات معاً
    const fetchData = async () => {
        try {
            setLoading(true);
            const [accRes, expRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/accounts', { headers }).catch(() => ({ data: { data: [] } })),
                axios.get('http://127.0.0.1:8000/api/expenses', { headers }).catch(() => ({ data: { data: [] } }))
            ]);

            setAccounts(accRes.data.data || []);
            setExpenses(expRes.data.data || []);
        } catch (err) {
            console.error('Error fetching financial data:', err);
            setError('فشل في جلب البيانات المالية.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/students', { headers });
            setStudents(res.data.students || res.data.data || []);
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const handleAddAccount = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedStudent || !amount || !month) {
            setError('يرجى اختيار الطالب وتحديد المبلغ والشهر');
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/accounts', {
                student_id: selectedStudent,
                amount: amount,
                month: month
            }, { headers });

            setSuccess('تم تسجيل المقبوض بنجاح');
            setSelectedStudent('');
            setAmount('');
            setMonth('');
            fetchData();
        } catch (err) {
            console.error('Error adding account:', err);
            // عرض رسالة الخطأ القادمة من لارايفل مباشرة إن وجدت
            const errorMsg = err.response?.data?.message || JSON.stringify(err.response?.data) || 'حدث خطأ أثناء حفظ الدفعة.';
            setError(errorMsg);
        }
    };
    // إضافة مصروف جديد (يُخصم من الإجمالي)
    const handleAddExpense = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!expenseTitle || !expenseAmount) {
            setError('يرجى كتابة عنوان المصروف والمبلغ');
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/expenses', {
                title: expenseTitle,
                amount: expenseAmount,
                date: expenseDate,
                notes: expenseNotes
            }, { headers });

            setSuccess('تم تسجيل المصروف وخصمه من الإجمالي بنجاح');
            setExpenseTitle('');
            setExpenseAmount('');
            setExpenseNotes('');
            fetchData();
        } catch (err) {
            console.error('Error adding expense:', err);
            setError('حدث خطأ أثناء إضافة المصروف.');
        }
    };

    // حذف دفعة طالب
    const handleDeleteAccount = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا السجل المالي؟')) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/accounts/${id}`, { headers });
            setSuccess('تم حذف السجل بنجاح');
            setAccounts(prev => prev.filter(acc => acc.id !== id));
        } catch (err) {
            console.error('Error deleting account:', err);
            setError('حدث خطأ أثناء الحذف.');
        }
    };

    // حذف مصروف
    const handleDeleteExpense = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/expenses/${id}`, { headers });
            setSuccess('تم حذف المصروف بنجاح');
            setExpenses(prev => prev.filter(exp => exp.id !== id));
        } catch (err) {
            console.error('Error deleting expense:', err);
            setError('حدث خطأ أثناء حذف المصروف.');
        }
    };

    // تعديل دفعة
    const startEditing = (acc) => {
        setEditingId(acc.id);
        setEditAmount(acc.amount);
        setEditMonth(acc.month);
    };

    const handleUpdateAccount = async (id) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/accounts/${id}`, {
                amount: editAmount,
                month: editMonth
            }, { headers });

            setSuccess('تم تحديث السجل بنجاح');
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error('Error updating account:', err);
            setError('حدث خطأ أثناء التحديث.');
        }
    };

    // الحسابات والتجميعات المالية
    const totalIncome = accounts.reduce((sum, acc) => sum + Number(acc.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const netTotal = totalIncome - totalExpenses; // الصافي بعد خصم المصروفات

    return (
        <div style={{ padding: '24px', direction: 'rtl', maxWidth: '1000px', margin: '0 auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', fontFamily: 'Cairo, sans-serif' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', textAlign: 'right' }}>
                💰 قسم الحسابات، المقبوضات والمصروفات
            </h2>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>❌ {error}</div>}
            {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>✅ {success}</div>}

            {/* ملخص الخزينة والصافي */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#166534', fontWeight: 'bold' }}>📈 إجمالي المقبوضات (الإيرادات)</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#15803d', marginTop: '4px' }}>{totalIncome.toLocaleString()} ج.م</div>
                </div>

                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 'bold' }}>📉 إجمالي المصروفات (الخصومات)</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626', marginTop: '4px' }}>{totalExpenses.toLocaleString()} ج.م</div>
                </div>

                <div style={{ background: netTotal >= 0 ? '#eff6ff' : '#fff1f2', border: `1px solid ${netTotal >= 0 ? '#bfdbfe' : '#fecdd3'}`, padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: netTotal >= 0 ? '#1e40af' : '#9f1239', fontWeight: 'bold' }}>💵 صافي المتبقي في الخزينة</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: netTotal >= 0 ? '#2563eb' : '#e11d48', marginTop: '4px' }}>{netTotal.toLocaleString()} ج.م</div>
                </div>
            </div>

            {/* 1. نموذج إضافة دفع طالب */}
            <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '15px', margin: '0 0 12px 0', color: '#1e293b' }}>📥 تسجيل دفعة طالب جديدة (إيراد):</h3>
                <form onSubmit={handleAddAccount} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>اختر الطالب:</label>
                        <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}>
                            <option value="">-- اختر الطالب --</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>المبلغ:</label>
                        <input type="number" placeholder="مثال: 500" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>الشهر:</label>
                        <input type="text" placeholder="مثال: أكتوبر" value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '9px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                            ➕ إضافة المقبوض
                        </button>
                    </div>
                </form>
            </div>

            {/* 2. نموذج إضافة مصروف جديد */}
            <div style={{ marginBottom: '24px', background: '#fef2f2', padding: '16px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                <h3 style={{ fontSize: '15px', margin: '0 0 12px 0', color: '#991b1b' }}>💸 تسجيل مصروف جديد (يُخصم تلقائياً):</h3>
                <form onSubmit={handleAddExpense} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>بند المصروف:</label>
                        <input type="text" placeholder="مثال: إيجار القاعة" value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>المبلغ الخصم:</label>
                        <input type="number" placeholder="مثال: 300" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>التاريخ:</label>
                        <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', padding: '9px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                            ➖ تسجيل وتطبيق الخصم
                        </button>
                    </div>
                </form>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#2563eb' }}>⏳ جاري تحميل البيانات...</div>}

            {/* جدول مقبوضات الطلاب */}
            {!loading && (
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '10px' }}>📑 سجل مدفوعات الطلاب:</h3>
                    {accounts.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '12px' }}>لا توجد مدفوعات طلاب مسجلة.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px', marginBottom: '12px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', color: '#475569' }}>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>اسم الطالب</th>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>المبلغ</th>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>الشهر</th>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>التحكم</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((acc) => (
                                    <tr key={acc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px', fontWeight: '600' }}>👤 {acc.student?.name || 'طالب غير معروف'}</td>
                                        <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>
                                            {editingId === acc.id ? <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} style={{ padding: '4px', width: '80px' }} /> : `+${acc.amount} ج.م`}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {editingId === acc.id ? <input type="text" value={editMonth} onChange={(e) => setEditMonth(e.target.value)} style={{ padding: '4px', width: '90px' }} /> : acc.month}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            {editingId === acc.id ? (
                                                <button onClick={() => handleUpdateAccount(acc.id)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>حفظ</button>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button onClick={() => startEditing(acc)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                                                    <button onClick={() => handleDeleteAccount(acc.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* جدول المصروفات */}
            {!loading && expenses.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '15px', color: '#991b1b', marginBottom: '10px' }}>📑 سجل المصروفات والخصومات:</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#fef2f2', color: '#991b1b' }}>
                                <th style={{ padding: '10px', borderBottom: '2px solid #fecaca' }}>البند</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #fecaca' }}>المبلغ الخصم</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #fecaca' }}>التاريخ</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #fecaca', textAlign: 'center' }}>إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((exp) => (
                                <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{exp.title}</td>
                                    <td style={{ padding: '10px', color: '#dc2626', fontWeight: 'bold' }}>-{exp.amount} ج.م</td>
                                    <td style={{ padding: '10px', color: '#64748b' }}>{exp.date}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            🗑️ حذف
                                        </button>
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