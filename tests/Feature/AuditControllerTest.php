<?php

use App\Models\Branch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use OwenIt\Auditing\Models\Audit;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

function actingAsAuditViewer(): User
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('can view audit logs');

    $user = User::factory()->withoutTwoFactor()->create();
    $user->givePermissionTo('can view audit logs');

    test()->actingAs($user);

    return $user;
}

it('renders the audit module with filters and paginated audit records', function () {
    $user = actingAsAuditViewer();

    Audit::create([
        'user_type' => User::class,
        'user_id' => $user->id,
        'event' => 'login',
        'auditable_type' => User::class,
        'auditable_id' => $user->id,
        'old_values' => [],
        'new_values' => ['email' => $user->email],
        'url' => 'http://localhost/login',
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Pest',
        'tags' => 'authentication',
    ]);

    $this->get(route('audits.index', ['search' => $user->email, 'event' => 'login']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Audit/Index')
            ->where('filters.search', $user->email)
            ->where('filters.event', 'login')
            ->has('audits.data', 1)
            ->where('audits.data.0.event', 'login')
            ->where('audits.data.0.user', $user->full_name)
            ->where('audits.data.0.auditable_name', 'User')
        );
});

it('requires audit log permission', function () {
    $this->actingAs(User::factory()->withoutTwoFactor()->create())
        ->get(route('audits.index'))
        ->assertForbidden();
});

it('allows super admin to view audits without explicit audit permission', function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $role = Role::findOrCreate('super admin');
    $user = User::factory()->withoutTwoFactor()->create();
    $user->assignRole($role);

    $this->actingAs($user)
        ->get(route('audits.index'))
        ->assertOk();
});

it('records audited model changes', function () {
    config(['audit.console' => true]);
    actingAsAuditViewer();

    $branch = Branch::create([
        'name' => 'Audit Branch',
        'address' => 'Bataan',
        'remarks' => 'Created for audit test',
    ]);

    $audit = Audit::where('event', 'created')
        ->where('auditable_type', Branch::class)
        ->where('auditable_id', $branch->id)
        ->firstOrFail();

    expect($audit->new_values['name'])->toBe('Audit Branch');
});

it('records login and logout authentication events', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'email' => 'audited-login@example.com',
    ]);

    $this->post('/login', [
        'email' => 'audited-login@example.com',
        'password' => 'password',
    ])->assertRedirect('/dashboard');

    $this->post('/logout')->assertRedirect('/');

    $this->assertDatabaseHas('audits', [
        'event' => 'login',
        'auditable_type' => User::class,
        'auditable_id' => $user->id,
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseHas('audits', [
        'event' => 'logout',
        'auditable_type' => User::class,
        'auditable_id' => $user->id,
        'user_id' => $user->id,
    ]);
});
