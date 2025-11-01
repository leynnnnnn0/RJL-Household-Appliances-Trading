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
        Schema::create('installment_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained();
            $table->string('order_number')->unique(); 
            $table->foreignId('location_id')->constrained();
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('loan_contract_price', 10, 2);
            $table->decimal('lcp_markup_rate', 10, 2);
            $table->decimal('lcp_additional_charge', 10, 2);
            $table->decimal('down_payment', 10, 2);
            $table->decimal('promisory_note_value', 10, 2);
            $table->integer('number_of_terms');
            $table->decimal('promisory_note_value_interest', 10, 2);
            $table->decimal('promisory_note_value_interest_additional_charge', 10, 2);
            $table->boolean('is_voided')->default(false);
            $table->text('reason_for_cancellation')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('reference_number')->nullable();
            $table->dateTime('transaction_date')->useCurrent();
           $table->dateTime('void_date')->nullable();
           $table->foreignId('voider_id')->nullable()->constrained('users');
           $table->boolean('is_completed')->default(false);
           $table->boolean('is_defaulted')->default(false);
           $table->dateTime('default_date')->nullable();
            $table->foreignId('defaulter_id')->nullable()->constrained('users');
           $table->text('default_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installment_orders');
    }
};
