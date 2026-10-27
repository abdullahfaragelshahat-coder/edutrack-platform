<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;

    protected $table = 'accounts';

    // أضف 'group_id' هنا لكي يسمح لارافيل بحفظه في قاعدة البيانات
    protected $fillable = [
        'student_id',
        'group_id',
        'amount',
        'month'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
