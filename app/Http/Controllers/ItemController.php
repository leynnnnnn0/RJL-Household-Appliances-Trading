<?php

namespace App\Http\Controllers;

use App\Exports\ItemsExport;
use App\Imports\ItemsImport;
use App\Models\Category;
use App\Models\Item;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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
        $item = Item::with(['category', 'location'])->findOrFail($id);
        return Inertia::render('Item/Show', ['item' => $item]);
    }

    public function edit($id){
        $item = Item::with(['category', 'location'])->findOrFail($id);
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
        return Inertia::render('Item/Edit', [
            'item' => $item,
            'categories' => $categories,
            'locations' => $locations,
        ]);
    }

    public function update(Request $request, $id){
        $item = Item::findOrFail($id);
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
            'date_out' => 'nullable|date',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $item->update($validated);
        return redirect()->route('items.index');
    }

    public function exportTemplate()
    {
        return Excel::download(new ItemsExport, 'items-template.xlsx');
    }

    public function createFromImport(){
        return Inertia::render('Item/Import', [
            'items' => session('imported_items', [])
        ]);
    }

    public function import(Request $request){
    $request->validate([
        'file' => 'required|mimes:xlsx,xls,csv|max:10240'
    ]);

    try {
        $rows = Excel::toCollection(new ItemsImport, $request->file('file'))->first();
        
        $categories = Category::all()->keyBy('name');
        $locations = Location::all()->keyBy('name');
        
        $formattedItems = $rows->skip(1)->filter(function($row) {
            return !empty($row[0]) || !empty($row[4]);
        })->map(function($row, $index) use ($categories, $locations) {
            $categoryName = $row[0] ?? null;
            $categorySlug = null;
            if ($categoryName && isset($categories[$categoryName])) {
                $categorySlug = $categories[$categoryName]->slug;
            }
            
            $locationName = $row[1] ?? null;
            $locationId = null;
            if ($locationName && isset($locations[$locationName])) {
                $locationId = $locations[$locationName]->id;
            }
            
            $dateOfPurchase = $this->convertExcelDate($row[10] ?? null);
            $dateOut = $this->convertExcelDate($row[11] ?? null);
            
            return [
                'row_number' => $index,
                'category' => $categorySlug,
                'category_display' => $categoryName,
                'location_id' => $locationId,
                'location_display' => $locationName,
                'dr_no' => $row[2] ?? null,
                'supplier' => $row[3] ?? null,
                'description' => $row[4] ?? null,
                'model' => $row[5] ?? null,
                'serial' => $row[6] ?? null,
                'quantity' => $row[7] ?? null,
                'srp' => $row[8] ?? null,
                'unit_cost' => $row[9] ?? null,
                'date_of_purchase' => $dateOfPurchase,
                'date_out' => $dateOut,
                'size' => $row[12] ?? null,
                'remarks' => $row[13] ?? null,
            ];
        })->values()->toArray();

        session(['imported_items' => $formattedItems]);

        return redirect()->back()->with('success', count($formattedItems) . ' items imported successfully. Please review before saving.');
    } catch (\Exception $e) {
        return redirect()->back()->withErrors('error', 'Error importing file: ' . $e->getMessage());
    }
}

private function convertExcelDate($value)
{
    if (empty($value)) {
        return null;
    }
    
    if (is_string($value)) {
        try {
            return \Carbon\Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
    
    if (is_numeric($value)) {
        try {
            $unix_date = ($value - 25569) * 86400;
            return \Carbon\Carbon::createFromTimestamp($unix_date)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
    
    return null;
}

     public function cancelImport(){
        session()->forget('imported_items');
        return redirect()->back()->with('info', 'Import cancelled.');
    }

    public function saveImportedItems(){
    $items = session('imported_items', []);
    
    if (empty($items)) {
        return back()->withErrors(['error' => 'No items to save.']);
    }
    
    try {
        DB::beginTransaction();
        $savedCount = 0;
        
        foreach ($items as $item) {
            if (empty($item['category']) || empty($item['location_id'])) {
                throw new \Exception("Row {$item['row_number']}: Category and Location are required.");
            }
            
            if (empty($item['description'])) {
                throw new \Exception("Row {$item['row_number']}: Description is required.");
            }
            
            Item::create([
                'category' => $item['category'],
                'location_id' => $item['location_id'],
                'dr_no' => $item['dr_no'],
                'supplier' => $item['supplier'],
                'description' => $item['description'],
                'model' => $item['model'],
                'serial' => $item['serial'],
                'quantity' => $item['quantity'],
                'srp' => $item['srp'],
                'unit_cost' => $item['unit_cost'],
                'date_of_purchase' => $item['date_of_purchase'],
                'date_out' => $item['date_out'],
                'remarks' => $item['remarks'],
            ]);
            
            $savedCount++;
        }
        
        DB::commit();
        session()->forget('imported_items');
        
        return redirect()->route('items.index')
        ->with('success', "$savedCount items saved successfully!");
            
    } catch (\Exception $e) {
        DB::rollBack();
        
        return back()->withErrors([
            'error' => 'Import failed: ' . $e->getMessage() . "\n\nNo items were saved."
        ]);
    }
}

}
