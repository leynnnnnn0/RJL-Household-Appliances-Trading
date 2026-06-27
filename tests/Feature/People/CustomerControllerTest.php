<?php

use App\Models\AdditionalDocument;
use App\Models\Customer;
use App\Models\CustomerReference;
use App\Models\Employee;
use App\Models\InvestigationDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsCustomerManager(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();

    foreach (['can view customers', 'can view customer details'] as $permission) {
        Permission::findOrCreate($permission);
    }

    $user->givePermissionTo(['can view customers', 'can view customer details']);

    return $user;
}

function validCustomerControllerUpdatePayload(Employee $employee, array $overrides = []): array
{
    return array_merge([
        'first_name' => 'Updated',
        'last_name' => 'Customer',
        'email' => 'updated.customer@example.com',
        'address' => '123 Updated Street',
        'city' => 'Updated City',
        'province' => 'Updated Province',
        'zipcode' => '2100',
        'country' => 'PHILIPPINES',
        'phone_number' => '09991234567',
        'reference_full_name' => 'Reference Person',
        'reference_phone_number' => '09881234567',
        'employee_id' => $employee->id,
        'home_visit_date' => now()->toDateString(),
        'is_employment_verified' => true,
        'investigation_notes' => 'Verified during home visit.',
        'id_presented' => 'National ID',
        'id_number' => 'ID-12345',
        'civil_status' => 'Single',
        'spouse_name' => null,
        'spouse_contact_number' => null,
    ], $overrides);
}

it('renders customer index, show, and edit pages', function () {
    $this->actingAs(actingAsCustomerManager());
    $customer = Customer::factory()->create(['first_name' => 'Ana']);
    CustomerReference::factory()->create(['customer_id' => $customer->id]);
    InvestigationDetail::factory()->create(['customer_id' => $customer->id]);

    $this->get(route('customers.index', ['search' => 'Ana']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Index')
            ->where('filters.search', 'Ana')
            ->has('customers.data', 1)
        );

    $this->get(route('customers.show', $customer))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Show')
            ->where('customer.id', $customer->id)
            ->has('backUrl')
        );

    $this->get(route('customers.edit', $customer))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Edit')
            ->where('customer.id', $customer->id)
            ->has('employees')
            ->has('backUrl')
        );
});

it('validates customer updates', function () {
    $this->actingAs(actingAsCustomerManager());
    $customer = Customer::factory()->create();

    $this->from(route('customers.edit', $customer))
        ->put(route('customers.update', $customer), [])
        ->assertSessionHasErrors([
            'first_name',
            'last_name',
            'address',
            'city',
            'province',
            'country',
            'reference_full_name',
            'reference_phone_number',
            'employee_id',
            'home_visit_date',
            'is_employment_verified',
            'investigation_notes',
        ]);
});

it('updates a customer with reference and investigation details', function () {
    $this->actingAs(actingAsCustomerManager());
    $customer = Customer::factory()->create(['email' => 'original@example.com']);
    $employee = Employee::factory()->create();

    $this->put(route('customers.update', $customer), validCustomerControllerUpdatePayload($employee))
        ->assertRedirect(route('customers.show', $customer->id));

    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'first_name' => 'Updated',
        'email' => 'updated.customer@example.com',
    ]);

    $this->assertDatabaseHas('customer_references', [
        'customer_id' => $customer->id,
        'full_name' => 'Reference Person',
    ]);

    $this->assertDatabaseHas('investigation_details', [
        'customer_id' => $customer->id,
        'employee_id' => $employee->id,
        'id_presented' => 'National ID',
    ]);
});

it('validates unique customer email on update', function () {
    $this->actingAs(actingAsCustomerManager());
    $customer = Customer::factory()->create(['email' => 'original@example.com']);
    $employee = Employee::factory()->create();
    $duplicate = Customer::factory()->create(['email' => 'duplicate.customer@example.com']);

    $this->from(route('customers.edit', $customer))
        ->put(route('customers.update', $customer), validCustomerControllerUpdatePayload($employee, [
            'email' => $duplicate->email,
        ]))
        ->assertSessionHasErrors(['email']);
});

it('deletes a customer document when it belongs to the customer', function () {
    $this->actingAs(actingAsCustomerManager());
    Storage::fake('public');

    $customer = Customer::factory()->create();
    $document = AdditionalDocument::factory()->create([
        'customer_id' => $customer->id,
        'file_path' => 'customer-documents/test.pdf',
    ]);

    Storage::disk('public')->put($document->file_path, 'fake pdf content');

    $this->from(route('customers.show', $customer))
        ->delete(route('customers.documents.destroy', [$customer, $document]))
        ->assertRedirect(route('customers.show', $customer));

    $this->assertDatabaseMissing('additional_documents', ['id' => $document->id]);
    Storage::disk('public')->assertMissing($document->file_path);
});

it('does not delete a customer document that belongs to another customer', function () {
    $this->actingAs(actingAsCustomerManager());

    $customer = Customer::factory()->create();
    $otherCustomer = Customer::factory()->create();
    $otherDocument = AdditionalDocument::factory()->create([
        'customer_id' => $otherCustomer->id,
        'file_path' => 'customer-documents/other.pdf',
    ]);

    $this->delete(route('customers.documents.destroy', [$customer, $otherDocument]))
        ->assertNotFound();

    $this->assertDatabaseHas('additional_documents', ['id' => $otherDocument->id]);
});
