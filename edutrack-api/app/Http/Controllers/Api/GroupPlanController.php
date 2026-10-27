<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GroupPlan;

class GroupPlanController extends Controller
{
    public function index()
    {
        try {
            $plans = GroupPlan::with('group')->get();
            return response()->json(['success' => true, 'data' => $plans], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'group_id' => 'required|exists:groups,id',
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'target_date' => 'nullable|string|max:255'
            ]);

            $plan = GroupPlan::create($validated);
            $plan->load('group');

            return response()->json(['success' => true, 'message' => 'تم إضافة خطة المجموعة بنجاح', 'data' => $plan], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $plan = GroupPlan::find($id);
            if (!$plan) {
                return response()->json(['success' => false, 'message' => 'الخطة غير موجودة'], 404);
            }

            $validated = $request->validate([
                'group_id' => 'required|exists:groups,id',
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'target_date' => 'nullable|string|max:255'
            ]);

            $plan->update($validated);
            $plan->load('group');

            return response()->json(['success' => true, 'message' => 'تم تحديث الخطة بنجاح', 'data' => $plan], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $plan = GroupPlan::find($id);
            if (!$plan) {
                return response()->json(['success' => false, 'message' => 'الخطة غير موجودة'], 404);
            }

            $plan->delete();
            return response()->json(['success' => true, 'message' => 'تم حذف الخطة بنجاح'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}