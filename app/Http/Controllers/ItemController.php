<?php

namespace App\Http\Controllers;

use App\Exports\ItemsExport;
use App\Imports\ItemsImport;
use App\Models\Supplier;
use App\Models\Item;
use App\Models\Location;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $query = Item::with(['supplier', 'location'])->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('serial', 'like', "%{$search}%");
            });
        }

        if ($availability = $request->input('availability')) {
            if ($availability === 'available') {
                $query->whereNull('date_out');
            } elseif ($availability === 'unavailable') {
                $query->whereNotNull('date_out');
            }
        }

        if ($supplier = $request->input('supplier')) {
            $query->whereHas('supplier', fn($q) => $q->where('slug', $supplier));
        }

        if ($itemType = $request->input('item_type')) {
            $query->where('item_type', $itemType);
        }

        if ($location = $request->input('location')) {
            $query->where('location_id', $location);
        }

        $items = $query->paginate(8)->withQueryString();

        return Inertia::render('Item/Index', [
            'items' => $items,
            'suppliers' => Supplier::dropdown(),
            'locations' => Location::dropdown(),
        ]);
    }


    public function create()
    {
        $suppliers = Supplier::all()->map(function ($supplier) {
            return [
                'slug' => $supplier->slug,
                'name' => $supplier->name,
            ];
        });
        $locations = Location::all()->map(function ($location) {
            return [
                'id' => $location->id,
                'name' => $location->name,
            ];
        });
        return Inertia::render('Item/Create', [
            'suppliers' => $suppliers,
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_type' => 'required|in:appliances,gadgets,furniture',
            'supplier' => 'required|exists:suppliers,slug',
            'location_id' => 'required|exists:locations,id',
            'dr_no' => 'nullable|string|max:255',
            'description' => 'required|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial' => 'required|string|max:255|unique:items,serial',
            'quantity' => 'required|integer|min:1',
            'srp' => 'required|numeric|min:1',
            'unit_cost' => 'required|numeric|min:1',
            'date_of_purchase' => 'required|date',
            'remarks' => 'nullable|string|max:1000',
        ]);

        Item::create($validated);
        return redirect()->route('items.index');
    }

    public function show($id)
    {

        $item = Item::with(['supplier', 'location', 'installment_orders.customer', 'installment_orders.user', 'orders.customer', 'orders.employee'])
            ->findOrFail($id);

        $installmentOrders = $item->installment_orders->map(function ($order) {
            return [
                'order_number' => $order->order_number,
                'customer' => $order->customer->full_name,
                'transaction_date' =>  Carbon::parse($order->transaction_date)->format('F d, Y'),
                'transaction_by' => $order->user->full_name,
                'created_at' => Carbon::parse($order->created_at)->format('F d, Y')
            ];
        });

        $orders = $item->orders->map(function ($order) {
            return [
                'order_number' => $order->order_number,
                'customer' => $order->customer->full_name,
                'transaction_date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
                'transaction_by' => $order->employee->full_name,
                'created_at' => Carbon::parse($order->created_at)->format('F d, Y')
            ];
        });

        $purchaseHistory = collect()
            ->concat($installmentOrders)
            ->concat($orders);


        return Inertia::render('Item/Show', ['item' => $item, 'purchaseHistory' => $purchaseHistory]);
    }

    public function edit($id)
    {
        $item = Item::with(['supplier', 'location'])->findOrFail($id);
        if ($item->date_out != null) {
            return response(status: 403);
        }
        $suppliers = Supplier::all()->map(function ($supplier) {
            return [
                'slug' => $supplier->slug,
                'name' => $supplier->name,
            ];
        });
        $locations = Location::all()->map(function ($location) {
            return [
                'id' => $location->id,
                'name' => $location->name,
            ];
        });
        return Inertia::render('Item/Edit', [
            'item' => $item,
            'suppliers' => $suppliers,
            'locations' => $locations,
        ]);
    }

    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);
        $validated = $request->validate([
            'item_type' => 'required|in:appliances,gadgets,furniture',
            'supplier' => 'required|exists:suppliers,slug',
            'location_id' => 'required|exists:locations,id',
            'dr_no' => 'nullable|string|max:255',
            'description' => 'required|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial' => ['required', 'string', Rule::unique('items', 'serial')->ignore($id)],
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

    public function export(Request $request)
    {
        $query = Item::with(['supplier', 'location']);

        // Apply filters based on request parameters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('description', 'like', "%{$search}%");
        }

        if ($request->filled('availability') && $request->availability !== 'all') {
            if ($request->availability === 'available') {
                $query->whereNull('date_out');
            } else {
                $query->whereNotNull('date_out');
            }
        }


        if ($request->filled('supplier') && $request->supplier !== 'all') {
            $query->where('supplier', $request->supplier);
        }

        if ($request->filled('item_type') && $request->item_type !== 'all') {
            $query->where('item_type', $request->item_type);
        }

        if ($request->filled('location') && $request->location !== 'all') {
            $query->where('location_id', $request->location);
        }

        $items = $query->get();

        $filename = 'items-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new ItemsExport($items), $filename);
    }

    public function createFromImport()
    {
        return Inertia::render('Item/Import', [
            'items' => session('imported_items', [])
        ]);
    }

    public function saveImportedItems()
    {
        $items = session('imported_items', []);
        if (empty($items)) {
            return back()->withErrors(['error' => 'No items to save.']);
        }

        try {
            DB::beginTransaction();
            $savedCount = 0;

            foreach ($items as $item) {
                if (empty($item['item_type'])) {
                    throw new \Exception("Row {$item['row_number']}: Item Type is required.");
                }

                if (empty($item['supplier_name']) || empty($item['location_id'])) {
                    throw new \Exception("Row {$item['row_number']}: Supplier and Location are required.");
                }

                if (empty($item['description'])) {
                    throw new \Exception("Row {$item['row_number']}: Description is required.");
                }

                // Get or create supplier
                $supplierSlug = $this->getOrCreateSupplier($item['supplier_name']);

                Item::create([
                    'item_type' => $item['item_type'],
                    'supplier' => $supplierSlug,
                    'location_id' => $item['location_id'],
                    'dr_no' => $item['dr_no'],
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
                'error' => 'Import failed: ' . $e->getMessage() . "\n\nNo items were saved. Please contact your administrator for more information."
            ]);
        }
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240'
        ]);

        try {
            $rows = Excel::toCollection(new ItemsImport, $request->file('file'))->first();
            $locations = Location::all()->keyBy('name');

            $validItemTypes = ['appliances', 'gadgets', 'furniture'];

            $formattedItems = $rows->skip(1)->filter(function ($row) {
                return !empty($row[0]) || !empty($row[5]);
            })->map(function ($row, $index) use ($locations, $validItemTypes) {
                $itemType = strtolower(trim($row[0] ?? ''));

                // Validate item type
                if (!in_array($itemType, $validItemTypes)) {
                    $itemType = null;
                }

                // Get supplier name (no need to check if exists yet)
                $supplierName = trim($row[1] ?? '');

                $locationName = $row[2] ?? null;
                $locationId = null;
                if ($locationName && isset($locations[$locationName])) {
                    $locationId = $locations[$locationName]->id;
                }

                $dateOfPurchase = $this->convertExcelDate($row[10] ?? null);
                $dateOut = $this->convertExcelDate($row[11] ?? null);

                return [
                    'row_number' => $index + 2, // +2 because we skip header and Excel rows start at 1
                    'item_type' => $itemType,
                    'supplier_name' => $supplierName,
                    'location_id' => $locationId,
                    'location_display' => $locationName,
                    'dr_no' => $row[3] ?? null,
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

    /**
     * Get existing supplier or create new one
     * Returns supplier slug
     */
    private function getOrCreateSupplier($supplierName)
    {
        if (empty($supplierName)) {
            throw new \Exception("Supplier name cannot be empty.");
        }

        // Generate slug from name
        $slug = Str::slug($supplierName);

        // Check if supplier exists by name (case-insensitive)
        $supplier = Supplier::whereRaw('LOWER(name) = ?', [strtolower($supplierName)])->first();

        if (!$supplier) {
            // Check if slug exists, if so make it unique
            $originalSlug = $slug;
            $counter = 1;
            while (Supplier::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Create new supplier
            $supplier = Supplier::create([
                'name' => $supplierName,
                'slug' => $slug,
                'remarks' => 'Auto-created from import'
            ]);
        }

        return $supplier->slug;
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

    public function cancelImport()
    {
        session()->forget('imported_items');
        return redirect()->back()->with('info', 'Import cancelled.');
    }

    public function destroy($id)
    {
        $item = Item::findOrFail($id);
        $item->delete();
        return redirect()->route('items.index');
    }
}
