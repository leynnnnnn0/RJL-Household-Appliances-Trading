<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderItem;
use App\Models\InstallmentOrderPayment;
use App\Models\InstallmentOrderPaymentHistory;
use App\Models\Item;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsPOSCreditOrderUser(array $permissions = [
    'can view installment orders',
    'can record installment order payment',
    'can add rebate',
    'can accelerate',
    'can default',
    'can void',
]): User
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

function createManagedInstallmentOrder(array $overrides = [], array $items = [], array $payments = []): InstallmentOrder
{
    $order = InstallmentOrder::create(array_merge([
        'customer_id' => Customer::factory()->create()->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
        'user_id' => User::factory()->create()->id,
        'order_number' => fake()->unique()->bothify('IORD-MGMT-####'),
        'loan_contract_price' => 12000,
        'lcp_markup_rate' => 1,
        'lcp_additional_charge' => 0,
        'down_payment' => 2000,
        'payment_method' => 'cash',
        'reference_number' => null,
        'receipt_number' => fake()->unique()->bothify('ICR-MGMT-####'),
        'promisory_note_value' => 10000,
        'number_of_terms' => 2,
        'promisory_note_value_interest' => 1,
        'promisory_note_value_interest_additional_charge' => 0,
        'transaction_date' => '2026-06-27',
        'is_voided' => false,
        'is_defaulted' => false,
        'is_completed' => false,
        'is_accelerated' => false,
    ], $overrides));

    if ($items === []) {
        $items = [
            ['item_type' => 'appliances', 'sale_amount' => 10000, 'discount_amount' => 0],
        ];
    }

    foreach ($items as $itemData) {
        $item = $itemData['item'] ?? Item::factory()->create([
            'item_type' => $itemData['item_type'] ?? 'appliances',
            'unit_cost' => $itemData['unit_cost'] ?? 7000,
            'srp' => $itemData['sale_amount'] ?? 10000,
            'date_out' => $itemData['date_out'] ?? '2026-06-27',
        ]);

        InstallmentOrderItem::create([
            'installment_order_id' => $order->id,
            'item_id' => $item->id,
            'serial' => $item->serial,
            'sale_amount' => $itemData['sale_amount'] ?? $item->srp,
            'discount_amount' => $itemData['discount_amount'] ?? 0,
        ]);
    }

    if ($payments === []) {
        $payments = [
            ['installment_number' => 1, 'amount_due' => 5000, 'due_date' => '2026-07-27', 'status' => 'pending'],
            ['installment_number' => 2, 'amount_due' => 5000, 'due_date' => '2026-08-27', 'status' => 'pending'],
        ];
    }

    foreach ($payments as $paymentData) {
        InstallmentOrderPayment::create(array_merge([
            'installment_order_id' => $order->id,
            'amount_paid' => 0,
            'rebate_amount' => 0,
            'payment_method' => null,
            'reference_number' => null,
            'paid_date' => null,
        ], $paymentData));
    }

    return $order;
}

function managedCreditPaymentPayload(InstallmentOrder $order, InstallmentOrderPayment $payment, array $overrides = []): array
{
    return array_merge([
        'installment_order_payment_id' => $payment->id,
        'installment_order_id' => $order->id,
        'installment_number' => $payment->installment_number,
        'amount_due' => $payment->amount_due,
        'amount_paid' => 7500,
        'payment_method' => 'cash',
        'reference_number' => null,
        'paid_date' => '2026-07-01',
        'collection_receipt_number' => fake()->unique()->bothify('COLL-####'),
        'branch_id' => Branch::factory()->create()->id,
    ], $overrides);
}

