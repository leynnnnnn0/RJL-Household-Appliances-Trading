<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderItem;
use App\Models\InstallmentOrderPayment;
use App\Models\Item;
use App\Models\Location;
use App\Models\User;
use App\Services\Aging\AgingReportService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

function actingAsSalesAnalyticsUser(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('can view installment orders sales');

    $user = User::factory()->create();
    $user->givePermissionTo('can view installment orders sales');

    test()->actingAs($user);

    return $user;
}

function createSalesReportOrder(array $overrides = [], string $itemType = 'appliances', array $payments = []): InstallmentOrder
{
    $order = InstallmentOrder::create(array_merge([
        'customer_id' => Customer::factory()->create()->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
        'user_id' => User::factory()->create()->id,
        'order_number' => fake()->unique()->bothify('IORD-SALES-ANALYTICS-####'),
        'loan_contract_price' => 12000,
        'lcp_markup_rate' => 1,
        'lcp_additional_charge' => 0,
        'down_payment' => 2000,
        'payment_method' => 'cash',
        'reference_number' => null,
        'receipt_number' => fake()->unique()->bothify('SALES-CR-####'),
        'promisory_note_value' => 10000,
        'number_of_terms' => 5,
        'promisory_note_value_interest' => 1,
        'promisory_note_value_interest_additional_charge' => 0,
        'transaction_date' => '2026-01-15',
        'is_voided' => false,
        'is_defaulted' => false,
        'is_completed' => false,
        'is_accelerated' => false,
        'acceleration_discount' => 0,
    ], $overrides));

    $item = Item::factory()->create([
        'item_type' => $itemType,
        'srp' => 10000,
        'date_out' => $order->transaction_date,
    ]);

    InstallmentOrderItem::create([
        'installment_order_id' => $order->id,
        'item_id' => $item->id,
        'serial' => $item->serial,
        'sale_amount' => 10000,
        'discount_amount' => 0,
    ]);

    foreach ($payments as $payment) {
        InstallmentOrderPayment::create(array_merge([
            'installment_order_id' => $order->id,
            'installment_number' => 1,
            'amount_due' => 1000,
            'amount_paid' => 0,
            'rebate_amount' => 0,
            'payment_method' => null,
            'reference_number' => null,
            'status' => 'pending',
            'paid_date' => null,
        ], $payment));
    }

    return $order;
}

it('renders the sales module with filters, summary, and analytics', function () {
    actingAsSalesAnalyticsUser();
    $branch = Branch::factory()->create(['name' => 'Main Sales Branch']);

    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'SALES-CURRENT'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-06-30', 'amount_due' => 1000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'SALES-30'], 'gadgets', [
        ['installment_number' => 1, 'due_date' => '2026-06-15', 'amount_due' => 2000, 'amount_paid' => 500],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'SALES-60'], 'furniture', [
        ['installment_number' => 1, 'due_date' => '2026-05-15', 'amount_due' => 3000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'SALES-90'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-04-15', 'amount_due' => 4000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'SALES-PLUS'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-03-01', 'amount_due' => 5000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'is_voided' => true, 'order_number' => 'SALES-VOIDED'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-06-01', 'amount_due' => 9999],
    ]);

    $this->get(route('sales.index', [
        'as_of_date' => '2026-07-06',
        'branch_id' => $branch->id,
        'item_type' => 'all',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Sales/Index')
            ->where('filters.month', '2026-07')
            ->where('filters.as_of_date', '2026-07-06')
            ->where('summary.accounts', 5)
            ->has('analytics.monthly_trend', 12)
            ->has('analytics.category_sales')
            ->missing('agingTables')
        );
});

it('renders the aging module with bucket previews', function () {
    actingAsSalesAnalyticsUser();
    $branch = Branch::factory()->create(['name' => 'Main Aging Branch']);

    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-CURRENT'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-06-30', 'amount_due' => 1000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-DEFAULTED', 'is_defaulted' => true], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-06-30', 'amount_due' => 9999],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-NEXT-MONTH'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-07-01', 'amount_due' => 1000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-30'], 'gadgets', [
        ['installment_number' => 1, 'due_date' => '2026-05-15', 'amount_due' => 2000, 'amount_paid' => 500],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-60'], 'furniture', [
        ['installment_number' => 1, 'due_date' => '2026-04-15', 'amount_due' => 3000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-90'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-03-15', 'amount_due' => 4000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-PLUS'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-02-15', 'amount_due' => 5000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-NEW', 'transaction_date' => '2026-07-06'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-07-30', 'amount_due' => 1000],
    ]);

    $this->get(route('aging.index', [
        'as_of_date' => '2026-07-06',
        'branch_id' => $branch->id,
        'item_type' => 'all',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Aging/Index')
            ->where('filters.month', '2026-07')
            ->where('filters.as_of_date', '2026-07-06')
            ->where('agingTables.current.total_accounts', 1)
            ->where('agingTables.1_30.total_balance', 1500)
            ->where('agingTables.31_60.total_accounts', 1)
            ->where('agingTables.61_90.total_accounts', 1)
            ->where('agingTables.90_plus.total_accounts', 1)
            ->where('newReleases.total_accounts', 1)
            ->where('newReleases.rows.0.order_number', 'AGING-NEW')
        );
});

