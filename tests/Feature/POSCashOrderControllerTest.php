<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Item;
use App\Models\Location;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsPOSCashOrderUser(array $permissions = ['can view cash orders', 'can void cash order']): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission);
    }

    $user = User::factory()->create();
    $user->givePermissionTo($permissions);

    test()->actingAs($user);

    return $user;
}

function createPOSCashOrderRecord(array $overrides = [], array $items = []): Order
{
    $order = Order::create(array_merge([
        'customer_id' => Customer::factory()->create()->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
        'employee_id' => User::factory()->create()->id,
        'order_number' => fake()->unique()->bothify('ORD-CASH-####'),
        'total_price' => 10000,
        'transaction_date' => '2026-06-27',
        'payment_method' => 'Cash',
        'reference_number' => null,
        'receipt_number' => fake()->unique()->bothify('RCPT-CASH-####'),
        'is_void' => false,
    ], $overrides));

    if ($items === []) {
        $items = [
            [
                'item' => Item::factory()->create([
                    'date_out' => '2026-06-27',
                    'srp' => 10000,
                ]),
                'sale_amount' => 10000,
                'discount_amount' => 0,
            ],
        ];
    }

    foreach ($items as $itemData) {
        $item = $itemData['item'];

        OrderItem::create([
            'order_id' => $order->id,
            'item_id' => $item->id,
            'serial' => $item->serial,
            'sale_amount' => $itemData['sale_amount'] ?? $item->srp,
            'discount_amount' => $itemData['discount_amount'] ?? 0,
        ]);
    }

    return $order;
}

it('renders the cash orders index with filters and eager-loaded transaction data', function () {
    actingAsPOSCashOrderUser(['can view cash orders']);

    $branch = Branch::factory()->create(['name' => 'Main Sales Branch']);
    $employee = User::factory()->create([
        'first_name' => 'Cashier',
        'last_name' => 'One',
    ]);
    $matchingOrder = createPOSCashOrderRecord([
        'branch_id' => $branch->id,
        'employee_id' => $employee->id,
        'order_number' => 'ORD-CASH-MATCH',
        'total_price' => 12500,
        'transaction_date' => '2026-06-27',
    ]);

    createPOSCashOrderRecord([
        'order_number' => 'ORD-CASH-OLD',
        'transaction_date' => '2026-06-20',
    ]);

    $this->get(route('pos-cash-orders.index', [
        'search' => 'ORD-CASH-MATCH',
        'date_from' => '2026-06-27',
        'date_to' => '2026-06-27',
        'location_id' => $branch->id,
        'employee_id' => $employee->id,
        'status' => '0',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('POSCashOrder/Index')
            ->has('locations')
            ->has('employees')
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', $matchingOrder->id)
            ->where('transactions.data.0.order_number', 'ORD-CASH-MATCH')
            ->where('transactions.data.0.branch.name', 'Main Sales Branch')
            ->where('transactions.data.0.employee.full_name', 'Cashier One')
            ->has('transactions.data.0.order_items', 1)
        );
});

it('filters cash orders by void status', function () {
    actingAsPOSCashOrderUser(['can view cash orders']);

    createPOSCashOrderRecord([
        'order_number' => 'ORD-CASH-ACTIVE',
        'is_void' => false,
    ]);
    $voidedOrder = createPOSCashOrderRecord([
        'order_number' => 'ORD-CASH-VOID',
        'is_void' => true,
    ]);

    $this->get(route('pos-cash-orders.index', ['status' => '1']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', $voidedOrder->id)
            ->where('transactions.data.0.is_void', 1)
        );
});

it('renders a cash order detail page by order number', function () {
    actingAsPOSCashOrderUser(['can view cash orders']);

    $order = createPOSCashOrderRecord([
        'order_number' => 'ORD-CASH-SHOW',
        'total_price' => 8800,
    ]);

    $this->get(route('pos-cash-orders.show', $order->order_number))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('POSCashOrder/Show')
            ->where('transaction.order_number', 'ORD-CASH-SHOW')
            ->where('transaction.total_price', 8800)
            ->has('transaction.customer')
            ->has('transaction.employee')
            ->has('transaction.branch')
            ->has('transaction.order_items', 1)
        );
});

it('validates void requests before changing an order', function () {
    actingAsPOSCashOrderUser();

    $order = createPOSCashOrderRecord(['is_void' => false]);

    $this->from(route('pos-cash-orders.show', $order->order_number))
        ->put(route('pos-cash-orders.void', $order->id), [])
        ->assertSessionHasErrors('reason_for_cancellation');

    expect($order->fresh()->is_void)->toBeFalsy();
});

it('voids a cash order and returns sold items back to inventory', function () {
    $user = actingAsPOSCashOrderUser();
    $itemA = Item::factory()->create(['date_out' => '2026-06-27']);
    $itemB = Item::factory()->create(['date_out' => '2026-06-27']);
    $order = createPOSCashOrderRecord([
        'order_number' => 'ORD-CASH-VOID-ME',
        'is_void' => false,
    ], [
        ['item' => $itemA, 'sale_amount' => 4000, 'discount_amount' => 500],
        ['item' => $itemB, 'sale_amount' => 6000, 'discount_amount' => 0],
    ]);

    $this->put(route('pos-cash-orders.void', $order->id), [
        'reason_for_cancellation' => 'Customer returned the order.',
    ])->assertRedirect();

    $order->refresh();
    expect($order->is_void)->toBeTruthy()
        ->and($order->reason_for_cancellation)->toBe('Customer returned the order.')
        ->and($order->user_id)->toBe($user->id)
        ->and($order->void_date)->not->toBeNull()
        ->and($itemA->fresh()->date_out)->toBeNull()
        ->and($itemB->fresh()->date_out)->toBeNull();
});

it('downloads a filtered cash orders pdf report', function () {
    actingAsPOSCashOrderUser(['can view cash orders']);

    createPOSCashOrderRecord([
        'order_number' => 'ORD-CASH-PDF',
        'transaction_date' => '2026-06-27',
        'total_price' => 7200,
    ]);

    $this->get('/pos-cash-orders/download-pdf?date_from=2026-06-27&date_to=2026-06-27&status=all')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});
