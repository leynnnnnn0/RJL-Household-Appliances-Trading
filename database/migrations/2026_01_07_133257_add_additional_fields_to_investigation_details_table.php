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
        Schema::table('investigation_details', function (Blueprint $table) {
            $table->string('id_presented')->nullable();
            $table->string('id_number')->nullable();
            $table->string('civil_status')->nullable();
            $table->string('spouse_name')->nullable();
            $table->string('spouse_contact_number')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investigation_details', function (Blueprint $table) {
            $table->dropColumn([
                'id_presented',
                'id_number',
                'civil_status',
                'spouse_name',
                'spouse_contact_number'
            ]);
        });
    }
};
