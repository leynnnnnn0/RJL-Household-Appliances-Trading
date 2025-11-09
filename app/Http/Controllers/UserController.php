<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        return Inertia::render('User/Create');
    }

     public function edit($id)
    {
        return Inertia::render('User/Edit',[
            'user' => User::with('roles')->findOrFail($id)
        ]);
    }

    public function show($id)
    {
        return Inertia::render('User/Show',[
            'user' => User::with('roles')->findOrFail($id)
        ]);
    }
}
