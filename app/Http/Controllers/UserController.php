<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles']);

        $search = $request->input('search');
        $query->when($search, fn($q) => $q->whereAny(['first_name', 'last_name'], 'like', "%{$search}%"));

        $users = $query->latest()->paginate(8);

        return Inertia::render('User/Index', [
            'users' => $users,
            'filters' => ['search' => $search]
        ]);
    }

    public function create()
    {
        return Inertia::render('User/Create',[
             'roles' => Role::select(['id', 'name'])->get()->map(function($role){
                return [
                    'id' => $role->id,
                    'name' => $role->name
                ];
            })
        ]);
    }

    public function edit($id)
    {
        return Inertia::render('User/Edit', [
            'user' => User::with('roles')->findOrFail($id),
            'roles' => Role::select(['id', 'name'])->get()->map(function($role){
                return [
                    'id' => $role->id,
                    'name' => $role->name
                ];
            })
        ]);
    }

    public function show($id)
    {
        return Inertia::render('User/Show', [
            'user' => User::with('roles')->findOrFail($id)
        ]);
    }

    public function store(Request $request)
    {
      
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'roles' => ['required', 'array', 'min:1'],
        ]);

        // Create the user
        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'password' => bcrypt('password'), // Default password, you may want to generate or send via email
        ]);

        // Sync roles using Spatie
        $user->syncRoles($validated['roles']);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'roles' => ['required', 'array', 'min:1'],
        ]);


        DB::beginTransaction();
        // Update user details
        $user->update([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
        ]);


        // Sync roles using Spatie
        $user->syncRoles($validated['roles']);
        DB::commit();

        return redirect()->route('users.show', $user->id)
            ->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User archived successfully.');
    }
}