it('renders installment order index with filters and eager loaded data', function () {
    actingAsPOSCreditOrderUser();

    $branch = Branch::factory()->create(['name' => 'Credit Branch']);
    $customer = Customer::factory()->create([
        'first_name' => 'Credit',
        'last_name' => 'Customer',
    ]);
    $order = createManagedInstallmentOrder([
        'customer_id' => $customer->id,
        'branch_id' => $branch->id,
        'order_number' => 'IORD-MGMT-FILTER',
        'transaction_date' => '2026-06-27',
    ]);

    createManagedInstallmentOrder([
        'order_number' => 'IORD-MGMT-OTHER',
        'transaction_date' => '2026-05-01',
    ]);

    $this->get(route('pos-installment-orders.index', [
        'search' => 'Credit Customer',
        'date_from' => '2026-06-01',
        'date_to' => '2026-06-30',
        'location_id' => $branch->id,
        'status' => 'active',
        'item_type' => 'appliances',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('POSCreditOrder/Index')
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', $order->id)
            ->where('transactions.data.0.customer.full_name', 'Credit Customer')
            ->has('transactions.data.0.installment_order_items', 1)
            ->has('transactions.data.0.installment_order_payments', 2)
            ->has('locations')
            ->has('employees')
        );
});

it('renders installment order details with payment history and branches', function () {
    actingAsPOSCreditOrderUser();

    $order = createManagedInstallmentOrder(['order_number' => 'IORD-MGMT-SHOW']);
    $payment = $order->installment_order_payments()->first();
    InstallmentOrderPaymentHistory::create([
        'payment_id' => $payment->id,
        'amount' => 1000,
        'payment_method' => 'cash',
        'paid_date' => '2026-07-01',
        'collection_receipt_number' => 'HIST-001',
        'user_id' => User::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
    ]);

    $this->get(route('pos-installment-orders.show', $order->order_number))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('POSCreditOrder/Show')
            ->where('transaction.order_number', 'IORD-MGMT-SHOW')
            ->has('transaction.installment_order_items', 1)
            ->has('transaction.installment_order_payments', 2)
            ->has('paymentHistory', 1)
            ->has('branches')
        );
});

it('records payment across multiple installments and creates histories', function () {
    $user = actingAsPOSCreditOrderUser();
    $order = createManagedInstallmentOrder();
    $firstPayment = $order->installment_order_payments()->orderBy('installment_number')->first();

    $this->post('/pos-installment-orders/record-payment', managedCreditPaymentPayload($order, $firstPayment, [
        'amount_paid' => 7500,
    ]))->assertRedirect()->assertSessionHasNoErrors();

    $payments = $order->installment_order_payments()->orderBy('installment_number')->get();

    expect((float) $payments[0]->amount_paid)->toBe(5000.0)
        ->and($payments[0]->status)->toBe('paid')
        ->and((float) $payments[1]->amount_paid)->toBe(2500.0)
        ->and($payments[1]->status)->toBe('partial')
        ->and(InstallmentOrderPaymentHistory::where('user_id', $user->id)->count())->toBe(2)
        ->and($order->fresh()->is_completed)->toBeFalsy();
});

it('validates record payment requests', function () {
    actingAsPOSCreditOrderUser();

    $this->post('/pos-installment-orders/record-payment', [])
        ->assertSessionHasErrors([
            'installment_order_payment_id',
            'installment_order_id',
            'amount_paid',
            'payment_method',
            'paid_date',
            'collection_receipt_number',
            'branch_id',
        ]);
});

it('voids defaults and reactivates installment orders while updating item availability', function () {
    $user = actingAsPOSCreditOrderUser();
    $item = Item::factory()->create(['date_out' => '2026-06-27']);
    $order = createManagedInstallmentOrder([], [['item' => $item, 'sale_amount' => 10000]]);

    $this->post("/pos-installment-orders/{$order->id}/void", [
        'installment_order_id' => $order->id,
        'reason_for_cancellation' => 'Customer cancelled',
    ])->assertRedirect();

    expect($order->fresh()->is_voided)->toBeTruthy()
        ->and($order->fresh()->voider_id)->toBe($user->id)
        ->and($item->fresh()->date_out)->toBeNull();

    $order = createManagedInstallmentOrder([], [['item' => $item, 'sale_amount' => 10000, 'date_out' => '2026-06-27']]);

    $this->post("/pos-installment-orders/{$order->id}/default", [
        'installment_order_id' => $order->id,
        'default_reason' => 'Missed payments',
    ])->assertRedirect();

    expect($order->fresh()->is_defaulted)->toBeTruthy()
        ->and($order->fresh()->defaulter_id)->toBe($user->id)
        ->and($item->fresh()->date_out)->toBeNull();

    $this->post("/pos-installment-orders/{$order->id}/reactivate", [
        'installment_order_id' => $order->id,
        'reactivation_reason' => 'Customer resumed payments',
    ])->assertRedirect();

    expect($order->fresh()->is_defaulted)->toBeFalsy()
        ->and($order->fresh()->is_reactivated)->toBeTruthy()
        ->and($order->fresh()->reactivator_id)->toBe($user->id)
        ->and($item->fresh()->date_out)->toBe('2026-06-27');
});

it('adds rebates and marks the order complete when all installments are paid by rebate', function () {
    actingAsPOSCreditOrderUser();
    $order = createManagedInstallmentOrder([], [], [
        ['installment_number' => 1, 'amount_due' => 5000, 'amount_paid' => 5000, 'rebate_amount' => 0, 'due_date' => '2026-07-27', 'status' => 'paid'],
        ['installment_number' => 2, 'amount_due' => 5000, 'amount_paid' => 4000, 'rebate_amount' => 0, 'due_date' => '2026-08-27', 'status' => 'partial'],
    ]);
    $payment = $order->installment_order_payments()->where('installment_number', 2)->first();

    $this->put("/pos-installment-orders/{$order->id}/rebate", [
        'installment_order_payment_id' => $payment->id,
        'rebate_amount' => 1000,
        'rebate_reason' => 'Early payment',
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect((float) $payment->fresh()->rebate_amount)->toBe(1000.0)
        ->and($payment->fresh()->status)->toBe('paid')
        ->and($order->fresh()->is_completed)->toBeTruthy();
});

it('accelerates a loan and records payment history', function () {
    actingAsPOSCreditOrderUser();
    $order = createManagedInstallmentOrder();
    $firstPayment = $order->installment_order_payments()->orderBy('installment_number')->first();

    $this->post("/pos-installment-orders/{$order->id}/accelerate", managedCreditPaymentPayload($order, $firstPayment, [
        'installment_order_id' => $order->id,
        'acceleration_discount' => 500,
        'amount_paid' => 9500,
        'reason_for_acceleration' => 'Paid early',
    ]))->assertRedirect()->assertSessionHasNoErrors();

    expect($order->fresh()->is_accelerated)->toBeTruthy()
        ->and($order->fresh()->is_completed)->toBeTruthy()
        ->and((float) $order->fresh()->acceleration_discount)->toBe(500.0)
        ->and(InstallmentOrderPaymentHistory::count())->toBe(2);
});

it('updates and deletes payment history while recalculating installment and order status', function () {
    actingAsPOSCreditOrderUser();
    $order = createManagedInstallmentOrder(['is_completed' => true], [], [
        ['installment_number' => 1, 'amount_due' => 5000, 'amount_paid' => 5000, 'due_date' => '2026-07-27', 'status' => 'paid'],
    ]);
    $payment = $order->installment_order_payments()->first();
    $history = InstallmentOrderPaymentHistory::create([
        'payment_id' => $payment->id,
        'amount' => 5000,
        'payment_method' => 'cash',
        'paid_date' => '2026-07-01',
        'collection_receipt_number' => 'HIST-EDIT',
        'user_id' => User::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
    ]);

    $this->put(route('pos-installment-orders.payment-history.update', $history->id), [
        'amount' => 3000,
        'payment_method' => 'cash',
        'reference_number' => null,
        'paid_date' => '2026-07-02',
        'collection_receipt_number' => 'HIST-UPDATED',
        'branch_id' => Branch::factory()->create()->id,
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect((float) $payment->fresh()->amount_paid)->toBe(3000.0)
        ->and($payment->fresh()->status)->toBe('partial')
        ->and($order->fresh()->is_completed)->toBeFalsy();

    $this->delete(route('pos-installment-orders.payment-history.delete', $history->id))
        ->assertRedirect()->assertSessionHasNoErrors();

    expect((float) $payment->fresh()->amount_paid)->toBe(0.0)
        ->and($payment->fresh()->status)->toBe('pending')
        ->and(InstallmentOrderPaymentHistory::count())->toBe(0);
});

it('streams the payment schedule pdf', function () {
    actingAsPOSCreditOrderUser();
    $order = createManagedInstallmentOrder(['order_number' => 'IORD-MGMT-PDF']);

    $this->get("/pos-installment-orders/{$order->id}/payment-schedule-pdf")
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});
