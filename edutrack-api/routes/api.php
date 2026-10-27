<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ExamController; // <-- التصحيح هنا: إضافة Api\ للوصول للكنترولر الصحيح
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\GroupPlanController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\StudentAuthController;

Route::post('/student/login', [StudentAuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('expenses', ExpenseController::class);
});
Route::get('/students/{id}/report', [StudentController::class, 'showReport']);
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('group-plans', GroupPlanController::class);
});
Route::get('/lessons', [LessonController::class, 'index']);
Route::post('/lessons', [LessonController::class, 'store']);
Route::delete('/lessons/{id}', [LessonController::class, 'destroy']);
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('accounts', AccountController::class);
});
/*
|--------------------------------------------------------------------------
| API Routes - EduTrack System
|--------------------------------------------------------------------------
*/

// مسار اختباري للتحقق من عمل الـ API
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'EduTrack API is working',
    ]);
});

// مسارات المصادقة العامة (تسجيل الدخول وإنشاء حساب)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// المسارات المحمية بواسطة Sanctum للمستخدمين المسجلين دخولاً
Route::middleware('auth:sanctum')->group(function () {
    
    // معلومات المستخدم الحالي وتسجيل الخروج
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // لوحة التحكم والاحصائيات
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // المجموعات: عرض القائمة وتفاصيل مجموعة
    Route::get('/groups', [GroupController::class, 'index']);
    Route::get('/groups/{group}', [GroupController::class, 'show']);

    // الطلاب: عرض القائمة والتقدم
    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/{student}', [StudentController::class, 'show']);
    Route::get('/students/{id}/progress', [StudentController::class, 'progress']);

    // الحسابات: عرض
    Route::get('/accounts', [AccountController::class, 'index']);

    // العمليات الخاصة بصلاحية المعلم فقط (Teacher Role)
    Route::middleware('role:teacher')->group(function () {
        
        // إدارة الطلاب (إضافة، تعديل، حذف)
        Route::post('/students', [StudentController::class, 'store']);
        Route::put('/students/{student}', [StudentController::class, 'update']);
        Route::delete('/students/{student}', [StudentController::class, 'destroy']);

        // إدارة المجموعات (إضافة، تعديل، حذف)
        Route::post('/groups', [GroupController::class, 'store']);
        Route::put('/groups/{group}', [GroupController::class, 'update']);
        Route::delete('/groups/{group}', [GroupController::class, 'destroy']);

        // الحضور والغياب (عرض السجلات وتسجيل الحضور)
        Route::get('/attendances', [AttendanceController::class, 'index']);
        Route::post('/attendances', [AttendanceController::class, 'store']);

        // إدارة الحسابات والامتحانات
        Route::post('/accounts', [AccountController::class, 'store']);
        Route::post('/exams', [ExamController::class, 'store']);
    });
});