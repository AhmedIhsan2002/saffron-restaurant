<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // الزائر مسموح دائمًا
    }

    public function rules(): array
    {
        return [
            'table_number' => ['required', 'string', 'min:1', 'max:20'],
            'guest_name'   => ['nullable', 'string', 'max:100'],
            'notes'        => ['nullable', 'string', 'max:500'],

            'items'                     => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id'        => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'          => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.options'           => ['nullable', 'array'],
            'items.*.options.*.option_id'  => ['required_with:items.*.options', 'integer', 'exists:product_options,id'],
            'items.*.options.*.value_ids'  => ['required_with:items.*.options', 'array', 'min:1'],
            'items.*.options.*.value_ids.*'=> ['integer', 'exists:option_values,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'table_number.required' => 'رقم الطاولة مطلوب',
            'table_number.max'      => 'رقم الطاولة طويل جدًا',
            'items.required'        => 'لا يمكن إرسال طلب بدون عناصر',
            'items.min'             => 'يجب إضافة عنصر واحد على الأقل',
            'items.*.product_id.exists' => 'أحد المنتجات غير موجود',
            'items.*.quantity.min'  => 'الكمية يجب أن تكون 1 على الأقل',
            'items.*.quantity.max'  => 'الكمية كبيرة جدًا',
        ];
    }
}