<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $fillable = ['name', 'subject'];

    // العلاقة: المجموعة تضم عدة طلاب
    public function students()
    {
        return $this->hasMany(Student::class);
    }
    public function attendances()
{
    return $this->hasMany(Attendance::class);
}
}
