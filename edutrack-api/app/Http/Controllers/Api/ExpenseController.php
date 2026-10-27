<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expense;

class ExpenseController extends Controller
{
    public function index()
    {
        try {
            $expenses = Expense::latest()->get();
            return response()->json(['success' => true, 'data' => $expenses], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title'  => 'required|string',
                'amount' => 'required|numeric',
                'date'   => 'required|string',
                'notes'  => 'nullable|string'
            ]);

            $expense = Expense::create($validated);
            return response()->json(['success' => true, 'message' => 'تم إضافة المصروف بنجاح', 'data' => $expense], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'خطأ في السيرفر: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $expense = Expense::find($id);
            if ($expense) {
                $expense->delete();
                return response()->json(['success' => true, 'message' => 'تم حذف المصروف بنجاح']);
            }
            return response()->json(['success' => false, 'message' => 'غير موجود'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
