<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\InstallmentOrder;
use App\Models\Item;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsPOSCreditUser(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('can access credit pos');

    $user = User::factory()->create();
    $user->givePermissionTo('can access credit pos');

    test()->actingAs($user);

    return $user;
}

function availablePOSCreditItem(array $overrides = []): Item
{
    return Item::factory()->create(array_merge([
        'item_type' => 'appliances',
        'description' => 'POS Credit Test Item',
        'model' => fake()->unique()->bothify('CR-MDL-####'),
        'serial' => fake()->unique()->bothify('CR-SN-####'),
        'quantity' => 1,
        'srp' => 10000,
        'unit_cost' => 7000,
        'date_out' => null,
    ], $overrides));
}

function validPOSCreditPayload(array $overrides = []): array
{
    Location::factory()->create();

    $branch = Branch::factory()->create();
    $investigator = Employee::factory()->create();
    $item = availablePOSCreditItem([
        'srp' => 10000,
        'serial' => 'POS-CREDIT-ITEM-001',
    ]);

    return array_replace_recursive([
        'is_no_interest' => true,
        'customer_id' => null,
        'customer_first_name' => 'Maria',
        'customer_last_name' => 'Santos',
        'customer_address' => '45 Mabini Street',
        'customer_phone_number' => '09181234567',
        'city' => 'Balanga',
        'province' => 'Bataan',
        'zipcode' => '2100',
        'country' => 'PHILIPPINES',
        'email' => 'maria@example.com',
        'customer_reference_full_name' => 'Ana Santos',
        'customer_reference_phone_number' => '09189990000',
        'investigator_id' => $investigator->id,
        'home_visit_date' => '2026-06-20',
        'is_employment_verified' => true,
        'investigation_notes' => 'Verified at residence.',
        'id_presented' => 'Driver License',
        'id_number' => 'DL-12345',
        'civil_status' => 'Married',
        'spouse_name' => 'Pedro Santos',
        'spouse_contact_number' => '09180001111',
        'location_id' => $branch->id,
        'items' => [
            [
                'item_id' => $item->id,
                'serial' => $item->serial,
                'description' => $item->description,
                'model' => $item->model,
                'srp' => 10000,
                'item_type' => $item->item_type,
            ],
        ],
        'free_items' => [],
        'loan_contract_price' => 10000,
        'lcp_markup_rate' => 0,
        'lcp_additional_charge' => 0,
        'down_payment' => 2000,
        'payment_method' => 'cash',
        'reference_number' => null,
        'promisory_note_value' => 8000,
        'number_of_terms' => 3,
        'promisory_note_value_interest' => 1,
        'promisory_note_value_interest_additional_charge' => 0,
        'receipt_number' => 'CR-RCPT-001',
        'transaction_date' => '2026-06-27',
    ], $overrides);
}

function createPOSCreditOrderRecord(array $overrides = []): InstallmentOrder
{
    Location::factory()->create();

    return InstallmentOrder::create(array_merge([
        'customer_id' => Customer::factory()->create()->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => Branch::factory()->create()->id,
        'user_id' => User::factory()->create()->id,
        'order_number' => fake()->unique()->bothify('IORD-SETUP-####'),
        'loan_contract_price' => 11000,
        'lcp_markup_rate' => 1.1,
        'lcp_additional_charge' => 300,
        'down_payment' => 2000,
        'payment_method' => 'cash',
        'reference_number' => null,
        'receipt_number' => fake()->unique()->bothify('CR-SETUP-####'),
        'promisory_note_value' => 9000,
        'number_of_terms' => 3,
        'promisory_note_value_interest' => 1,
        'promisory_note_value_interest_additional_charge' => 0,
        'transaction_date' => now(),
    ], $overrides));
}

function posCreditMoney(float|int|string|null $amount): float
{
    return round((float) $amount, 2);
}

function posCreditPaymentScheduleTotal(InstallmentOrder $order): float
{
    return posCreditMoney($order->installment_order_payments->sum(fn ($payment) => (float) $payment->amount_due));
}

