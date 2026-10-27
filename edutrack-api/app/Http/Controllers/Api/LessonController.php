<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Lesson;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class LessonController extends Controller
{
    public function index()
    {
        try {
            if (!Schema::hasTable('lessons')) {
                return response()->json(['success' => true, 'data' => []], 200);
            }

            $lessons = Lesson::with('group')->get();
            return response()->json(['success' => true, 'data' => $lessons], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
{
    // ... التحقق من البيانات
    
    $pdfData = [];
    if ($request->hasFile('pdf_files')) {
        foreach ($request->file('pdf_files') as $file) {
            $originalName = $file->getClientOriginalName(); // الحصول على الاسم الأصلي للملف
            $path = $file->store('lessons', 'public'); // تخزين الملف
            
            // تخزين المسار والاسم الأصلي معاً
            $pdfData[] = [
                'path' => $path,
                'name' => $originalName
            ];
        }
    }

    // حفظ البيانات في قاعدة البيانات (تأكد أن الحقل يدعم تخزين مصفوفة JSON)
    $lesson = Lesson::create([
        'title' => $request->title,
        'unit' => $request->unit,
        'group_id' => $request->group_id,
        'video_url' => $request->video_url,
        'pdf_files' => json_encode($pdfData), // حفظ كـ JSON يحتوي على المسار والاسم الأصلي
    ]);

    return response()->json(['success' => true, 'message' => 'تم الحفظ بنجاح', 'data' => $lesson]);
}
    public function destroy($id)
    {
        try {
            $lesson = Lesson::find($id);
            if (!$lesson) {
                return response()->json(['success' => false, 'message' => 'الدرس غير موجود'], 404);
            }

            // حذف جميع ملفات الـ PDF المتعددة المرتبطة بالدرس من السيرفر
            if ($lesson->pdf_files) {
                $pdfList = is_string($lesson->pdf_files) ? json_decode($lesson->pdf_files, true) : $lesson->pdf_files;
                if (is_array($pdfList)) {
                    foreach ($pdfList as $path) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            // حذف الملف القديم إن وجد للاحتياط
            if ($lesson->file_path) {
                Storage::disk('public')->delete($lesson->file_path);
            }

            $lesson->delete();

            return response()->json(['success' => true, 'message' => 'تم حذف الدرس وملفاته بنجاح'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}