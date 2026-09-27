<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OptionValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'option_id',
        'name',
        'extra_price',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'extra_price' => 'decimal:2',
            'sort_order'  => 'integer',
        ];
    }

    /**
     * المجموعة التي تنتمي إليها هذه القيمة.
     */
    public function option(): BelongsTo
    {
        return $this->belongsTo(ProductOption::class, 'option_id');
    }
}