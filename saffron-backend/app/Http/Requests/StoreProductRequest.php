<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('id');

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name'        => ['required', 'string', 'min:2', 'max:150'],
            'slug'        => [
                'required', 'string', 'max:150', 'alpha_dash',
                Rule::unique('products', 'slug')->ignore($productId),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'image'       => ['nullable', 'string', 'max:255'],
            'price'       => ['required', 'numeric', 'min:0', 'max:99999999'],
            'old_price'   => ['nullable', 'numeric', 'min:0', 'max:99999999', 'gte:price'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active'   => ['nullable', 'boolean'],

            // الخيارات
            'options'                => ['nullable', 'array', 'max:20'],
            'options.*.name'         => ['required', 'string', 'min:1', 'max:100'],
            'options.*.type'         => ['required', Rule::in(['single', 'multiple'])],
            'options.*.is_required'  => ['nullable', 'boolean'],
            'options.*.sort_order'   => ['nullable', 'integer', 'min:0', 'max:999'],
            'options.*.values'       => ['required', 'array', 'min:1', 'max:50'],
            'options.*.values.*.name'        => ['required', 'string', 'min:1', 'max:100'],
            'options.*.values.*.extra_price' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'options.*.values.*.sort_order'  => ['nullable', 'integer', 'min:0', 'max:999'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'الفئة مطلوبة',
            'category_id.exists'   => 'الفئة غير موجودة',
            'name.required'        => 'اسم المنتج مطلوب',
            'slug.required'        => 'المعرّف (slug) مطلوب',
            'slug.alpha_dash'      => 'المعرّف يقبل أحرفًا إنجليزية وأرقامًا وشرطات فقط',
            'slug.unique'          => 'هذا المعرّف مستخدم مسبقًا',
            'price.required'       => 'السعر مطلوب',
            'price.numeric'        => 'السعر يجب أن يكون رقمًا',
            'old_price.gte'        => 'السعر القديم يجب أن يكون أكبر من أو يساوي السعر الحالي',
            'options.*.name.required'      => 'اسم الخيار مطلوب',
            'options.*.type.in'            => 'نوع الخيار غير صحيح',
            'options.*.values.required'    => 'كل خيار يجب أن يحتوي على قيمة واحدة على الأقل',
            'options.*.values.*.name.required' => 'اسم القيمة مطلوب',
        ];
    }
}