<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'name_snapshot',
        'price_snapshot',
        'quantity',
        'options_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'price_snapshot'   => 'decimal:2',
            'quantity'         => 'integer',
            'options_snapshot' => 'array',
        ];
    }

    /**
     * الطلب الذي ينتمي إليه هذا العنصر.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * المنتج الأصلي (قد يكون null إذا حُذف).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}