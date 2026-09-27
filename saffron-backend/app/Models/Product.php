<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'image',
        'price',
        'old_price',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price'       => 'decimal:2',
            'old_price'   => 'decimal:2',
            'is_featured' => 'boolean',
            'is_active'   => 'boolean',
        ];
    }

    // ---------------------------
    // العلاقات
    // ---------------------------

    /**
     * الفئة التي ينتمي إليها المنتج.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

        /**
     * مجموعات الخيارات الخاصة بهذا المنتج.
     */
    public function options(): HasMany
    {
        return $this->hasMany(ProductOption::class);
    }

     public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}