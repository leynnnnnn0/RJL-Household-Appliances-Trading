<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdditionalDocument>
 */
class AdditionalDocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'file_name' => fake()->word().'.pdf',
            'file_path' => 'customer-documents/'.fake()->uuid().'.pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
        ];
    }
}
