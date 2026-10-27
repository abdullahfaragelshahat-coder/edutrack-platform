<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Lesson;

class StudentAuthController extends Controller
{
    public function login(Request $request)
{
    $request->validate([
        'phone' => 'required|string',
        'pin_code' => 'required|string', // إضافة التحقق من الرقم السري
    ]);

    $student = Student::with(['group', 'attendances'])
        ->where('phone', $request->phone)
        ->where('pin_code', $request->pin_code) // التأكد من تطابق الرقم السري
        ->first();

    if (!$student) {
        return response()->json([
            'success' => false,
            'message' => 'رقم الهاتف أو الرقم السري غير صحيح'
        ], 401);
    }

    $lessons = Lesson::where('group_id', $student->group_id)->latest()->get();

    return response()->json([
        'success' => true,
        'message' => 'تم تسجيل الدخول بنجاح',
        'student' => $student,
        'lessons' => $lessons
    ], 200);
}
}