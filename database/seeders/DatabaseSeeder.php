<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::firstOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'phone_number' => '09899887676',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $role = Role::create(['name' => 'super admin']);
        $permission = Permission::create(['name' => 'can access roles']);
        $role->givePermissionTo($permission);
        $user->syncRoles([$role->id]);

          $user = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'first_name' => 'admin',
                'last_name' => 'admin',
                'phone_number' => '09879887676',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $role = Role::create(['name' => 'admin']);
        $user->syncRoles([$role->id]);


         $user = User::firstOrCreate(
            ['email' => 'cashier@gmail.com'],
            [
                'first_name' => 'cashier',
                'last_name' => 'cashier',
                'phone_number' => '09879827676',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $role = Role::create(['name' => 'cashier']);
        $user->syncRoles([$role->id]);

         $user = User::firstOrCreate(
            ['email' => 'inventory_manager@gmail.com'],
            [
                'first_name' => 'inventory',
                'last_name' => 'manager',
                'phone_number' => '09879827672',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $role = Role::create(['name' => 'inventory_manager']);
        $user->syncRoles([$role->id]);
        
        

        

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
