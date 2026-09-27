<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
       return [
        'id'         => $this->id,
        'name'       => $this->name,
        'slug'       => $this->slug,
        'image'      => $this->mediaUrl($this->image),
        'sort_order' => $this->sort_order,
        'is_active'  => $this->is_active,

        'products_count' => $this->whenCounted('products'),
    ];
    }

    private function mediaUrl(?string $value): ?string
    {
        if (!$value || preg_match('/^https?:\\/\\//i', $value)) return $value;
        return url('storage/' . ltrim($value, '/'));
    }
}
