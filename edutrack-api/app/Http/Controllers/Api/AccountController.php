<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\Student;

class AccountController extends Controller
{
    public function index()
    {
        try {
            $accounts = Account::with('student')->latest()->get();
            return response()->json(['success' => true, 'data' => $accounts], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:students,id',
                'amount'     => 'required|numeric',
                'month'      => 'required|string',
            ]);

            // جلب الطالب لمعرفة مجموعته
            $student = Student::find($validated['student_id']);

            // إذا كان الطالب له مجموعة نأخذها، وإلا نضع القيمة الافتراضية 1 لمنع خطأ قاعدة البيانات
            $groupId = ($student && $student->group_id) ? $student->group_id : 1;

            $account = Account::create([
                'student_id' => $validated['student_id'],
                'group_id'   => $groupId,
                'amount'     => $validated['amount'],
                'month'      => $validated['month'],
            ]);

            $account->load('student');

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الحساب بنجاح',
                'data'    => $account
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في السيرفر: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $account = Account::find($id);
            if (!$account) {
                return response()->json(['success' => false, 'message' => 'غير موجود'], 404);
            }

            $account->update($request->only(['amount', 'month']));
            return response()->json(['success' => true, 'message' => 'تم التحديث بنجاح', 'data' => $account]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $account = Account::find($id);
            if ($account) {
                $account->delete();
                return response()->json(['success' => true, 'message' => 'تم الحذف بنجاح']);
            }
            return response()->json(['success' => false, 'message' => 'غير موجود'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}