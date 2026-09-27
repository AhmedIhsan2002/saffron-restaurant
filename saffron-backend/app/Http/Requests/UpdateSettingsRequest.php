<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings'                  => ['required', 'array', 'min:1'],
            'settings.*.key'            => ['required', 'string', 'max:100'],
            'settings.*.value'          => ['nullable'],
            'settings.*.type'           => ['required', 'in:string,integer,boolean,json'],
            'settings.*.group'          => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'settings.required' => 'لا توجد إعدادات للتحديث',
            'settings.*.key.required' => 'مفتاح الإعداد مطلوب',
            'settings.*.type.in' => 'نوع الإعداد غير صحيح',
        ];
    }
}