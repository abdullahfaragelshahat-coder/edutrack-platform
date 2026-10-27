<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Student;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'group_id' => 'required|exists:groups,id',
                'date' => 'required|date',
                'attendances' => 'required|array',
            ]);

            // حفظ أو تحديث سجل الحضور لكل طالب في نفس التاريخ
            foreach ($request->attendances as $item) {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $item['student_id'],
                        'date' => $request->date,
                    ],
                    [
                        'group_id' => $request->group_id,
                        'status' => $item['status'], // present, absent, late
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'تم حفظ سجل الحضور والغياب بنجاح'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ أثناء الحفظ: ' . $e->getMessage()
            ], 500);
        }
    }

    // دالة تقارير وحساب نسب الحضور والغياب خلال فترة زمنية محددة
    public function report(Request $request)
    {
        try {
            $validated = $request->validate([
                'group_id' => 'required|exists:groups,id',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
            ]);

            $groupId = $request->group_id;
            $startDate = $request->start_date ?? Carbon::now()->startOfMonth()->toDateString();
            $endDate = $request->end_date ?? Carbon::now()->endOfMonth()->toDateString();

            // جلب طلاب المجموعة
            $students = Student::where('group_id', $groupId)->get();

            // إجمالي عدد الحصص المسجلة (أيام الحضور المسجلة) خلال هذه الفترة للمجموعة
            $totalRecordedSessions = Attendance::where('group_id', $groupId)
                ->whereBetween('date', [$startDate, $endDate])
                ->distinct('date')
                ->count('date');

            // جلب سجلات الحضور خلال الفترة
            $attendances = Attendance::where('group_id', $groupId)
                ->whereBetween('date', [$startDate, $endDate])
                ->get()
                ->groupBy('student_id');

            $reportData = $students->map(function ($student) use ($attendances, $totalRecordedSessions) {
                $studentRecords = $attendances[$student->id] ?? collect();
                
                // حساب الحضور (يشمل الحاضر والمتأخر)
                $presentCount = $studentRecords->whereIn('status', ['present', 'late'])->count();
                $absentCount = $studentRecords->where('status', 'absent')->count();

                $totalSessions = $totalRecordedSessions > 0 ? $totalRecordedSessions : 0;
                $percentage = $totalSessions > 0 ? round(($presentCount / $totalSessions) * 100, 1) : 0;

                return [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'total_sessions' => $totalSessions,
                    'percentage' => $percentage,
                ];
            });

            return response()->json([
                'success' => true,
                'total_sessions' => $totalRecordedSessions,
                'data' => $reportData
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب التقرير: ' . $e->getMessage()
            ], 500);
        }
    }
}