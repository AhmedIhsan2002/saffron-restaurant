<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * الحقول القابلة للتعبئة.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * الحقول المخفية عند الإرجاع JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * تحويلات الأنواع.
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}