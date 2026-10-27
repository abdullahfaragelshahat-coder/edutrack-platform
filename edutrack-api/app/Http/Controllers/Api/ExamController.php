<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'group_id' => 'required|exists:groups,id',
                'title' => 'required|string',
                'max_score' => 'required|numeric',
                'date' => 'required|date',
                'scores' => 'required|array', // مصفوفة تحتوي على student_id و score
            ]);

            // 1. حفظ أو تحديث الامتحان الأساسي في جدول exams
            $exam = Exam::updateOrCreate(
                [
                    'group_id' => $request->group_id,
                    'title' => $request->title,
                ],
                [
                    'max_score' => $request->max_score,
                    'date' => $request->date,
                ]
            );

            // 2. حفظ درجات الطلاب في جدول exam_results المرتبط بالامتحان والطالب
            foreach ($request->scores as $item) {
                DB::table('exam_results')->updateOrInsert(
                    [
                        'exam_id' => $exam->id,
                        'student_id' => $item['student_id'],
                    ],
                    [
                        'score' => $item['score'],
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'تم حفظ ورصد درجات الامتحانات بنجاح'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في السيرفر: ' . $e->getMessage()
            ], 500);
        }
    }
}