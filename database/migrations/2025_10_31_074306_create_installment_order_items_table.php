<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('installment_order_items', function (Blueprint $table) {
            $table->id();
               $table->foreignId('installment_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->string('serial');
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('sale_amount', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installment_order_items');
    }
};
