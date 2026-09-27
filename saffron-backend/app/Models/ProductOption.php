<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'type',
        'is_required',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'sort_order'  => 'integer',
        ];
    }

    // ---------------------------
    // العلاقات
    // ---------------------------

    /**
     * المنتج الذي تنتمي إليه هذه المجموعة.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * قيم هذه المجموعة (صغير، وسط، كبير...).
     * سنُعرفها فعليًا في الجزء 2.5.
     */
    public function values(): HasMany
    {
        return $this->hasMany(OptionValue::class, 'option_id');
    }
}