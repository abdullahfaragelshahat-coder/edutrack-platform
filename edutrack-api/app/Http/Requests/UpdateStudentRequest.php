<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // بنجيب الid بتاع الطالب من الـ Route
        $studentId = $this->route('student')->id ?? $this->route('student');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'nullable',
                'email',
                Rule::unique('students', 'email')->ignore($studentId),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'grade' => ['sometimes', 'required', 'string', 'max:100'],
            'group_id' => ['nullable', 'exists:groups,id'],
        ];
    }
}