<?php

namespace App\Http\Requests;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // الحماية عبر middleware
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(Order::statuses())],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'الحالة مطلوبة',
            'status.in'       => 'الحالة غير صحيحة',
        ];
    }
}