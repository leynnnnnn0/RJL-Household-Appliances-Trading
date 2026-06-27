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

function actingAsBulkPaymentUser(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('can access bulk payments');

    $user = User::factory()->create();
    $user->givePermissionTo('can access bulk payments');

    test()->actingAs($user);

    return $user;
}

function createBulkPaymentInstallmentOrder(array $overrides = [], array $payments = []): InstallmentOrder
{
    $order = InstallmentOrder::create(array_merge([
        'customer_id' => Customer::factory()->create([
            'first_name' => 'Bulk',
            'last_name' => 'Customer',
        ])->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
        'user_id' => User::factory()->create()->id,
        'order_number' => fake()->unique()->bothify('IORD-BULK-####'),
        'loan_contract_price' => 12000,
        'lcp_markup_rate' => 1,
        'lcp_additional_charge' => 0,
        'down_payment' => 2000,
        'payment_method' => 'cash',
        'reference_number' => null,
        'receipt_number' => fake()->unique()->bothify('ICR-BULK-####'),
        'promisory_note_value' => 10000,
        'number_of_terms' => 2,
        'promisory_note_value_interest' => 1,
        'promisory_note_value_interest_additional_charge' => 0,
        'transaction_date' => '2026-06-27',
        'is_voided' => false,
        'is_defaulted' => false,
        'is_completed' => false,
        'is_accelerated' => false,
        'acceleration_discount' => 0,
    ], $overrides));

    $item = Item::factory()->create([
        'item_type' => 'appliances',
        'srp' => 10000,
        'date_out' => '2026-06-27',
    ]);

    InstallmentOrderItem::create([
        'installment_order_id' => $order->id,
        'item_id' => $item->id,
        'serial' => $item->serial,
        'sale_amount' => $item->srp,
        'discount_amount' => 0,
    ]);

    if ($payments === []) {
        $payments = [
            ['installment_number' => 1, 'amount_due' => 5000, 'due_date' => '2026-07-27'],
            ['installment_number' => 2, 'amount_due' => 5000, 'due_date' => '2026-08-27'],
        ];
    }

    foreach ($payments as $paymentData) {
        InstallmentOrderPayment::create(array_merge([
            'installment_order_id' => $order->id,
            'amount_paid' => 0,
            'rebate_amount' => 0,
            'payment_method' => null,
            'reference_number' => null,
            'status' => 'pending',
            'paid_date' => null,
        ], $paymentData));
    }

    return $order;
}

function bulkPaymentPayload(InstallmentOrder $order, InstallmentOrderPayment $payment, array $overrides = []): array
{
    return array_merge([
        'installment_order_payment_id' => $payment->id,
        'installment_order_id' => $order->id,
        'installment_number' => $payment->installment_number,
        'amount_due' => $payment->amount_due,
        'amount_paid' => 5000,
        'payment_method' => 'cash',
        'reference_number' => null,
        'paid_date' => '2026-07-01',
        'collection_receipt_number' => fake()->unique()->bothify('BULK-CR-####'),
    ], $overrides);
}

it('renders the bulk payments page with open installment orders', function () {
    actingAsBulkPaymentUser();

    $openOrder = createBulkPaymentInstallmentOrder([
        'order_number' => 'IORD-BULK-OPEN',
        'is_completed' => false,
    ]);
    createBulkPaymentInstallmentOrder([
        'order_number' => 'IORD-BULK-CLOSED',
        'is_completed' => true,
    ]);

    $this->get(route('bulk-payments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('BulkPayment/Index')
            ->has('installmentOrders', 1)
            ->where('installmentOrders.0.id', $openOrder->id)
            ->where('installmentOrders.0.order_number', 'IORD-BULK-OPEN')
        );
});

it('processes a bulk payment across multiple installments and completes the order', function () {
    $user = actingAsBulkPaymentUser();
    $order = createBulkPaymentInstallmentOrder();
    $firstPayment = $order->installment_order_payments()->orderBy('installment_number')->first();

    $this->post(route('bulk-payments.store'), [
        'payments' => [
            bulkPaymentPayload($order, $firstPayment, [
                'amount_paid' => 10000,
                'payment_method' => 'gcash',
                'reference_number' => 'GCASH-123',
                'collection_receipt_number' => 'CR-BULK-001',
            ]),
        ],
    ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Successfully processed 1 payment(s)!');

    $order->refresh();
    expect($order->is_completed)->toBeTruthy();

    $payments = $order->installment_order_payments()->orderBy('installment_number')->get();
    expect($payments[0]->amount_paid)->toEqual('5000.00')
        ->and($payments[0]->status)->toBe('paid')
        ->and($payments[1]->amount_paid)->toEqual('5000.00')
        ->and($payments[1]->status)->toBe('paid');

    expect(InstallmentOrderPaymentHistory::count())->toBe(2);
    expect(InstallmentOrderPaymentHistory::pluck('amount')->map(fn ($amount) => (float) $amount)->all())
        ->toBe([5000.0, 5000.0]);
    expect(InstallmentOrderPaymentHistory::pluck('user_id')->unique()->all())->toBe([$user->id]);
});

it('records partial bulk payments without completing the order', function () {
    actingAsBulkPaymentUser();
    $order = createBulkPaymentInstallmentOrder();
    $firstPayment = $order->installment_order_payments()->orderBy('installment_number')->first();

    $this->post(route('bulk-payments.store'), [
        'payments' => [
            bulkPaymentPayload($order, $firstPayment, [
                'amount_paid' => 2500,
                'collection_receipt_number' => 'CR-BULK-PARTIAL',
            ]),
        ],
    ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Successfully processed 1 payment(s)!');

    $order->refresh();
    $firstPayment->refresh();

    expect($order->is_completed)->toBeFalsy()
        ->and($firstPayment->amount_paid)->toEqual('2500.00')
        ->and($firstPayment->status)->toBe('partial');

    $this->assertDatabaseHas('installment_order_payment_histories', [
        'payment_id' => $firstPayment->id,
        'amount' => 2500,
        'collection_receipt_number' => 'CR-BULK-PARTIAL',
    ]);
});

it('validates required bulk payment fields', function () {
    actingAsBulkPaymentUser();
    $order = createBulkPaymentInstallmentOrder();
    $firstPayment = $order->installment_order_payments()->orderBy('installment_number')->first();

    $this->post(route('bulk-payments.store'), [
        'payments' => [
            bulkPaymentPayload($order, $firstPayment, [
                'amount_paid' => 0,
                'payment_method' => 'invalid',
                'paid_date' => null,
                'collection_receipt_number' => '',
            ]),
        ],
    ])
        ->assertSessionHasErrors([
            'payments.0.amount_paid',
            'payments.0.payment_method',
            'payments.0.paid_date',
            'payments.0.collection_receipt_number',
        ]);

    expect(InstallmentOrderPaymentHistory::count())->toBe(0);
});
