<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $supplier = Supplier::factory()->create();

        return [
            'supplier' => $supplier->slug,
            'location_id' => Location::factory(),
            'item_type' => 'appliance',
            'dr_no' => fake()->optional()->numerify('DR-#####'),
            'description' => fake()->words(3, true),
            'model' => fake()->bothify('MDL-###'),
            'serial' => fake()->unique()->bothify('SN-########'),
            'quantity' => 1,
            'srp' => fake()->randomFloat(2, 1000, 50000),
            'unit_cost' => fake()->randomFloat(2, 500, 40000),
            'date_of_purchase' => fake()->date(),
            'date_out' => null,
            'size' => fake()->optional()->word(),
            'remarks' => fake()->optional()->sentence(),
        ];
    }
}
