<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Item;
use App\Models\Location;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsPOSCashier(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('can access cash pos');

    $user = User::factory()->create();
    $user->givePermissionTo('can access cash pos');

    test()->actingAs($user);

    return $user;
}

function availablePOSCashItem(array $overrides = []): Item
{
    return Item::factory()->create(array_merge([
        'item_type' => 'appliances',
        'description' => 'POS Cash Test Item',
        'model' => fake()->unique()->bothify('POS-MDL-####'),
        'serial' => fake()->unique()->bothify('POS-SN-####'),
        'quantity' => 1,
        'srp' => 10000,
        'unit_cost' => 7000,
        'date_out' => null,
    ], $overrides));
}

function validPOSCashPayload(array $overrides = []): array
{
    Location::factory()->create();

    $branch = Branch::factory()->create();
    $employee = User::factory()->create();
    $item = availablePOSCashItem([
        'srp' => 15000,
    ]);

    return array_merge([
        'location_id' => $branch->id,
        'employee_id' => $employee->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'address' => '123 Rizal Street',
        'city' => 'Balanga',
        'province' => 'Bataan',
        'zipcode' => '2100',
        'country' => 'PHILIPPINES',
        'email' => 'juan@example.com',
        'phone' => '09171234567',
        'payment_method' => 'Cash',
        'reference_number' => null,
        'receipt_number' => 'RCPT-POS-CASH-001',
        'orders' => [
            [
                'id' => $item->id,
                'serial' => $item->serial,
                'sale_amount' => 12500,
            ],
        ],
        'total_price' => 12500,
    ], $overrides);
}

it('renders the cash POS page with branches, employees, and only today transactions for the cashier', function () {
    $cashier = actingAsPOSCashier();
    $branch = Branch::factory()->create();
    $customer = Customer::factory()->create();

    $todayOrder = Order::create([
        'customer_id' => $customer->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => $branch->id,
        'employee_id' => $cashier->id,
        'order_number' => 'ORD-INDEX-TODAY',
        'total_price' => 5000,
        'payment_method' => 'Cash',
        'transaction_date' => now(),
        'receipt_number' => 'RCPT-INDEX-TODAY',
    ]);

    Order::create([
        'customer_id' => $customer->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => $branch->id,
        'employee_id' => User::factory()->create()->id,
        'order_number' => 'ORD-INDEX-OTHER',
        'total_price' => 7000,
        'payment_method' => 'Cash',
        'transaction_date' => now(),
        'receipt_number' => 'RCPT-INDEX-OTHER',
    ]);

    Order::create([
        'customer_id' => $customer->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => $branch->id,
        'employee_id' => $cashier->id,
        'order_number' => 'ORD-INDEX-YESTERDAY',
        'total_price' => 9000,
        'payment_method' => 'Cash',
        'transaction_date' => now()->subDay(),
        'receipt_number' => 'RCPT-INDEX-YESTERDAY',
    ]);

    $this->get(route('pos-cash.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('POSCash/Index')
            ->has('locations')
            ->has('employees')
            ->has('transactions', 1)
            ->where('transactions.0.id', $todayOrder->id)
        );
});

it('stores a cash order with one item and new customer information', function () {
    actingAsPOSCashier();

    $payload = validPOSCashPayload();

    $this->post(route('pos-cash.store'), $payload)
        ->assertOk()
        ->assertSessionHasNoErrors();

    $order = Order::with(['customer', 'order_items'])->firstOrFail();

    expect($order->order_number)->toBe('ORD-'.now()->format('Ymd').'-0001')
        ->and($order->customer->first_name)->toBe('Juan')
        ->and($order->customer->last_name)->toBe('Dela Cruz')
        ->and($order->customer->phone_number)->toBe('09171234567')
        ->and($order->payment_method)->toBe('Cash')
        ->and($order->reference_number)->toBeNull()
        ->and($order->receipt_number)->toBe('RCPT-POS-CASH-001')
        ->and($order->total_price)->toEqual(12500)
        ->and($order->order_items)->toHaveCount(1);

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'item_id' => $payload['orders'][0]['id'],
        'serial' => $payload['orders'][0]['serial'],
        'sale_amount' => 12500,
        'discount_amount' => 2500,
    ]);

    $this->assertDatabaseHas('items', [
        'id' => $payload['orders'][0]['id'],
        'date_out' => now()->startOfDay()->toDateTimeString(),
    ]);
});

it('stores a cash order with multiple items and increments order numbers', function () {
    actingAsPOSCashier();

    $firstPayload = validPOSCashPayload([
        'receipt_number' => 'RCPT-POS-CASH-FIRST',
    ]);

    $this->post(route('pos-cash.store'), $firstPayload)->assertOk();

    $itemA = availablePOSCashItem([
        'serial' => 'POS-CASH-MULTI-A',
        'srp' => 8000,
    ]);
    $itemB = availablePOSCashItem([
        'serial' => 'POS-CASH-MULTI-B',
        'srp' => 12000,
    ]);

    $payload = validPOSCashPayload([
        'receipt_number' => 'RCPT-POS-CASH-MULTI',
        'orders' => [
            [
                'id' => $itemA->id,
                'serial' => $itemA->serial,
                'sale_amount' => 7500,
            ],
            [
                'id' => $itemB->id,
                'serial' => $itemB->serial,
                'sale_amount' => 11000,
            ],
        ],
        'total_price' => 18500,
    ]);

    $this->post(route('pos-cash.store'), $payload)
        ->assertOk()
        ->assertSessionHasNoErrors();

    $order = Order::where('receipt_number', 'RCPT-POS-CASH-MULTI')
        ->with('order_items')
        ->firstOrFail();

    expect($order->order_number)->toBe('ORD-'.now()->format('Ymd').'-0002')
        ->and($order->order_items)->toHaveCount(2)
        ->and((float) $order->order_items->sum('sale_amount'))->toBe(18500.0);

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'item_id' => $itemA->id,
        'discount_amount' => 500,
        'sale_amount' => 7500,
    ]);

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'item_id' => $itemB->id,
        'discount_amount' => 1000,
        'sale_amount' => 11000,
    ]);

    expect($itemA->fresh()->date_out)->toBe(now()->startOfDay()->toDateTimeString())
        ->and($itemB->fresh()->date_out)->toBe(now()->startOfDay()->toDateTimeString());
});