function posCreditItemSaleTotal(InstallmentOrder $order): float
{
    return posCreditMoney($order->installment_order_items->sum(fn ($item) => (float) $item->sale_amount));
}

function posCreditItemDiscountTotal(InstallmentOrder $order): float
{
    return posCreditMoney($order->installment_order_items->sum(fn ($item) => (float) $item->discount_amount));
}

function posCreditInterestConfig(string $itemType, int $term): array
{
    return [
        'furniture' => [
            3 => ['multiplier' => 1.12, 'fixed_charge' => 0],
            6 => ['multiplier' => 1.18, 'fixed_charge' => 300],
            9 => ['multiplier' => 1.21, 'fixed_charge' => 450],
            12 => ['multiplier' => 1.27, 'fixed_charge' => 600],
        ],
        'gadgets' => [
            3 => ['multiplier' => 1.10, 'fixed_charge' => 0],
            6 => ['multiplier' => 1.27, 'fixed_charge' => 300],
            9 => ['multiplier' => 1.30, 'fixed_charge' => 450],
            12 => ['multiplier' => 1.33, 'fixed_charge' => 600],
        ],
        'appliances' => [
            3 => ['multiplier' => 1.12, 'fixed_charge' => 0],
            6 => ['multiplier' => 1.18, 'fixed_charge' => 300],
            9 => ['multiplier' => 1.21, 'fixed_charge' => 450],
            12 => ['multiplier' => 1.27, 'fixed_charge' => 600],
        ],
    ][$itemType][$term];
}

