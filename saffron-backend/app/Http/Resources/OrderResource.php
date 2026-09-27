<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'order_number' => $this->order_number,
            'table_number' => $this->table_number,
            'guest_name'   => $this->guest_name,
            'notes'        => $this->notes,
            'subtotal'     => $this->subtotal,
            'total'        => $this->total,
            'status'       => $this->status,
            'created_at'   => $this->created_at?->toIso8601String(),

            'items' => OrderItemResource::collection(
                $this->whenLoaded('items')
            ),
        ];
    }
}