<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
          $table->string('order_number', 30)->unique();
            $table->string('table_number', 20);
            $table->string('guest_name')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->enum('status', ['pending', 'preparing', 'served', 'cancelled'])
                  ->default('pending');
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('table_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};