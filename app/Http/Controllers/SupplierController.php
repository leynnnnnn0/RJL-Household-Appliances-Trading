<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Supplier;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;


class SupplierController extends Controller
{
    public function index(){
        return Inertia::render('Supplier/Index',[
            'suppliers' => Supplier::latest()->paginate(8)
        ]);
    }


public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|unique:suppliers,name|max:255',
    ]);
    
    $slug = Str::slug($validated['name']);
    
    $originalSlug = $slug;
    $count = 1;
    
    while (Supplier::where('slug', $slug)->exists()) {
        $slug = $originalSlug . '-' . $count;
        $count++;
    }
    
    $validated['slug'] = $slug;
    
    Supplier::create($validated);
    
    return redirect()->back()->with('success', 'Supplier created successfully.');
    }

   public function update(Request $request, $id)
{
    $validated = $request->validate([
        'name' => [
            'required',
            'string',
            'max:255',
            Rule::unique('suppliers', 'name')->ignore($id)
        ],
        'remarks' => 'nullable|string|max:1000',
    ]);
    
    $supplier = Supplier::findOrFail($id);
    
    $oldSlug = $supplier->slug;
    
    $validated['slug'] = Str::slug($validated['name']);
    
    try {
        DB::beginTransaction();
        $supplier->update($validated);
    
        Item::where('supplier', $oldSlug)
        ->update(['supplier' => $validated['slug']]);

        DB::commit();
    }catch(Exception $e){
        DB::rollBack();
        return redirect()->back()->withErrors(['error' => $e->getMessage()]);
    }
    
    return redirect()->back()->with('success', 'Supplier updated successfully.');
}

  public function destroy($id){
        try {
            Supplier::findOrFail($id)->delete();
            return redirect()->back()->with('success', 'Supplier deleted successfully.');
        }catch(Exception $e){
             return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
        
    }

    
}
