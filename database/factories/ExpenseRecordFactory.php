<?php

namespace Database\Factories;

use App\Enums\ExpenseCategory;
use App\Enums\ExpenseStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExpenseRecord>
 */
class ExpenseRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount' => fake()->randomFloat(2, 100, 10000),
            'category' => ExpenseCategory::OTHER->value,
            'status' => ExpenseStatus::PENDING->value,
            'remarks' => fake()->optional()->sentence(),
            'payment_method' => 'cash',
            'reference_number' => null,
            'receipt_path' => null,
        ];
    }
}
