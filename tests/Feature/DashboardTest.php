<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get(route('dashboard'))->assertOk();
});

test('dashboard counts split cash order payments by actual payment method', function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $role = Role::findOrCreate('super admin');
    $user = User::factory()->create();
    $user->assignRole($role);

    $branch = Branch::factory()->create();
    $order = Order::create([
        'customer_id' => Customer::factory()->create()->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => $branch->id,
        'employee_id' => $user->id,
        'order_number' => 'ORD-DASH-SPLIT',
        'total_price' => 10000,
        'payment_method' => 'Split',
        'transaction_date' => today(),
        'receipt_number' => 'RCPT-DASH-SPLIT',
    ]);

    OrderPayment::create([
        'order_id' => $order->id,
        'payment_method' => 'Cash',
        'amount' => 4000,
    ]);

    OrderPayment::create([
        'order_id' => $order->id,
        'payment_method' => 'Gcash',
        'amount' => 6000,
        'reference_number' => 'GCASH-DASH-1001',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', [
            'from_date' => today()->toDateString(),
            'to_date' => today()->toDateString(),
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('cashCollection', 10000)
            ->where('mops.cash', 4000)
            ->where('mops.gcash', 6000)
            ->where('allTransactions.0.payment_method', 'Split: Cash ₱4,000.00, Gcash ₱6,000.00')
            ->where('allTransactions.0.reference_number', 'GCASH-DASH-1001')
        );
});