it('shows a full aging bucket page and downloads pdf reports', function () {
    actingAsSalesAnalyticsUser();
    $branch = Branch::factory()->create();

    createSalesReportOrder(['branch_id' => $branch->id], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-06-10', 'amount_due' => 1000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-05-10', 'amount_due' => 2500],
    ]);

    $query = [
        'bucket' => '1_30',
        'as_of_date' => '2026-07-06',
        'branch_id' => $branch->id,
        'item_type' => 'all',
    ];

    $this->get(route('aging.bucket.show', $query))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Aging/Bucket')
            ->where('bucket', '1_30')
            ->where('table.total_balance', 2500)
            ->has('table.rows', 1)
        );

    $this->get(route('aging.download-pdf', $query))->assertOk();
    $this->get(route('aging.download-pdf', array_merge($query, ['bucket' => 'all'])))->assertOk();

    $pdfData = app(AgingReportService::class)->pdfData($query);

    expect($pdfData['bucket'])->toBe('1_30')
        ->and(array_keys($pdfData['tables']))->toBe(['1_30']);
});

it('filters sales aging bucket pages by customer name', function () {
    actingAsSalesAnalyticsUser();
    $branch = Branch::factory()->create();
    $matchingCustomer = Customer::factory()->create([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
    ]);
    $otherCustomer = Customer::factory()->create([
        'first_name' => 'Pedro',
        'last_name' => 'Reyes',
    ]);

    createSalesReportOrder(['branch_id' => $branch->id, 'customer_id' => $matchingCustomer->id], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-05-10', 'amount_due' => 2500],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'customer_id' => $otherCustomer->id], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-05-10', 'amount_due' => 1500],
    ]);

    $this->get(route('aging.bucket.show', [
        'bucket' => '1_30',
        'as_of_date' => '2026-07-06',
        'branch_id' => $branch->id,
        'item_type' => 'all',
        'search' => 'Maria',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Aging/Bucket')
            ->where('filters.search', 'Maria')
            ->where('table.total_accounts', 1)
            ->where('table.rows.0.customer_name', 'Santos Maria')
        );
});

it('keeps paid current schedules visible and moves accounts by oldest unpaid schedule', function () {
    actingAsSalesAnalyticsUser();
    $branch = Branch::factory()->create();
    $paidCurrentCustomer = Customer::factory()->create([
        'first_name' => 'Ana',
        'last_name' => 'Brown',
    ]);
    $completedCurrentCustomer = Customer::factory()->create([
        'first_name' => 'Neriza',
        'last_name' => 'Juanita',
    ]);
    $finalPaidCustomer = Customer::factory()->create([
        'first_name' => 'Ben',
        'last_name' => 'Carter',
    ]);
    $oldUnpaidCustomer = Customer::factory()->create([
        'first_name' => 'Cara',
        'last_name' => 'Dela Cruz',
    ]);

    createSalesReportOrder(['branch_id' => $branch->id, 'customer_id' => $paidCurrentCustomer->id, 'order_number' => 'AGING-PAID-CURRENT'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-06-10', 'amount_due' => 1000, 'amount_paid' => 1000, 'status' => 'paid'],
        ['installment_number' => 2, 'due_date' => '2026-07-10', 'amount_due' => 1000],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'customer_id' => $completedCurrentCustomer->id, 'order_number' => 'AGING-COMPLETED-CURRENT', 'is_completed' => true, 'is_accelerated' => true], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-06-08', 'amount_due' => 1000, 'amount_paid' => 1000, 'status' => 'paid'],
        ['installment_number' => 2, 'due_date' => '2026-07-08', 'amount_due' => 1000, 'amount_paid' => 0, 'status' => 'pending'],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'customer_id' => $finalPaidCustomer->id, 'order_number' => 'AGING-FINAL-PAID', 'number_of_terms' => 1], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-06-10', 'amount_due' => 1000, 'amount_paid' => 1000, 'status' => 'paid'],
    ]);
    createSalesReportOrder(['branch_id' => $branch->id, 'customer_id' => $oldUnpaidCustomer->id, 'order_number' => 'AGING-OLD-UNPAID'], 'appliances', [
        ['installment_number' => 1, 'due_date' => '2026-05-10', 'amount_due' => 1000],
        ['installment_number' => 2, 'due_date' => '2026-06-10', 'amount_due' => 1000],
    ]);

    $this->get(route('aging.index', [
        'as_of_date' => '2026-07-06',
        'branch_id' => $branch->id,
        'item_type' => 'all',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('agingTables.current.total_accounts', 3)
            ->where('agingTables.current.rows.0.is_paid', true)
            ->where('agingTables.current.rows.1.is_final_payment_paid', true)
            ->where('agingTables.current.rows.2.order_number', 'AGING-COMPLETED-CURRENT')
            ->where('agingTables.current.rows.2.is_final_payment_paid', true)
            ->where('agingTables.1_30.total_accounts', 1)
            ->where('agingTables.1_30.rows.0.order_number', 'AGING-OLD-UNPAID')
            ->where('agingTables.1_30.rows.0.installments_count', 2)
            ->where('agingTables.1_30.rows.0.remaining_balance', 2000)
        );
});

