<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'title',
        'unit',
        'file_path',
        'video_url',
        'description',
        'pdf_files' // 🔑 إضافة حقل ملفات الـ PDF المتعددة
    ];

    protected $casts = [
        'pdf_files' => 'array', // 🔑 تحويل مصفوفة الملفات تلقائياً من وإلى JSON في قاعدة البيانات
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}