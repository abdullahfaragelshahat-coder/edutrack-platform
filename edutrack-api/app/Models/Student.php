<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens; // مهم جداً لدعم التوكن وتسجيل دخول الطالب

class Student extends Model
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'parent_phone',
        'group_id',
        'image',
        'code',
        'pin' // 🔑 تم إضافة حقل الـ pin هنا لحل مشكلة عدم الحفظ أو التعديل
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_student', 'student_id', 'exam_id')
                    ->withPivot('score'); // لجلب الدرجة المخزنة في الجدول الوسيط
    }
}

