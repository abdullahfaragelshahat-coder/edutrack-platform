<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Group;

class GroupController extends Controller
{
    public function index()
    {
        try {
            $groups = Group::all();
            return response()->json([
                'success' => true,
                'data' => $groups
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255'
            ]);

            $group = Group::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء المجموعة بنجاح',
                'group' => $group
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في الحفظ: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $group = Group::find($id);

            if (!$group) {
                return response()->json([
                    'success' => false,
                    'message' => 'المجموعة غير موجودة'
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255'
            ]);

            $group->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث المجموعة بنجاح',
                'group' => $group
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في التحديث: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $group = Group::find($id);

            if (!$group) {
                return response()->json([
                    'success' => false,
                    'message' => 'المجموعة غير موجودة'
                ], 404);
            }

            $group->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف المجموعة بنجاح'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في الحذف: ' . $e->getMessage()
            ], 500);
        }
    }
}