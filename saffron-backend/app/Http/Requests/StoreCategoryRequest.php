<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('id'); // عند التعديل

        return [
            'name'       => ['required', 'string', 'min:2', 'max:100'],
            'slug'       => [
                'required', 'string', 'max:100', 'alpha_dash',
                Rule::unique('categories', 'slug')->ignore($categoryId),
            ],
            'image'      => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active'  => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم الفئة مطلوب',
            'name.min'      => 'اسم الفئة قصير جدًا',
            'slug.required' => 'المعرّف (slug) مطلوب',
            'slug.alpha_dash' => 'المعرّف يقبل أحرفًا إنجليزية وأرقامًا وشرطات فقط',
            'slug.unique'   => 'هذا المعرّف مستخدم مسبقًا',
        ];
    }
}