it('renders the credit POS page with employees, branches, and todays transactions for the user', function () {
    $user = actingAsPOSCreditUser();
    $customer = Customer::factory()->create();
    $branch = Branch::factory()->create();

    $todayOrder = createPOSCreditOrderRecord([
        'customer_id' => $customer->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => $branch->id,
        'user_id' => $user->id,
        'order_number' => 'IORD-INDEX-TODAY',
        'transaction_date' => now(),
        'number_of_terms' => 6,
    ]);

    createPOSCreditOrderRecord([
        'customer_id' => $customer->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => $branch->id,
        'user_id' => User::factory()->create()->id,
        'order_number' => 'IORD-INDEX-OTHER',
        'transaction_date' => now(),
    ]);

    createPOSCreditOrderRecord([
        'customer_id' => $customer->id,
        'location_id' => Location::factory()->create()->id,
        'branch_id' => $branch->id,
        'user_id' => $user->id,
        'order_number' => 'IORD-INDEX-YESTERDAY',
        'transaction_date' => now()->subDay(),
    ]);

    $this->get(route('pos-credit.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('POSCredit/Index')
            ->has('employees')
            ->has('locations')
            ->has('transactions', 1)
            ->where('transactions.0.order_number', $todayOrder->order_number)
            ->where('transactions.0.customer', $customer->full_name)
            ->where('transactions.0.term', 6)
        );
});

it('stores a no-interest installment order and schedules equal payments after down payment', function () {
    $user = actingAsPOSCreditUser();

    $payload = validPOSCreditPayload();
    $expectedPromissoryNoteValue = posCreditMoney($payload['loan_contract_price'] - $payload['down_payment']);
    $expectedMonthlyPayment = posCreditMoney($expectedPromissoryNoteValue / $payload['number_of_terms']);

    $this->post(route('pos-credit.store'), $payload)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order = InstallmentOrder::with([
        'customer.customer_reference',
        'customer.investigation_detail',
        'installment_order_items',
        'installment_order_payments',
    ])->firstOrFail();

    expect($order->order_number)->toBe('IORD-'.now()->format('Ymd').'-0001')
        ->and($order->user_id)->toBe($user->id)
        ->and($order->loan_contract_price)->toEqual(10000)
        ->and($order->down_payment)->toEqual(2000)
        ->and($order->promisory_note_value_interest)->toEqual(1)
        ->and($order->promisory_note_value_interest_additional_charge)->toEqual(0)
        ->and(posCreditMoney($order->promisory_note_value))->toBe($expectedPromissoryNoteValue)
        ->and(posCreditMoney($order->total_pnv))->toBe($expectedPromissoryNoteValue)
        ->and(posCreditMoney($order->monthly_payment))->toBe($expectedMonthlyPayment)
        ->and(posCreditMoney($order->remaining_balance))->toBe($expectedPromissoryNoteValue)
        ->and(posCreditPaymentScheduleTotal($order))->toBe($expectedPromissoryNoteValue)
        ->and(posCreditItemSaleTotal($order))->toBe(10000.0)
        ->and(posCreditItemDiscountTotal($order))->toBe(0.0)
        ->and($order->installment_order_payments)->toHaveCount(3);

    expect(posCreditMoney($order->down_payment + $order->total_pnv))
        ->toBe(posCreditMoney($order->loan_contract_price));

    foreach ($order->installment_order_payments as $index => $payment) {
        expect((int) $payment->installment_number)->toBe($index + 1)
            ->and(posCreditMoney($payment->amount_due))->toBe($expectedMonthlyPayment)
            ->and((float) $payment->amount_paid)->toBe(0.0)
            ->and($payment->status)->toBe('pending')
            ->and($payment->due_date)->toBe(now()->parse('2026-06-27')->addMonths($index + 1)->startOfDay()->toDateTimeString());
    }

    $this->assertDatabaseHas('customers', [
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'phone_number' => '09181234567',
    ]);

    $this->assertDatabaseHas('customer_references', [
        'customer_id' => $order->customer_id,
        'full_name' => 'Ana Santos',
        'phone_number' => '09189990000',
    ]);

    $this->assertDatabaseHas('investigation_details', [
        'customer_id' => $order->customer_id,
        'employee_id' => $payload['investigator_id'],
        'home_visit_date' => '2026-06-20',
        'is_employment_verified' => true,
        'id_presented' => 'Driver License',
        'id_number' => 'DL-12345',
    ]);

    $this->assertDatabaseHas('installment_order_items', [
        'installment_order_id' => $order->id,
        'item_id' => $payload['items'][0]['item_id'],
        'sale_amount' => 10000,
        'discount_amount' => 0,
    ]);

    $this->assertDatabaseHas('items', [
        'id' => $payload['items'][0]['item_id'],
        'date_out' => '2026-06-27',
    ]);
});

it('stores an interest-bearing installment order with fixed charge and multiple paid items', function () {
    actingAsPOSCreditUser();

    $itemA = availablePOSCreditItem(['serial' => 'CREDIT-INTEREST-A', 'srp' => 6000]);
    $itemB = availablePOSCreditItem(['serial' => 'CREDIT-INTEREST-B', 'srp' => 4000]);
    $interestConfig = posCreditInterestConfig('appliances', 6);

    $payload = validPOSCreditPayload([
        'is_no_interest' => false,
        'items' => [
            [
                'item_id' => $itemA->id,
                'serial' => $itemA->serial,
                'description' => $itemA->description,
                'model' => $itemA->model,
                'srp' => 6000,
                'item_type' => $itemA->item_type,
            ],
            [
                'item_id' => $itemB->id,
                'serial' => $itemB->serial,
                'description' => $itemB->description,
                'model' => $itemB->model,
                'srp' => 4000,
                'item_type' => $itemB->item_type,
            ],
        ],
        'loan_contract_price' => 11300,
        'lcp_markup_rate' => 1.1,
        'lcp_additional_charge' => 300,
        'down_payment' => 2300,
        'promisory_note_value' => 9000,
        'number_of_terms' => 6,
        'promisory_note_value_interest' => $interestConfig['multiplier'],
        'promisory_note_value_interest_additional_charge' => $interestConfig['fixed_charge'],
        'payment_method' => 'gcash',
        'reference_number' => 'GCREDIT-1001',
        'receipt_number' => 'CR-RCPT-INTEREST',
    ]);
    $expectedLoanContractPrice = posCreditMoney(
        collect($payload['items'])->sum('srp') * $payload['lcp_markup_rate'] + $payload['lcp_additional_charge']
    );
    $expectedPromissoryNoteValue = posCreditMoney($payload['loan_contract_price'] - $payload['down_payment']);
    $expectedFinalPromissoryNoteValue = posCreditMoney(
        $payload['promisory_note_value'] * $payload['promisory_note_value_interest']
            + $payload['promisory_note_value_interest_additional_charge']
    );
    $expectedInterestAndCharges = posCreditMoney($expectedFinalPromissoryNoteValue - $payload['promisory_note_value']);
    $expectedMonthlyPayment = posCreditMoney($expectedFinalPromissoryNoteValue / $payload['number_of_terms']);

    $this->post(route('pos-credit.store'), $payload)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order = InstallmentOrder::with(['installment_order_items', 'installment_order_payments'])
        ->where('receipt_number', 'CR-RCPT-INTEREST')
        ->firstOrFail();

    expect($order->payment_method)->toBe('gcash')
        ->and($order->reference_number)->toBe('GCREDIT-1001')
        ->and(posCreditMoney($order->loan_contract_price))->toBe($expectedLoanContractPrice)
        ->and(posCreditMoney($order->promisory_note_value))->toBe($expectedPromissoryNoteValue)
        ->and(posCreditMoney($order->total_pnv))->toBe($expectedFinalPromissoryNoteValue)
        ->and(posCreditMoney($order->monthly_payment))->toBe($expectedMonthlyPayment)
        ->and(posCreditMoney($order->remaining_balance))->toBe($expectedFinalPromissoryNoteValue)
        ->and(posCreditMoney($order->total_pnv - $order->promisory_note_value))->toBe($expectedInterestAndCharges)
        ->and(posCreditPaymentScheduleTotal($order))->toBe($expectedFinalPromissoryNoteValue)
        ->and(posCreditItemSaleTotal($order))->toBe(10000.0)
        ->and(posCreditItemDiscountTotal($order))->toBe(0.0)
        ->and($order->installment_order_items)->toHaveCount(2)
        ->and($order->installment_order_payments)->toHaveCount(6);

    foreach ($order->installment_order_payments as $payment) {
        expect(posCreditMoney($payment->amount_due))->toBe($expectedMonthlyPayment);
    }

    $this->assertDatabaseHas('installment_order_items', [
        'installment_order_id' => $order->id,
        'item_id' => $itemA->id,
        'sale_amount' => 6000,
        'discount_amount' => 0,
    ]);

    $this->assertDatabaseHas('installment_order_items', [
        'installment_order_id' => $order->id,
        'item_id' => $itemB->id,
        'sale_amount' => 4000,
        'discount_amount' => 0,
    ]);
});

it('stores free items as full discounts without changing the installment total', function () {
    actingAsPOSCreditUser();

    $paidItem = availablePOSCreditItem(['serial' => 'CREDIT-PAID', 'srp' => 9000]);
    $freeItem = availablePOSCreditItem(['serial' => 'CREDIT-FREE', 'srp' => 2500]);

    $payload = validPOSCreditPayload([
        'items' => [
            [
                'item_id' => $paidItem->id,
                'serial' => $paidItem->serial,
                'description' => $paidItem->description,
                'model' => $paidItem->model,
                'srp' => 9000,
                'item_type' => $paidItem->item_type,
            ],
        ],
        'free_items' => [
            [
                'item_id' => $freeItem->id,
                'serial' => $freeItem->serial,
                'description' => $freeItem->description,
                'model' => $freeItem->model,
                'item_type' => $freeItem->item_type,
            ],
        ],
        'receipt_number' => 'CR-RCPT-FREE',
    ]);
    $expectedChargedItemTotal = collect($payload['items'])->sum('srp');
    $expectedFreeItemDiscountTotal = $freeItem->srp;
    $expectedTotalItemValue = posCreditMoney($expectedChargedItemTotal + $expectedFreeItemDiscountTotal);

    $this->post(route('pos-credit.store'), $payload)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order = InstallmentOrder::with(['installment_order_items', 'installment_order_payments'])
        ->where('receipt_number', 'CR-RCPT-FREE')
        ->firstOrFail();

    expect($order->installment_order_items)->toHaveCount(2)
        ->and(posCreditMoney($order->total_pnv))->toBe(7000.0)
        ->and(posCreditPaymentScheduleTotal($order))->toBe(7000.0)
        ->and(posCreditItemSaleTotal($order))->toBe(posCreditMoney($expectedChargedItemTotal))
        ->and(posCreditItemDiscountTotal($order))->toBe(posCreditMoney($expectedFreeItemDiscountTotal))
        ->and(posCreditMoney(posCreditItemSaleTotal($order) + posCreditItemDiscountTotal($order)))->toBe($expectedTotalItemValue);

    $this->assertDatabaseHas('installment_order_items', [
        'installment_order_id' => $order->id,
        'item_id' => $paidItem->id,
        'sale_amount' => 9000,
        'discount_amount' => 0,
    ]);

    $this->assertDatabaseHas('installment_order_items', [
        'installment_order_id' => $order->id,
        'item_id' => $freeItem->id,
        'sale_amount' => 0,
        'discount_amount' => 2500,
    ]);
});

it('stores a no-down-payment interest scenario using the backend special formula', function () {
    actingAsPOSCreditUser();

    $item = availablePOSCreditItem([
        'item_type' => 'gadgets',
        'serial' => 'CREDIT-NO-DP-GADGET',
        'srp' => 10000,
    ]);
    $interestConfig = posCreditInterestConfig('gadgets', 12);

    $payload = validPOSCreditPayload([
        'is_no_interest' => false,
        'items' => [
            [
                'item_id' => $item->id,
                'serial' => $item->serial,
                'description' => $item->description,
                'model' => $item->model,
                'srp' => 10000,
                'item_type' => 'gadgets',
            ],
        ],
        'is_no_down_payment' => true,
        'loan_contract_price' => 10000,
        'lcp_markup_rate' => 1.1,
        'lcp_additional_charge' => 300,
        'down_payment' => 0,
        'promisory_note_value' => 10000,
        'number_of_terms' => 12,
        'promisory_note_value_interest' => $interestConfig['multiplier'],
        'promisory_note_value_interest_additional_charge' => $interestConfig['fixed_charge'],
        'receipt_number' => 'CR-RCPT-NO-DP',
    ]);
    $expectedLoanContractPrice = posCreditMoney(10000 * 1.1 + 300);
    $expectedFinalPromissoryNoteValue = posCreditMoney(
        $expectedLoanContractPrice * 1.33 + 600
    );
    $expectedInterestAndCharges = posCreditMoney($expectedFinalPromissoryNoteValue - $expectedLoanContractPrice);
    $expectedMonthlyPayment = posCreditMoney($expectedFinalPromissoryNoteValue / $payload['number_of_terms']);

    $this->post(route('pos-credit.store'), $payload)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order = InstallmentOrder::with('installment_order_payments')
        ->where('receipt_number', 'CR-RCPT-NO-DP')
        ->firstOrFail();

    expect(posCreditMoney($order->loan_contract_price))->toBe($expectedLoanContractPrice)
        ->and(posCreditMoney($order->promisory_note_value))->toBe($expectedLoanContractPrice)
        ->and(posCreditMoney($order->promisory_note_value_interest))->toBe(1.33)
        ->and(posCreditMoney($order->promisory_note_value_interest_additional_charge))->toBe(600.0)
        ->and(posCreditMoney($order->total_pnv))->toBe($expectedFinalPromissoryNoteValue)
        ->and(posCreditMoney($order->monthly_payment))->toBe($expectedMonthlyPayment)
        ->and(posCreditMoney($order->remaining_balance))->toBe($expectedFinalPromissoryNoteValue)
        ->and(posCreditMoney($order->total_pnv - $order->promisory_note_value))->toBe($expectedInterestAndCharges)
        ->and(posCreditPaymentScheduleTotal($order))->toBe($expectedFinalPromissoryNoteValue)
        ->and($order->installment_order_payments)->toHaveCount($payload['number_of_terms']);

    foreach ($order->installment_order_payments as $payment) {
        expect(posCreditMoney($payment->amount_due))->toBe($expectedMonthlyPayment);
    }
});

it('ignores tampered frontend financial totals and saves backend computed credit totals', function () {
    actingAsPOSCreditUser();

    $item = availablePOSCreditItem([
        'item_type' => 'appliances',
        'serial' => 'CREDIT-TAMPERED-TOTALS',
        'srp' => 10000,
    ]);

    $payload = validPOSCreditPayload([
        'is_no_interest' => false,
        'items' => [
            [
                'item_id' => $item->id,
                'serial' => $item->serial,
                'description' => $item->description,
                'model' => $item->model,
                'srp' => 10000,
                'item_type' => 'appliances',
            ],
        ],
        'loan_contract_price' => 1,
        'lcp_markup_rate' => 1.1,
        'lcp_additional_charge' => 300,
        'down_payment' => 2300,
        'promisory_note_value' => 1,
        'number_of_terms' => 6,
        'promisory_note_value_interest' => 1.18,
        'promisory_note_value_interest_additional_charge' => 300,
        'receipt_number' => 'CR-RCPT-TAMPERED',
    ]);

    $this->post(route('pos-credit.store'), $payload)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order = InstallmentOrder::with('installment_order_payments')
        ->where('receipt_number', 'CR-RCPT-TAMPERED')
        ->firstOrFail();

    $expectedLoanContractPrice = posCreditMoney(10000 * 1.1 + 300);
    $expectedPromissoryNoteValue = posCreditMoney($expectedLoanContractPrice - 2300);
    $expectedFinalPromissoryNoteValue = posCreditMoney($expectedPromissoryNoteValue * 1.18 + 300);

    expect(posCreditMoney($order->loan_contract_price))->toBe($expectedLoanContractPrice)
        ->and(posCreditMoney($order->promisory_note_value))->toBe($expectedPromissoryNoteValue)
        ->and(posCreditMoney($order->total_pnv))->toBe($expectedFinalPromissoryNoteValue)
        ->and(posCreditPaymentScheduleTotal($order))->toBe($expectedFinalPromissoryNoteValue);
});

it('updates existing customer reference and investigation details during checkout', function () {
    actingAsPOSCreditUser();

    $customer = Customer::factory()->create([
        'first_name' => 'Old',
        'last_name' => 'Borrower',
    ]);

    $customer->customer_reference()->create([
        'full_name' => 'Old Reference',
        'phone_number' => '09170000000',
    ]);

    $customer->investigation_detail()->create([
        'employee_id' => Employee::factory()->create()->id,
        'home_visit_date' => '2026-01-01',
        'is_employment_verified' => false,
        'investigation_notes' => 'Old notes',
    ]);

    $payload = validPOSCreditPayload([
        'customer_id' => $customer->id,
        'customer_first_name' => 'Updated',
        'customer_last_name' => 'Borrower',
        'customer_reference_full_name' => 'Updated Reference',
        'customer_reference_phone_number' => '09175551234',
        'investigation_notes' => 'Updated notes',
        'receipt_number' => 'CR-RCPT-EXISTING',
    ]);

    $this->post(route('pos-credit.store'), $payload)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseCount('customers', 1);
    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'first_name' => 'Updated',
        'last_name' => 'Borrower',
    ]);

    $this->assertDatabaseHas('customer_references', [
        'customer_id' => $customer->id,
        'full_name' => 'Updated Reference',
        'phone_number' => '09175551234',
    ]);

    $this->assertDatabaseHas('investigation_details', [
        'customer_id' => $customer->id,
        'investigation_notes' => 'Updated notes',
    ]);
});

