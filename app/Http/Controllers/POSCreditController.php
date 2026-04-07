<?php

namespace App\Http\Controllers;

use App\Models\AdditionalDocument;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderItem;
use App\Models\InstallmentOrderPayment;
use App\Models\Item;
use App\Models\Location;
use App\Models\Order;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class POSCreditController extends Controller
{
    public function index()
    {
        $transactions = InstallmentOrder::with('customer')
            ->when(!Auth::user()->getRoleNames()->contains('super admin'), fn($q) => $q->where('user_id', Auth::id()))
            ->whereDate('transaction_date', today())
            ->latest()
            ->get()
            ->map(function ($tranction) {
                return [
                    'order_number' => $tranction->order_number,
                    'customer' => $tranction->customer->full_name,
                    'term' => $tranction->number_of_terms
                ];
            });

        return Inertia::render('POSCredit/Index', [
            'employees' => Employee::dropdown(),
            'locations' => Branch::dropdown(),
            'transactions' => $transactions
        ]);
    }

   public function store(Request $request)
{
    $validated = $request->validate([
        'is_no_interest' => 'required',
        'customer_id' => 'nullable|exists:customers,id',
        'customer_first_name' => 'required|string',
        'customer_last_name' => 'required',
        'customer_address' => 'required|string',
        'customer_phone_number' => 'nullable|string',
        'city' => 'required|string',
        'province' => 'required|string',
        'zipcode' => 'nullable|string',
        'country' => 'required|string',
        'email' => 'nullable|string',
        'customer_reference_full_name' => 'required|string',
        'customer_reference_phone_number' => 'required|string',
        'investigator_id' => 'required|exists:employees,id',
        'home_visit_date' => 'required',
        'is_employment_verified' => 'required',
        'investigation_notes' => 'nullable|string',
        'location_id' => 'required|exists:branches,id',
        'items' => 'required|array', // Array of paid items
        'items.*.item_id' => 'required|exists:items,id',
        'items.*.serial' => 'required|string',
        'items.*.description' => 'required|string',
        'items.*.model' => 'required|string',
        'items.*.srp' => 'required|numeric',
        'items.*.item_type' => 'required|string',
        'free_items' => 'nullable|array', // Array of free items
        'free_items.*.item_id' => 'required|exists:items,id',
        'free_items.*.serial' => 'required|string',
        'free_items.*.description' => 'required|string',
        'free_items.*.model' => 'required|string',
        'free_items.*.item_type' => 'required|string',
        'loan_contract_price' => 'required',
        'lcp_markup_rate' => 'required',
        'lcp_additional_charge' => 'required',
        'down_payment' => 'required',
        'payment_method' => 'nullable|string',
        'reference_number' => 'nullable',
        'promisory_note_value' => 'required',
        'number_of_terms' => 'required',
        'promisory_note_value_interest' => 'required',
        'promisory_note_value_interest_additional_charge' => 'required',
        'receipt_number' => 'required|unique:installment_orders,receipt_number',
        'transaction_date' => 'required',
        'documents' => 'nullable',
        'id_presented' => 'nullable|string',
        'id_number' => 'nullable|string',
        'civil_status' => 'nullable|string',
        'spouse_name' => 'nullable|string',
        'spouse_contact_number' => 'nullable|string',
    ]);



    try {
        DB::beginTransaction();

        // Get items arrays
        $items = $validated['items'];
        $freeItems = $validated['free_items'] ?? [];

        if (empty($items)) {
            throw new Exception('At least one paid item is required');
        }

        // Create or update customers
        $customer = null;
        if ($validated['customer_id'] == null) {
            $customer = Customer::create([
                'first_name' => $validated['customer_first_name'],
                'last_name' => $validated['customer_last_name'],
                'address' => $validated['customer_address'],
                'phone_number' => $validated['customer_phone_number'],
                'email' => $validated['email'],
                'city' => $validated['city'],
                'province' => $validated['province'],
                'zipcode' => $validated['zipcode'],
                'country' => $validated['country'],
            ]);
        } else {
            $customer = Customer::findOrFail($validated['customer_id']);
            $customer->update([
                'first_name' => $validated['customer_first_name'],
                'last_name' => $validated['customer_last_name'],
                'address' => $validated['customer_address'],
                'phone_number' => $validated['customer_phone_number'],
                'email' => $validated['email'],
                'city' => $validated['city'],
                'province' => $validated['province'],
                'zipcode' => $validated['zipcode'],
                'country' => $validated['country'],
            ]);
        }

        // Handle document uploads
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $path = $file->store('customer-documents', 'public');

                $customer->additional_documents()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        // Update or create customer reference
        $customer->customer_reference()->updateOrCreate(
            ['customer_id' => $customer->id],
            [
                'full_name' => $validated['customer_reference_full_name'],
                'phone_number' => $validated['customer_reference_phone_number']
            ]
        );

        // Update or create investigation detail
        $customer->investigation_detail()->updateOrCreate(
            ['customer_id' => $customer->id],
            [
                'employee_id' => $validated['investigator_id'],
                'home_visit_date' => $validated['home_visit_date'],
                'is_employment_verified' => $validated['is_employment_verified'],
                'investigation_notes' => $validated['investigation_notes'],
                'id_presented' => $validated['id_presented'],
                'id_number' => $validated['id_number'],
                'civil_status' => $validated['civil_status'],
                'spouse_name' => $validated['spouse_name'],
                'spouse_contact_number' => $validated['spouse_contact_number'],
            ]
        );

 

        // Create installment order
        $order = InstallmentOrder::create([
            'customer_id' => $customer->id,
            'location_id' => 1,// todo
            'branch_id' => $validated['location_id'],
            'user_id' => Auth::id(),
            'order_number' => $this->generateOrderNumber(),
            'loan_contract_price' => $validated['loan_contract_price'],
            'lcp_markup_rate' => $validated['lcp_markup_rate'],
            'lcp_additional_charge' => $validated['lcp_additional_charge'],
            'down_payment' => $validated['down_payment'],
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'],
            'promisory_note_value' => $validated['promisory_note_value'],
            'number_of_terms' => $validated['number_of_terms'],
            'promisory_note_value_interest' => $validated['promisory_note_value_interest'],
            'promisory_note_value_interest_additional_charge' => $validated['promisory_note_value_interest_additional_charge'],
            'transaction_date' => $validated['transaction_date'],
            'receipt_number' => $validated['receipt_number'],
        ]);

            // Calculate total sale amount for paid items

            // $total = $validated['is_no_interest'] ? $validated['loan_contract_price']  : $order->promisory_note_value * $order->promisory_note_value_interest + floatval($order->promisory_note_value_interest_additional_charge);
            $total = $validated['is_no_interest']
                ? $validated['loan_contract_price'] - floatval($validated['down_payment'])
                : $order->promisory_note_value * $order->promisory_note_value_interest
                + floatval($order->promisory_note_value_interest_additional_charge);

       



        // Create paid items
        foreach ($items as $item) {
            InstallmentOrderItem::create([
                'installment_order_id' => $order->id,
                'item_id' => $item['item_id'],
                'serial' => $item['serial'],
                'sale_amount' => $item['srp'],
                'discount_amount' => 0
            ]);

            // Update inventory item
            $inventoryItem = Item::where('date_out', null)->findOrFail($item['item_id']);
            $inventoryItem->update(['date_out' => Carbon::parse($order->transaction_date)->toDateString()]);
        }

        // Create free items (discount_amount = SRP, sale_amount = 0)
        foreach ($freeItems as $freeItem) {
            // Get the item's SRP from database
            $inventoryItem = Item::findOrFail($freeItem['item_id']);
            
            InstallmentOrderItem::create([
                'installment_order_id' => $order->id,
                'item_id' => $freeItem['item_id'],
                'serial' => $freeItem['serial'],
                'sale_amount' => 0,
                'discount_amount' => $inventoryItem->srp // Discount equals SRP for free items
            ]);

            // Update inventory item
            $inventoryItem->update(['date_out' => Carbon::parse($order->transaction_date)->toDateString()]);
        }

        // Create installment payment schedule
        $monthlyPayment = $total / $order->number_of_terms;
            // If no interest but HAS a down payment, schedule should start at month 1
            $startCount = 1;
            $numberOfTerms = $order->number_of_terms;


        for ($i = $startCount; $i <= $numberOfTerms; $i++) {
            InstallmentOrderPayment::create([
                'installment_order_id' => $order->id,
                'installment_number' => $i,
                'amount_due' => $monthlyPayment,
                'amount_paid' => 0,
                'due_date' => Carbon::parse($order->transaction_date)->addMonths($i),
                'payment_method' => null,
                'reference_number' => null,
                'status' => 'pending', // pending, paid, overdue, partial
                'paid_date' => null,
            ]);
        }

        DB::commit();
        return back()->with('success', 'Created Successfully');
    } catch (Exception $e) {
        DB::rollBack();
        return back()->withErrors([
            'message' => $e->getMessage(),
        ]);
    }
}

    public function generateOrderNumber()
    {
        $date = now()->format('Ymd');
        $lastOrder = InstallmentOrder::whereDate('created_at', today())
            ->latest('id')
            ->first();

        $sequence = $lastOrder ? intval(substr($lastOrder->order_number, -4)) + 1 : 1;
        return 'IORD-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
 