it('stores a free item order with zero sale amount and full discount', function () {
    actingAsPOSCashier();

    $item = availablePOSCashItem([
        'serial' => 'POS-CASH-FREE',
        'srp' => 4500,
    ]);

    $payload = validPOSCashPayload([
        'receipt_number' => 'RCPT-POS-CASH-FREE',
        'orders' => [
            [
                'id' => $item->id,
                'serial' => $item->serial,
                'sale_amount' => 0,
            ],
        ],
        'total_price' => 0,
    ]);

    $this->post(route('pos-cash.store'), $payload)
        ->assertOk()
        ->assertSessionHasNoErrors();

    $order = Order::where('receipt_number', 'RCPT-POS-CASH-FREE')->firstOrFail();

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'item_id' => $item->id,
        'sale_amount' => 0,
        'discount_amount' => 4500,
    ]);
});

it('updates an existing customer when existing customer information is submitted', function () {
    actingAsPOSCashier();

    $customer = Customer::factory()->create([
        'first_name' => 'Old',
        'last_name' => 'Customer',
        'phone_number' => '09170000000',
    ]);

    $payload = validPOSCashPayload([
        'existing_customer_id' => $customer->id,
        'first_name' => 'Updated',
        'last_name' => 'Customer',
        'phone' => '09179999999',
        'email' => 'updated@example.com',
        'address' => 'Updated Address',
        'receipt_number' => 'RCPT-POS-CASH-EXISTING',
    ]);

    $this->post(route('pos-cash.store'), $payload)
        ->assertOk()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseCount('customers', 1);
    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'first_name' => 'Updated',
        'last_name' => 'Customer',
        'phone_number' => '09179999999',
        'email' => 'updated@example.com',
        'address' => 'Updated Address',
    ]);

    $this->assertDatabaseHas('orders', [
        'customer_id' => $customer->id,
        'receipt_number' => 'RCPT-POS-CASH-EXISTING',
    ]);
});

it('requires payment information and a reference number for non-cash payments', function () {
    actingAsPOSCashier();

    $this->from(route('pos-cash.index'))
        ->post(route('pos-cash.store'), validPOSCashPayload([
            'payment_method' => 'Gcash',
            'reference_number' => null,
        ]))
        ->assertSessionHasErrors('reference_number');

    $this->post(route('pos-cash.store'), validPOSCashPayload([
        'payment_method' => 'Gcash',
        'reference_number' => 'GCASH-REF-1001',
        'receipt_number' => 'RCPT-POS-CASH-GCASH',
    ]))
        ->assertOk()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('orders', [
        'payment_method' => 'Gcash',
        'reference_number' => 'GCASH-REF-1001',
        'receipt_number' => 'RCPT-POS-CASH-GCASH',
    ]);
});

it('validates required customer, location, employee, order, total, and receipt fields', function () {
    actingAsPOSCashier();

    $this->from(route('pos-cash.index'))
        ->post(route('pos-cash.store'), [])
        ->assertSessionHasErrors([
            'first_name',
            'last_name',
            'address',
            'city',
            'province',
            'country',
            'payment_method',
            'location_id',
            'employee_id',
            'orders',
            'total_price',
            'receipt_number',
        ]);
});

it('validates phone number format and unique receipt numbers', function () {
    actingAsPOSCashier();

    Order::create([
        'customer_id' => Customer::factory()->create()->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
        'employee_id' => User::factory()->create()->id,
        'order_number' => 'ORD-DUPLICATE-RECEIPT',
        'total_price' => 1000,
        'payment_method' => 'Cash',
        'transaction_date' => now(),
        'receipt_number' => 'RCPT-DUPLICATE',
    ]);

    $this->from(route('pos-cash.index'))
        ->post(route('pos-cash.store'), validPOSCashPayload([
            'phone' => '12345',
            'receipt_number' => 'RCPT-DUPLICATE',
        ]))
        ->assertSessionHasErrors(['phone', 'receipt_number']);
});

it('rolls back the order when an item is already unavailable', function () {
    actingAsPOSCashier();

    $item = availablePOSCashItem([
        'serial' => 'POS-CASH-UNAVAILABLE',
        'date_out' => now()->subDay()->toDateString(),
    ]);

    $payload = validPOSCashPayload([
        'receipt_number' => 'RCPT-POS-CASH-UNAVAILABLE',
        'orders' => [
            [
                'id' => $item->id,
                'serial' => $item->serial,
                'sale_amount' => 3000,
            ],
        ],
        'total_price' => 3000,
    ]);

    $this->from(route('pos-cash.index'))
        ->post(route('pos-cash.store'), $payload)
        ->assertSessionHasErrors('error');

    $this->assertDatabaseMissing('orders', [
        'receipt_number' => 'RCPT-POS-CASH-UNAVAILABLE',
    ]);

    $this->assertDatabaseMissing('order_items', [
        'item_id' => $item->id,
        'sale_amount' => 3000,
    ]);
});
