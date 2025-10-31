<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Employee::create([
             'first_name' => 'John',
             'last_name' => 'Doe',
        ]);

         Employee::create([
             'first_name' => 'Lincoln',
             'last_name' => 'John',
        ]);

    }
}
