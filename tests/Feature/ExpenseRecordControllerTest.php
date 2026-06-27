<?php

use App\Models\Branch;
use App\Models\ExpenseRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsExpenseRecordManager(bool $superAdmin = false): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();

    if ($superAdmin) {
        Role::findOrCreate('super admin');
        $user->assignRole('super admin');
    }

    collect([
        'can view expense records',
        'can view expense record details',
        'can add expense record',
        'can edit expense record',
        'can delete expense record',
        'can review expense record',
    ])->each(fn (string $permission) => Permission::findOrCreate($permission));

    $user->givePermissionTo([
        'can view expense records',
        'can view expense record details',
        'can add expense record',
        'can edit expense record',
        'can delete expense record',
        'can review expense record',
    ]);

    test()->actingAs($user);

    return $user;
}

function validExpenseRecordPayload(array $overrides = []): array
{
    $user = User::factory()->create();
    $branch = Branch::factory()->create();

    return array_merge([
        'user_id' => $user->id,
        'amount' => 1250.75,
        'category' => 'fuel',
        'payment_method' => 'cash',
        'reference_number' => 'EXP-1001',
        'remarks' => 'Fuel allowance',
        'expense_date' => now()->toDateString(),
        'branch_id' => $branch->id,
    ], $overrides);
}

it('renders expense record index, create, show, and edit pages', function () {
    $user = actingAsExpenseRecordManager(superAdmin: true);
    $record = ExpenseRecord::factory()->create([
        'user_id' => $user->id,
        'reference_number' => 'SEARCH-EXPENSE',
        'branch_id' => Branch::factory(),
        'expense_date' => now()->toDateString(),
    ]);

    $this->get(route('expense-record.index', ['search' => 'SEARCH-EXPENSE']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ExpenseRecord/Index')
            ->where('filters.search', 'SEARCH-EXPENSE')
            ->has('expense_record.data', 1)
            ->has('users')
        );

    $this->get(route('expense-record.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ExpenseRecord/Create')
            ->has('users')
            ->has('branches')
        );

    $this->get(route('expense-record.show', $record))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ExpenseRecord/Show')
            ->where('expense_record.id', $record->id)
            ->has('expense_record.user')
            ->has('expense_record.branch')
        );

    $this->get(route('expense-record.edit', $record))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ExpenseRecord/Edit')
            ->where('expense_record.id', $record->id)
            ->has('users')
            ->has('branches')
        );
});

it('limits non super admin index records to their own expenses', function () {
    $user = actingAsExpenseRecordManager();

    ExpenseRecord::factory()->create([
        'user_id' => $user->id,
        'reference_number' => 'OWN-EXPENSE',
    ]);

    ExpenseRecord::factory()->create([
        'user_id' => User::factory(),
        'reference_number' => 'OTHER-EXPENSE',
    ]);

    $this->get(route('expense-record.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('expense_record.data', 1)
            ->where('expense_record.data.0.reference_number', 'OWN-EXPENSE')
        );
});

it('stores an expense record and validates required fields', function () {
    actingAsExpenseRecordManager();

    $this->from(route('expense-record.create'))
        ->post(route('expense-record.store'), [])
        ->assertSessionHasErrors([
            'user_id',
            'amount',
            'category',
            'payment_method',
            'expense_date',
            'branch_id',
        ]);

    $this->post(route('expense-record.store'), validExpenseRecordPayload())
        ->assertRedirect(route('expense-record.index'));

    $this->assertDatabaseHas('expense_records', [
        'reference_number' => 'EXP-1001',
        'status' => 'approved',
    ]);
});

it('updates an expense record and preserves the receipt when no new file is uploaded', function () {
    actingAsExpenseRecordManager();
    $record = ExpenseRecord::factory()->create([
        'receipt_path' => 'receipts/original.jpg',
        'branch_id' => Branch::factory(),
        'expense_date' => now()->subDay()->toDateString(),
    ]);

    $this->put(route('expense-record.update', $record), validExpenseRecordPayload([
        'amount' => 999.50,
        'reference_number' => 'UPDATED-EXPENSE',
    ]))->assertRedirect(route('expense-record.index'));

    $this->assertDatabaseHas('expense_records', [
        'id' => $record->id,
        'amount' => 999.50,
        'reference_number' => 'UPDATED-EXPENSE',
        'receipt_path' => 'receipts/original.jpg',
    ]);
});

it('replaces receipt files on update and deletes receipt files on destroy', function () {
    Storage::fake('public');
    actingAsExpenseRecordManager();

    Storage::disk('public')->put('receipts/original.jpg', 'old receipt');

    $record = ExpenseRecord::factory()->create([
        'receipt_path' => 'receipts/original.jpg',
        'branch_id' => Branch::factory(),
        'expense_date' => now()->toDateString(),
    ]);

    $this->post(route('expense-record.update', $record), array_merge(
        validExpenseRecordPayload(),
        [
            '_method' => 'PUT',
            'receipt_path' => UploadedFile::fake()->image('new-receipt.jpg'),
        ],
    ))->assertRedirect(route('expense-record.index'));

    Storage::disk('public')->assertMissing('receipts/original.jpg');

    $record->refresh();
    Storage::disk('public')->assertExists($record->receipt_path);

    $this->delete(route('expense-record.destroy', $record))
        ->assertRedirect(route('expense-record.index'));

    Storage::disk('public')->assertMissing($record->receipt_path);
    $this->assertDatabaseMissing('expense_records', ['id' => $record->id]);
});

it('updates expense record status and review metadata', function () {
    $reviewer = actingAsExpenseRecordManager();
    $record = ExpenseRecord::factory()->create(['status' => 'pending']);

    $this->put(route('expense-record.update-status', $record), ['status' => 'approved'])
        ->assertRedirect();

    $this->assertDatabaseHas('expense_records', [
        'id' => $record->id,
        'status' => 'approved',
        'approved_by' => $reviewer->id,
    ]);

    expect($record->refresh()->approved_at)->not()->toBeNull();
});

it('validates expense record status updates', function () {
    actingAsExpenseRecordManager();
    $record = ExpenseRecord::factory()->create();

    $this->from(route('expense-record.show', $record))
        ->put(route('expense-record.update-status', $record), ['status' => 'invalid'])
        ->assertSessionHasErrors('status');
});
