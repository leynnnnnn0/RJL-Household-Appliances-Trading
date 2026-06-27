<?php

namespace App\Services\People;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class UserService
{
    public function paginate(?string $search = null, int $perPage = 8): LengthAwarePaginator
    {
        return User::query()
            ->with('roles:id,name')
            ->when($search, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function roles()
    {
        return Role::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $roles = $data['roles'];
            unset($data['roles']);

            $user = User::create([
                ...$data,
                'password' => 'password',
            ]);

            $user->syncRoles($roles);

            return $user->load('roles:id,name');
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $roles = $data['roles'];
            unset($data['roles']);

            $user->update($data);
            $user->syncRoles($roles);

            return $user->refresh()->load('roles:id,name');
        });
    }

    public function archive(User $user): void
    {
        $user->delete();
    }
}
