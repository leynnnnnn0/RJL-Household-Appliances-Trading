<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'User',
                'phone_number' => '09899887676',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            RoleAndPermissionSeeder::class,
            SupplierSeeder::class,
            LocationSeeder::class,
            ItemSeeder::class,
            // OrderSeeder::class,
            EmployeeSeeder::class,
            InstallmentOrderSeeder::class
        ]);
    }
}
