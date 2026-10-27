<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Student;

class StudentController extends Controller
{
    /**
     * عرض قائمة الطلاب مع جلب بيانات المجموعة
     */
    public function index(Request $request)
    {
        try {
            $query = Student::with('group');

            if ($request->has('group_id') && !empty($request->group_id)) {
                $query->where('group_id', $request->group_id);
            }

            $students = $query->get();

            return response()->json([
                'success' => true,
                'students' => $students,
                'data' => $students
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض بيانات طالب معين مع مجموعته
     */
    public function show($id)
    {
        try {
            $student = Student::with('group')->find($id);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'الطالب غير موجود'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'student' => $student,
                'data' => $student
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في السيرفر: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب سجل نشاط الطالب (بياناته، درجات الامتحانات، وسجل الحضور)
     */
    public function progress($id)
    {
        try {
            $student = Student::find($id);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'الطالب غير موجود'
                ], 404);
            }

            try {
                $student->load('group');
            } catch (\Exception $e) {}

            // جلب الامتحانات من جدول exam_results و exams
            $exams = [];
            try {
                if (Schema::hasTable('exams') && Schema::hasTable('exam_results')) {
                    $dbExams = DB::table('exam_results')
                        ->join('exams', 'exam_results.exam_id', '=', 'exams.id')
                        ->where('exam_results.student_id', $id)
                        ->select('exams.id', 'exams.title', 'exams.max_score', 'exams.date', 'exam_results.score')
                        ->get();

                    $exams = $dbExams->map(function($exam) {
                        return [
                            'id' => $exam->id,
                            'title' => $exam->title,
                            'exam_name' => $exam->title,
                            'score' => $exam->score,
                            'max_score' => $exam->max_score,
                            'total_marks' => $exam->max_score,
                            'date' => $exam->date
                        ];
                    });
                }
            } catch (\Exception $e) {
                $exams = [];
            }

            // جلب الحضور والغياب
            $attendances = [];
            try {
                if (Schema::hasTable('attendances')) {
                    $attendances = DB::table('attendances')->where('student_id', $id)->orderBy('date', 'desc')->get();
                }
            } catch (\Exception $e) {
                $attendances = [];
            }

            return response()->json([
                'success' => true,
                'student' => $student,
                'exams' => $exams,
                'attendances' => $attendances
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في السيرفر: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إضافة طالب جديد (شاملة حفظ الرقم السري PIN)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:255',
                'parent_phone' => 'nullable|string|max:255',
                'group_id' => 'required|exists:groups,id',
                'grade' => 'nullable|string|max:255',
                'pin' => 'nullable|string|max:255', // استقبال الرقم السري (PIN)
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048' // التحقق من صورة الطالب
            ]);

            // رفع وحفظ الصورة إذا تم اختيارها
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('students', 'public');
                $validated['image'] = $imagePath;
            }

            $student = Student::create($validated);
            $student->load('group');

            return response()->json(['success' => true, 'message' => 'تم إضافة الطالب بنجاح', 'data' => $student], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * تحديث بيانات طالب
     */
    public function update(Request $request, $id)
    {
        try {
            $student = Student::find($id);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'الطالب غير موجود'
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'nullable|string|max:255',
                'parent_phone' => 'nullable|string|max:255',
                'group_id' => 'sometimes|exists:groups,id',
                'grade' => 'nullable|string|max:255',
                'pin' => 'nullable|string|max:255',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($request->hasFile('image')) {
                if ($student->image) {
                    Storage::disk('public')->delete($student->image);
                }
                $validated['image'] = $request->file('image')->store('students', 'public');
            }

            $student->update($validated);
            $student->load('group');

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث بيانات الطالب بنجاح',
                'data' => $student
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف طالب (باستخدام ID)
     */
    public function destroy($id)
    {
        try {
            $student = Student::find($id);

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'الطالب غير موجود'
                ], 404);
            }

            if ($student->image) {
                Storage::disk('public')->delete($student->image);
            }

            $student->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الطالب بنجاح'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في الحذف: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض تقرير الطالب
     */
    public function showReport($id)
    {
        try {
            $student = Student::with('group')->find($id);

            if (!$student) {
                return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
            }

            // قراءة سجلات الحضور والدرجات إن وجدت بآمان
            $attendances = method_exists($student, 'attendances') ? $student->attendances : collect([]);
            $grades = method_exists($student, 'grades') ? $student->grades : collect([]);

            $totalDays = $attendances->count();
            $attendedDays = $attendances->where('status', 'present')->count();
            $attendancePercentage = $totalDays > 0 ? round(($attendedDays / $totalDays) * 100) : 100;

            $totalScore = $grades->sum('score');
            $maxPossibleScore = $grades->sum('max_score');
            $overallPercentage = $maxPossibleScore > 0 ? round(($totalScore / $maxPossibleScore) * 100) : 100;

            $rating = 'ممتاز 🌟';
            if ($maxPossibleScore > 0) {
                if ($overallPercentage >= 90) $rating = 'ممتاز 🌟';
                elseif ($overallPercentage >= 80) $rating = 'جيد جداً 👍';
                elseif ($overallPercentage >= 65) $rating = 'جيد 👏';
                else $rating = 'يحتاج متابعة ⚠️';
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'student' => $student,
                    'attendance' => [
                        'total_days' => $totalDays,
                        'present_days' => $attendedDays,
                        'absent_days' => $totalDays - $attendedDays,
                        'percentage' => $attendancePercentage . '%'
                    ],
                    'academic' => [
                        'overall_percentage' => $overallPercentage . '%',
                        'rating' => $rating,
                        'grades_list' => $grades
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * تسجيل دخول الطالب (عبر رقم الهاتف ورقم الـ PIN)
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'phone' => 'required|string',
                'pin' => 'required|string',
            ]);

            $student = Student::where('phone', $request->phone)->first();

            if (!$student || $student->pin !== $request->pin) {
                return response()->json([
                    'success' => false,
                    'message' => 'رقم الهاتف أو الرقم السري غير صحيح'
                ], 422);
            }

            $token = method_exists($student, 'createToken') 
                ? $student->createToken('student_auth_token')->plainTextToken 
                : null;

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الدخول بنجاح',
                'data' => [
                    'student' => $student,
                    'token' => $token,
                ],
                'token' => $token
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تسجيل الدخول: ' . $e->getMessage()
            ], 500);
        }
    }
}