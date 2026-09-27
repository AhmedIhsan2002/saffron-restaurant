<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'product_id'       => $this->product_id,
            'name'             => $this->name_snapshot,
            'price'            => $this->price_snapshot,
            'quantity'         => $this->quantity,
            'options'          => $this->options_snapshot,
            'line_total'       => $this->calculateLineTotal(),
        ];
    }

    /**
     * حساب سعر السطر (يُستخدم للعرض فقط، القيمة الحقيقية محسوبة في الخادم عند الإنشاء).
     */
    private function calculateLineTotal(): string
    {
        $optionsSum = collect($this->options_snapshot ?? [])
            ->sum(fn ($o) => (float) $o['extra_price']);

        $unit = (float) $this->price_snapshot + $optionsSum;

        return number_format($unit * $this->quantity, 2, '.', '');
    }
}