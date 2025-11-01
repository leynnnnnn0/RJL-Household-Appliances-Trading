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
        Schema::create('installment_order_payment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
          $table->foreignIdFor(\App\Models\InstallmentOrderPayment::class, 'payment_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('amount', 10, 2);
            $table->string('payment_method');
            $table->string('reference_number')->nullable();
            $table->dateTime('paid_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installment_order_payment_histories');
    }
};
