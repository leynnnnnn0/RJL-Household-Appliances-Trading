<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            ['name' => 'Warehouse 1', 'address' => '123 Main St, Cityville'],
            ['name' => 'Warehouse 2', 'address' => '456 Branch Ave, Townsville'],
        ];

        foreach ($locations as $location) {
            Location::create([
                'name' => $location['name'],
                'address' => $location['address'],
            ]);
        }
    }
}
