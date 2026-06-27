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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('supplier');
            $table->foreign('supplier')->references('slug')->on('suppliers');
            $table->foreignId('location_id')
                ->constrained()
                ->restrictOnDelete();
            $table->string('item_type');
            $table->string('dr_no')->nullable();
            $table->string('description');
            $table->string('model');
            $table->string('serial')->unique();
            $table->integer('quantity');
            $table->decimal('srp', 10, 2);
            $table->decimal('unit_cost', 10, 2);
            $table->date('date_of_purchase');
            $table->date('date_out')->nullable();
            $table->string('size')->nullable();
            $table->text('remarks')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