it('stores uploaded customer documents during checkout', function () {
    Storage::fake('public');
    actingAsPOSCreditUser();

    $payload = validPOSCreditPayload([
        'receipt_number' => 'CR-RCPT-DOCUMENTS',
        'documents' => [
            UploadedFile::fake()->image('valid-id.jpg', 100, 100),
        ],
    ]);

    $this->post(route('pos-credit.store'), $payload)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order = InstallmentOrder::with('customer.additional_documents')
        ->where('receipt_number', 'CR-RCPT-DOCUMENTS')
        ->firstOrFail();

    expect($order->customer->additional_documents)->toHaveCount(1);

    $document = $order->customer->additional_documents->first();
    expect($document->file_name)->toBe('valid-id.jpg');
    Storage::disk('public')->assertExists($document->file_path);
});

it('validates required customer, reference, investigation, item, and financial fields', function () {
    actingAsPOSCreditUser();

    $this->from(route('pos-credit.index'))
        ->post(route('pos-credit.store'), [])
        ->assertSessionHasErrors([
            'is_no_interest',
            'customer_first_name',
            'customer_last_name',
            'customer_address',
            'city',
            'province',
            'country',
            'customer_reference_full_name',
            'customer_reference_phone_number',
            'investigator_id',
            'home_visit_date',
            'is_employment_verified',
            'location_id',
            'items',
            'loan_contract_price',
            'lcp_markup_rate',
            'lcp_additional_charge',
            'down_payment',
            'promisory_note_value',
            'number_of_terms',
            'promisory_note_value_interest',
            'promisory_note_value_interest_additional_charge',
            'receipt_number',
            'transaction_date',
        ]);
});

