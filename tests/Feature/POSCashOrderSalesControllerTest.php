<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Item;
use App\Models\Location;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsPOSCashOrderSalesUser(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('can view cash orders sales');

    $user = User::factory()->create();
    $user->givePermissionTo('can view cash orders sales');

    test()->actingAs($user);

    return $user;
}

function createPOSCashSalesOrder(array $overrides = [], array $items = []): Order
{
    $attributes = array_merge([
        'customer_id' => Customer::factory()->create()->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
        'employee_id' => User::factory()->create()->id,
        'order_number' => fake()->unique()->bothify('ORD-SALES-####'),
        'total_price' => 10000,
        'transaction_date' => '2026-06-27',
        'payment_method' => 'Cash',
        'reference_number' => null,
        'receipt_number' => fake()->unique()->bothify('RCPT-SALES-####'),
        'is_void' => false,
        'created_at' => Carbon::parse('2026-06-27 10:00:00'),
        'updated_at' => Carbon::parse('2026-06-27 10:00:00'),
    ], $overrides);

    $order = Order::create($attributes);
    $order->forceFill([
        'created_at' => $attributes['created_at'],
        'updated_at' => $attributes['updated_at'],
    ])->saveQuietly();

    foreach ($items as $itemData) {
        $item = Item::factory()->create([
            'item_type' => $itemData['item_type'],
            'unit_cost' => $itemData['unit_cost'],
            'srp' => $itemData['sale_amount'],
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'item_id' => $item->id,
            'serial' => $item->serial,
            'sale_amount' => $itemData['sale_amount'],
            'discount_amount' => $itemData['discount_amount'] ?? 0,
        ]);
    }

    return $order;
}

it('renders cash order sales using the current month defaults', function () {
    Carbon::setTestNow('2026-06-27 12:00:00');
    actingAsPOSCashOrderSalesUser();

    $branch = Branch::factory()->create(['name' => 'Main Branch']);
    createPOSCashSalesOrder([
        'branch_id' => $branch->id,
        'total_price' => 4500,
    ], [
        ['item_type' => 'appliances', 'sale_amount' => 4500, 'unit_cost' => 3000],
    ]);

    $this->get(route('pos-cash-order-sales.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('POSCashOrderSales/Index')
            ->where('total_sales', 4500)
            ->where('total_expense', 3000)
            ->where('total_profit', 1500)
            ->where('filters.date_from', '2026-06-01')
            ->where('filters.date_to', '2026-06-27')
            ->where('filters.location_id', 'all')
            ->where('sales_per_category.appliances.sales', 4500)
            ->where('sales_per_category.appliances.percentage', 100)
            ->where("sales_by_location.{$branch->id}.revenue", 4500)
        );

    Carbon::setTestNow();
});

it('filters sales by date range and branch while excluding voided orders', function () {
    actingAsPOSCashOrderSalesUser();

    $includedBranch = Branch::factory()->create(['name' => 'Included']);
    $otherBranch = Branch::factory()->create(['name' => 'Other']);

    createPOSCashSalesOrder([
        'branch_id' => $includedBranch->id,
        'total_price' => 10000,
        'created_at' => Carbon::parse('2026-06-15 09:00:00'),
    ], [
        ['item_type' => 'appliances', 'sale_amount' => 7000, 'unit_cost' => 5000],
        ['item_type' => 'gadgets', 'sale_amount' => 3000, 'unit_cost' => 1000],
    ]);

    createPOSCashSalesOrder([
        'branch_id' => $includedBranch->id,
        'total_price' => 9000,
        'is_void' => true,
        'created_at' => Carbon::parse('2026-06-15 10:00:00'),
    ], [
        ['item_type' => 'furniture', 'sale_amount' => 9000, 'unit_cost' => 4000],
    ]);

    createPOSCashSalesOrder([
        'branch_id' => $otherBranch->id,
        'total_price' => 20000,
        'created_at' => Carbon::parse('2026-06-15 11:00:00'),
    ], [
        ['item_type' => 'furniture', 'sale_amount' => 20000, 'unit_cost' => 8000],
    ]);

    createPOSCashSalesOrder([
        'branch_id' => $includedBranch->id,
        'total_price' => 5000,
        'created_at' => Carbon::parse('2026-05-30 11:00:00'),
    ], [
        ['item_type' => 'appliances', 'sale_amount' => 5000, 'unit_cost' => 2000],
    ]);

    $this->get(route('pos-cash-order-sales.index', [
        'date_from' => '2026-06-01',
        'date_to' => '2026-06-30',
        'location_id' => $includedBranch->id,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('total_sales', 10000)
            ->where('total_expense', 6000)
            ->where('total_profit', 4000)
            ->where('sales_per_category.appliances.sales', 7000)
            ->where('sales_per_category.appliances.percentage', 70)
            ->where('sales_per_category.gadgets.sales', 3000)
            ->where('sales_per_category.gadgets.percentage', 30)
            ->where('sales_per_category.furniture.sales', 0)
            ->where("sales_by_location.{$includedBranch->id}.revenue", 10000)
            ->where("sales_by_location.{$otherBranch->id}.revenue", 0)
            ->where('filters.location_id', (string) $includedBranch->id)
        );
});

it('returns zeroed dashboard data when no orders match the filters', function () {
    actingAsPOSCashOrderSalesUser();

    Branch::factory()->create(['name' => 'Empty Branch']);

    $this->get(route('pos-cash-order-sales.index', [
        'date_from' => '2026-01-01',
        'date_to' => '2026-01-31',
        'location_id' => 'all',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('total_sales', 0)
            ->where('total_expense', 0)
            ->where('total_profit', 0)
            ->where('sales_per_category.appliances.percentage', 0)
            ->where('sales_per_category.gadgets.percentage', 0)
            ->where('sales_per_category.furniture.percentage', 0)
        );
});
