<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'image'       => $this->mediaUrl($this->image),
            'price'       => $this->price,
            'old_price'   => $this->old_price,
            'is_featured' => $this->is_featured,
            'is_active'   => $this->is_active,

            // نُضمّن الفئة فقط عند تحميلها
            'category'    => new CategoryResource(
                $this->whenLoaded('category')
            ),

            // نُضمّن الخيارات فقط عند طلبها
            'options'     => ProductOptionResource::collection(
                $this->whenLoaded('options')
            ),
        ];
    }

    private function mediaUrl(?string $value): ?string
    {
        if (!$value || preg_match('/^https?:\\/\\//i', $value)) return $value;
        return url('storage/' . ltrim($value, '/'));
    }
}
