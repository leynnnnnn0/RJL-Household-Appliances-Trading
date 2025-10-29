<?php

use Carbon\Traits\Timestamp;
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
        Schema::create('orders', function (Blueprint $table) {
           $table->id();
           $table->string('order_number')->unique(); 
           $table->foreignId('location_id')->constrained();
           $table->foreignId('employee_id')->constrained('users');
           $table->decimal('total_price', 10, 2);
           $table->dateTime('transaction_date')->useCurrent();
           $table->boolean('is_void')->default(false);
           $table->text('reason_for_cancellation')->nullable();
           $table->dateTime('void_date')->nullable();
           $table->foreignId('user_id')->nullable()->constrained();
           $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