it('validates duplicate receipts and item payload fields', function () {
    actingAsPOSCreditUser();

    createPOSCreditOrderRecord([
        'receipt_number' => 'CR-DUPLICATE',
    ]);

    $this->from(route('pos-credit.index'))
        ->post(route('pos-credit.store'), validPOSCreditPayload([
            'receipt_number' => 'CR-DUPLICATE',
            'items' => [
                [
                    'item_id' => 999999,
                    'serial' => '',
                    'description' => '',
                    'model' => '',
                    'srp' => null,
                    'item_type' => '',
                ],
            ],
        ]))
        ->assertSessionHasErrors([
            'receipt_number',
            'items.0.item_id',
            'items.0.serial',
            'items.0.description',
            'items.0.model',
            'items.0.srp',
            'items.0.item_type',
        ]);
});

it('rejects checkout when there are no paid items even if free items are submitted', function () {
    actingAsPOSCreditUser();

    $freeItem = availablePOSCreditItem(['serial' => 'ONLY-FREE', 'srp' => 3000]);

    $payload = validPOSCreditPayload([
        'receipt_number' => 'CR-RCPT-FREE-ONLY',
        'free_items' => [
            [
                'item_id' => $freeItem->id,
                'serial' => $freeItem->serial,
                'description' => $freeItem->description,
                'model' => $freeItem->model,
                'item_type' => $freeItem->item_type,
            ],
        ],
    ]);
    $payload['items'] = [];

    $this->from(route('pos-credit.index'))
        ->post(route('pos-credit.store'), $payload)
        ->assertSessionHasErrors('items');

    $this->assertDatabaseMissing('installment_orders', [
        'receipt_number' => 'CR-RCPT-FREE-ONLY',
    ]);
});

it('rolls back when a paid item is already unavailable', function () {
    actingAsPOSCreditUser();

    $item = availablePOSCreditItem([
        'serial' => 'CREDIT-UNAVAILABLE',
        'date_out' => '2026-06-01',
    ]);

    $payload = validPOSCreditPayload([
        'receipt_number' => 'CR-RCPT-UNAVAILABLE',
        'items' => [
            [
                'item_id' => $item->id,
                'serial' => $item->serial,
                'description' => $item->description,
                'model' => $item->model,
                'srp' => 10000,
                'item_type' => $item->item_type,
            ],
        ],
    ]);

    $this->from(route('pos-credit.index'))
        ->post(route('pos-credit.store'), $payload)
        ->assertSessionHasErrors('message');

    $this->assertDatabaseMissing('installment_orders', [
        'receipt_number' => 'CR-RCPT-UNAVAILABLE',
    ]);

    $this->assertDatabaseMissing('installment_order_items', [
        'item_id' => $item->id,
    ]);
});
