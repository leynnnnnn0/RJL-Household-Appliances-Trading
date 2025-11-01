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
        Schema::create('installment_order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('installment_order_id')->constrained();
            $table->integer('installment_number');
            $table->decimal('amount_due', 10, 2);
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->date('due_date');
            $table->string('payment_method')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('status')->default('pending'); // pending, paid, overdue, partial
            $table->dateTime('paid_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installment_order_payments');
    }
};
