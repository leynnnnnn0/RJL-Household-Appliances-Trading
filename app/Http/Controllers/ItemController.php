<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index(){
        $items = Item::with(['category', 'location'])->get();
           $categories = Category::all()->map(function($category){
            return [
                'slug' => $category->slug,
                'name' => $category->name,
            ];
        });
        return Inertia::render('Item/Index',[
            'items' => $items,
            'categories' => $categories,
        ]);
    }

    public function create(){
        $categories = Category::all()->map(function($category){
            return [
                'slug' => $category->slug,
                'name' => $category->name,
            ];
        });
        $locations = Location::all()->map(function($location){
            return [
                'id' => $location->id,
                'name' => $location->name,
            ];
        });
        return Inertia::render('Item/Create', [
            'categories' => $categories,
            'locations' => $locations,
        ]);
    }

    public function store(Request $request){
        $validated = $request->validate([
            'category' => 'required|exists:categories,slug',
            'location_id' => 'required|exists:locations,id',
            'dr_no' => 'nullable|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'description' => 'required|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'srp' => 'required|numeric|min:1',
            'unit_cost' => 'required|numeric|min:1',
            'date_of_purchase' => 'required|date',

            'remarks' => 'nullable|string|max:1000',
        ]);

        Item::create($validated);
        return redirect()->route('items.index');
    }

    public function show($id){
        return Inertia::render('Item/Show', ['id' => $id]);
    }

    public function edit($id){
        return Inertia::render('Item/Edit', ['id' => $id]);
    }
}
