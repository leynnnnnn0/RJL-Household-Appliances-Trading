<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InvestigationDetail>
 */
class InvestigationDetailFactory extends Factory
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
            'employee_id' => Employee::factory(),
            'home_visit_date' => fake()->date(),
            'is_employment_verified' => fake()->boolean(),
            'investigation_notes' => fake()->sentence(),
            'id_presented' => fake()->optional()->randomElement(['Driver License', 'Passport', 'National ID']),
            'id_number' => fake()->optional()->bothify('ID-#######'),
            'civil_status' => fake()->optional()->randomElement(['Single', 'Married']),
            'spouse_name' => fake()->optional()->name(),
            'spouse_contact_number' => fake()->optional()->numerify('09#########'),
        ];
    }
}
