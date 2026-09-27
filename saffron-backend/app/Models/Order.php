<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'public_token',
        'table_number',
        'guest_name',
        'notes',
        'subtotal',
        'total',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'total'    => 'decimal:2',
        ];
    }

    // ---------------------------
    // الحالات
    // ---------------------------

    /**
     * الحالات المسموحة.
     * نُعرِّفها كثوابت لتفادي الأخطاء المطبعية.
     */
    public const STATUS_PENDING   = 'pending';
    public const STATUS_PREPARING = 'preparing';
    public const STATUS_SERVED    = 'served';
    public const STATUS_CANCELLED = 'cancelled';

    /**
     * قائمة الحالات كاملة.
     */
    public static function statuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_PREPARING,
            self::STATUS_SERVED,
            self::STATUS_CANCELLED,
        ];
    }

    // ---------------------------
    // العلاقات
    // ---------------------------

    /**
     * عناصر الطلب.
     * سنُعرّفها فعليًا في الجزء 2.7.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
