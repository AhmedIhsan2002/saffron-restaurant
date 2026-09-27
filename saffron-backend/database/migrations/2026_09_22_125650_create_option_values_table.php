<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('option_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('option_id')
                  ->constrained('product_options')
                  ->cascadeOnDelete();
            $table->string('name');
            $table->decimal('extra_price', 10, 2)->default(0);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['option_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('option_values');
    }
};