it('keeps an account aged when the previous debt was paid late but the current debt is still unpaid', function () {
    actingAsSalesAnalyticsUser();
    $branch = Branch::factory()->create();

    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-LATE-MAY-UNPAID-JUNE'], 'appliances', [
        [
            'installment_number' => 1,
            'due_date' => '2026-05-10',
            'amount_due' => 1000,
            'amount_paid' => 1000,
            'paid_date' => '2026-06-08',
            'status' => 'paid',
        ],
        [
            'installment_number' => 2,
            'due_date' => '2026-06-10',
            'amount_due' => 1000,
            'amount_paid' => 0,
            'paid_date' => null,
            'status' => 'pending',
        ],
    ]);

    $this->get(route('aging.index', [
        'as_of_date' => '2026-07-06',
        'branch_id' => $branch->id,
        'item_type' => 'all',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('agingTables.current.total_accounts', 0)
            ->where('agingTables.1_30.total_accounts', 1)
            ->where('agingTables.1_30.rows.0.order_number', 'AGING-LATE-MAY-UNPAID-JUNE')
            ->where('agingTables.1_30.rows.0.amount_paid', 1000)
            ->where('agingTables.1_30.rows.0.remaining_balance', 1000)
            ->where('agingTables.1_30.rows.0.is_paid', false)
        );
});

it('does not show paid current schedules that were paid before the report window', function () {
    actingAsSalesAnalyticsUser();
    $branch = Branch::factory()->create();

    createSalesReportOrder(['branch_id' => $branch->id, 'order_number' => 'AGING-PAID-BEFORE-WINDOW'], 'appliances', [
        [
            'installment_number' => 1,
            'due_date' => '2026-06-30',
            'amount_due' => 2082.92,
            'amount_paid' => 2082.92,
            'paid_date' => '2026-05-30',
            'status' => 'paid',
        ],
        [
            'installment_number' => 2,
            'due_date' => '2026-07-30',
            'amount_due' => 2082.92,
            'amount_paid' => 2082.92,
            'paid_date' => '2026-07-01',
            'status' => 'paid',
        ],
    ]);

    $this->get(route('aging.index', [
        'as_of_date' => '2026-07-06',
        'branch_id' => $branch->id,
        'item_type' => 'all',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('agingTables.current.total_accounts', 0)
            ->where('agingTables.1_30.total_accounts', 0)
            ->where('agingTables.31_60.total_accounts', 0)
            ->where('agingTables.61_90.total_accounts', 0)
            ->where('agingTables.90_plus.total_accounts', 0)
        );
});

it('validates sales filters', function () {
    actingAsSalesAnalyticsUser();

    $this->get(route('sales.index', [
        'as_of_date' => 'bad-date',
        'item_type' => 'invalid',
    ]))->assertSessionHasErrors(['as_of_date', 'item_type']);
});

it('defaults the sales report date to the sixth day of the selected month', function () {
    actingAsSalesAnalyticsUser();

    $this->get(route('sales.index', ['month' => '2026-03']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Sales/Index')
            ->where('filters.month', '2026-03')
            ->where('filters.as_of_date', '2026-03-06')
        );
});

it('defaults the aging report date to the sixth day of the selected month', function () {
    actingAsSalesAnalyticsUser();

    $this->get(route('aging.index', ['month' => '2026-03']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Aging/Index')
            ->where('filters.month', '2026-03')
            ->where('filters.as_of_date', '2026-03-06')
        );
});

it('rolls the default aging report date after the sixth day cutoff', function () {
    actingAsSalesAnalyticsUser();

    Carbon::setTestNow('2026-07-05 10:00:00');
    $this->get(route('aging.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Aging/Index')
            ->where('filters.as_of_date', '2026-07-06')
        );

    Carbon::setTestNow('2026-07-07 10:00:00');
    $this->get(route('aging.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Aging/Index')
            ->where('filters.as_of_date', '2026-08-07')
        );

    Carbon::setTestNow();
});
