<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // السماح بتنفيذ الطلب حالياً (هنربطه بالصلاحيات لاحقاً)
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:students,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'grade' => ['required', 'string', 'max:100'],
            'group_id' => ['nullable', 'exists:groups,id'],
        ];
    }
}