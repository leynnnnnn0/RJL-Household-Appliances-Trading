<?php

namespace App\Http\Controllers;

use App\Http\Requests\People\UpsertUserRequest;
use App\Models\User;
use App\Services\People\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(private UserService $users) {}

    public function index(Request $request)
    {
        $search = $request->input('search');

        return Inertia::render('User/Index', [
            'users' => $this->users->paginate($search),
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return Inertia::render('User/Create', [
            'roles' => $this->users->roles(),
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('User/Edit', [
            'user' => $user->load('roles:id,name'),
            'roles' => $this->users->roles(),
        ]);
    }

    public function show(User $user)
    {
        return Inertia::render('User/Show', [
            'user' => $user->load('roles:id,name'),
        ]);
    }

    public function store(UpsertUserRequest $request)
    {
        $this->users->create($request->validated());

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    public function update(UpsertUserRequest $request, User $user)
    {
        $this->users->update($user, $request->validated());

        return redirect()->route('users.show', $user->id)
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $this->users->archive($user);

        return redirect()->route('users.index')
            ->with('success', 'User archived successfully.');
    }
}
