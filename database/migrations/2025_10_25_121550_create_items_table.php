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
             $table->string('category');
            $table->foreign('category')->references('slug')->on('categories')->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->nullable();
            $table->string('dr_no')->nullable();
            $table->string('supplier')->nullable();
            $table->string('description');
            $table->string('model')->nullable();
            $table->string('serial')->unique();
            $table->integer('quantity');
            $table->decimal('srp', 10, 2);
            $table->decimal('unit_cost', 10, 2);
            $table->date('date_of_purchase');
            $table->date('date_out')->nullable();
            $table->string('size')->nullable();
            $table->text('remarks')->nullable();
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
