<?php

namespace App\Http\Controllers;

use App\Exports\ItemsExport;
use App\Http\Requests\Items\ImportItemsRequest;
use App\Http\Requests\Items\MoveItemRequest;
use App\Http\Requests\Items\UpsertItemRequest;
use App\Models\Item;
use App\Models\Location;
use App\Models\Supplier;
use App\Services\Items\ItemService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ItemController extends Controller
{
    public function __construct(private ItemService $items) {}

    public function index(Request $request)
    {
        return Inertia::render('Item/Index', [
            'items' => $this->items->paginate($this->filters($request)),
            'suppliers' => Supplier::dropdown(),
            'locations' => Location::dropdown(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Item/Create', $this->formOptions());
    }

    public function store(UpsertItemRequest $request)
    {
        $this->items->create($request->validated());

        return redirect()->route('items.index');
    }

    public function show(Item $item)
    {
        $item->load([
            'supplier',
            'location',
            'installment_orders.customer',
            'installment_orders.user',
            'orders.customer',
            'orders.employee',
            'transfer_data.from_location',
            'transfer_data.to_location',
        ]);

        return Inertia::render('Item/Show', [
            'item' => $item,
            'purchaseHistory' => $this->items->purchaseHistory($item),
            'transferHistory' => $this->items->transferHistory($item),
        ]);
    }

    public function edit(Item $item)
    {
        if ($item->date_out != null) {
            return response(status: 403);
        }

        $item->load(['supplier', 'location']);

        return Inertia::render('Item/Edit', [
            'item' => $item,
            ...$this->formOptions(),
        ]);
    }

    public function update(UpsertItemRequest $request, Item $item)
    {
        $this->items->update($item, $request->validated());

        return redirect()->route('items.index');
    }

    public function exportTemplate()
    {
        return Excel::download(new ItemsExport, 'items-template.xlsx');
    }

    public function export(Request $request)
    {
        $items = $this->items->exportItems($this->filters($request));
        $filename = 'items-'.now()->format('Y-m-d-His').'.xlsx';

        return Excel::download(new ItemsExport($items), $filename);
    }

    public function createFromImport()
    {
        return Inertia::render('Item/Import', [
            'items' => session('imported_items', []),
        ]);
    }

    public function saveImportedItems()
    {
        try {
            $savedCount = $this->items->saveImportedItems(session('imported_items', []));
            session()->forget('imported_items');

            return redirect()->route('items.index')
                ->with('success', "$savedCount items saved successfully!");
        } catch (Exception $e) {
            return back()->withErrors([
                'error' => $e->getMessage() === 'No items to save.'
                    ? $e->getMessage()
                    : 'Import failed: '.$e->getMessage()."\n\nNo items were saved. Please contact your administrator for more information.",
            ]);
        }
    }

    public function import(ImportItemsRequest $request)
    {
        try {
            $formattedItems = $this->items->importPreview($request->file('file'));
            session(['imported_items' => $formattedItems]);

            return redirect()->back()->with('success', count($formattedItems).' items imported successfully. Please review before saving.');
        } catch (Exception $e) {
            return redirect()->back()->withErrors('error', 'Error importing file: '.$e->getMessage());
        }
    }

    public function move(MoveItemRequest $request, Item $item)
    {
        $this->items->move($item, $request->validated());

        return redirect()->back()->with('success', 'Item moved successfully.');
    }

    public function cancelImport()
    {
        session()->forget('imported_items');

        return redirect()->back()->with('info', 'Import cancelled.');
    }

    public function destroy(Item $item)
    {
        $this->items->delete($item);

        return redirect()->route('items.index');
    }

    private function filters(Request $request): array
    {
        return $request->only(['search', 'availability', 'supplier', 'item_type', 'location']);
    }

    private function formOptions(): array
    {
        return [
            'suppliers' => Supplier::dropdown(),
            'locations' => Location::dropdown(),
        ];
    }
}
