<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use App\Models\Student;
use App\Models\Group;
use App\Models\Attendance;

class DashboardController extends Controller
{
    public function stats()
    {
        try {
            // فحص هل الجداول موجودة في قاعدة البيانات قبل العد لتجنب أي خطأ 500
            $totalStudents = Schema::hasTable('students') ? Student::count() : 0;
            $totalGroups = Schema::hasTable('groups') ? Group::count() : 0;
            
            $totalAttendances = Schema::hasTable('attendances') ? Attendance::count() : 0;
            $presentAttendances = Schema::hasTable('attendances') ? Attendance::where('status', 'present')->count() : 0;
            $attendanceRate = $totalAttendances > 0 ? round(($presentAttendances / $totalAttendances) * 100) : 0;

            return response()->json([
                'success' => true,
                'total_students' => $totalStudents,
                'total_groups' => $totalGroups,
                'attendance_rate' => $attendanceRate
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'total_students' => 0,
                'total_groups' => 0,
                'attendance_rate' => 0
            ], 200);
        }
    }
}