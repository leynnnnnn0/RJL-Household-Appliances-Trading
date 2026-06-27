<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderItem;
use App\Models\InstallmentOrderPayment;
use App\Models\Item;
use App\Models\Location;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsPOSCreditOrderSalesUser(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('can view installment orders sales');

    $user = User::factory()->create();
    $user->givePermissionTo('can view installment orders sales');

    test()->actingAs($user);

    return $user;
}

function createCreditSalesInstallmentOrder(
    array $overrides = [],
    array $items = [],
    array $payments = [],
): InstallmentOrder {
    $order = InstallmentOrder::create(array_merge([
        'customer_id' => Customer::factory()->create()->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
        'user_id' => User::factory()->create()->id,
        'order_number' => fake()->unique()->bothify('IORD-SALES-####'),
        'loan_contract_price' => 12000,
        'lcp_markup_rate' => 1,
        'lcp_additional_charge' => 0,
        'down_payment' => 2000,
        'payment_method' => 'cash',
        'reference_number' => null,
        'receipt_number' => fake()->unique()->bothify('ICR-SALES-####'),
        'promisory_note_value' => 10000,
        'number_of_terms' => 2,
        'promisory_note_value_interest' => 1,
        'promisory_note_value_interest_additional_charge' => 0,
        'transaction_date' => '2026-06-10',
        'is_voided' => false,
        'is_defaulted' => false,
        'is_completed' => false,
        'is_accelerated' => false,
        'acceleration_discount' => 0,
    ], $overrides));

    if ($items === []) {
        $items = [['item_type' => 'appliances', 'sale_amount' => 10000]];
    }

    foreach ($items as $itemData) {
        $item = Item::factory()->create([
            'item_type' => $itemData['item_type'] ?? 'appliances',
            'srp' => $itemData['sale_amount'] ?? 10000,
            'date_out' => $itemData['date_out'] ?? '2026-06-10',
        ]);

        InstallmentOrderItem::create([
            'installment_order_id' => $order->id,
            'item_id' => $item->id,
            'serial' => $item->serial,
            'sale_amount' => $itemData['sale_amount'] ?? $item->srp,
            'discount_amount' => $itemData['discount_amount'] ?? 0,
        ]);
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

it('renders credit order sales dashboard with portfolio and collection calculations', function () {
    Carbon::setTestNow('2026-06-27 12:00:00');
    actingAsPOSCreditOrderSalesUser();

    $branch = Branch::factory()->create(['name' => 'Credit Sales Branch']);

    createCreditSalesInstallmentOrder([
        'branch_id' => $branch->id,
    ], [
        ['item_type' => 'appliances', 'sale_amount' => 10000],
    ], [
        [
            'installment_number' => 1,
            'amount_due' => 5000,
            'amount_paid' => 3000,
            'rebate_amount' => 100,
            'due_date' => '2026-06-15',
            'paid_date' => '2026-06-20',
            'status' => 'partial',
        ],
        [
            'installment_number' => 2,
            'amount_due' => 5000,
            'amount_paid' => 0,
            'due_date' => '2026-07-15',
            'status' => 'pending',
        ],
    ]);

    createCreditSalesInstallmentOrder([
        'branch_id' => $branch->id,
        'is_completed' => true,
        'order_number' => 'IORD-SALES-COMPLETED',
    ], [
        ['item_type' => 'gadgets', 'sale_amount' => 10000],
    ], [
        [
            'installment_number' => 1,
            'amount_due' => 10000,
            'amount_paid' => 10000,
            'due_date' => '2026-06-10',
            'paid_date' => '2026-06-10',
            'status' => 'paid',
        ],
    ]);

    createCreditSalesInstallmentOrder([
        'branch_id' => $branch->id,
        'is_defaulted' => true,
        'order_number' => 'IORD-SALES-DEFAULTED',
    ], [
        ['item_type' => 'furniture', 'sale_amount' => 10000],
    ], [
        [
            'installment_number' => 1,
            'amount_due' => 10000,
            'amount_paid' => 2000,
            'due_date' => '2026-05-10',
            'paid_date' => '2026-05-10',
            'status' => 'partial',
        ],
    ]);

    createCreditSalesInstallmentOrder([
        'branch_id' => $branch->id,
        'is_voided' => true,
        'order_number' => 'IORD-SALES-VOIDED',
    ], payments: [
        [
            'installment_number' => 1,
            'amount_due' => 9000,
            'amount_paid' => 9000,
            'due_date' => '2026-06-01',
            'paid_date' => '2026-06-01',
        ],
    ]);

    $this->get(route('pos-installment-orders-sales.index', [
        'date_from' => '2026-06-01',
        'date_to' => '2026-06-30',
        'location_id' => $branch->id,
        'item_type' => 'all',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('POSCreditOrderSales/Index')
            ->where('filters.date_from', '2026-06-01')
            ->where('filters.date_to', '2026-06-30')
            ->where('filters.location_id', (string) $branch->id)
            ->where('portfolio.total_pnv', 30000)
            ->where('portfolio.total_active_pnv', 10000)
            ->where('portfolio.total_completed_pnv', 10000)
            ->where('portfolio.total_defaulted_pnv', 10000)
            ->where('portfolio.active_accounts', 1)
            ->where('portfolio.completed_accounts', 1)
            ->where('portfolio.defaulted_accounts', 1)
            ->where('portfolio.collectible_balance', 7000)
            ->where('portfolio.defaulted_balance', 8000)
            ->where('portfolio.total_remaining_balance', 15000)
            ->where('portfolio.total_rebate', 100)
            ->where('period.expected', 5000)
            ->where('period.actual_collected', 3000)
            ->where('period.uncollected', 2000)
            ->where('period.collection_rate', 60)
            ->where('period.variance', -25)
            ->where('period.overall_collection_rate', 50)
            ->where('receivables.current', 5000)
            ->where('receivables.30_days', 2000)
            ->where('receivables.total', 7000)
            ->where('collections.30_days', 3000)
            ->where('collections.total', 3000)
            ->where('by_item_type.appliances.count', 1)
            ->where('by_item_type.appliances.expected', 5000)
            ->where('by_item_type.appliances.collected', 3000)
            ->where('by_item_type.appliances.balance', 7000)
        );

    Carbon::setTestNow();
});

it('filters credit sales by item type and branch while excluding future transactions', function () {
    actingAsPOSCreditOrderSalesUser();

    $includedBranch = Branch::factory()->create();
    $otherBranch = Branch::factory()->create();

    createCreditSalesInstallmentOrder([
        'branch_id' => $includedBranch->id,
        'transaction_date' => '2026-06-10',
    ], [
        ['item_type' => 'gadgets', 'sale_amount' => 10000],
    ], [
        [
            'installment_number' => 1,
            'amount_due' => 5000,
            'amount_paid' => 0,
            'due_date' => '2026-06-20',
        ],
    ]);

    createCreditSalesInstallmentOrder([
        'branch_id' => $includedBranch->id,
        'transaction_date' => '2026-06-10',
    ], [
        ['item_type' => 'appliances', 'sale_amount' => 10000],
    ], [
        [
            'installment_number' => 1,
            'amount_due' => 5000,
            'amount_paid' => 0,
            'due_date' => '2026-06-20',
        ],
    ]);

    createCreditSalesInstallmentOrder([
        'branch_id' => $otherBranch->id,
        'transaction_date' => '2026-06-10',
    ], [
        ['item_type' => 'gadgets', 'sale_amount' => 10000],
    ], [
        [
            'installment_number' => 1,
            'amount_due' => 5000,
            'amount_paid' => 0,
            'due_date' => '2026-06-20',
        ],
    ]);

    createCreditSalesInstallmentOrder([
        'branch_id' => $includedBranch->id,
        'transaction_date' => '2026-07-01',
    ], [
        ['item_type' => 'gadgets', 'sale_amount' => 10000],
    ], [
        [
            'installment_number' => 1,
            'amount_due' => 5000,
            'amount_paid' => 0,
            'due_date' => '2026-07-20',
        ],
    ]);

    $this->get(route('pos-installment-orders-sales.index', [
        'date_from' => '2026-06-01',
        'date_to' => '2026-06-30',
        'location_id' => $includedBranch->id,
        'item_type' => 'gadgets',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('portfolio.total_pnv', 10000)
            ->where('portfolio.active_accounts', 1)
            ->where('by_item_type.gadgets.count', 1)
            ->where('by_item_type.appliances.count', 0)
        );
});

it('validates credit sales filters', function () {
    actingAsPOSCreditOrderSalesUser();

    $this->get(route('pos-installment-orders-sales.index', [
        'date_from' => '2026-06-30',
        'date_to' => '2026-06-01',
        'item_type' => 'invalid',
    ]))
        ->assertSessionHasErrors(['date_to', 'item_type']);
});
