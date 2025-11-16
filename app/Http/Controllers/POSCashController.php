<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Item;
use App\Models\Location;
use App\Models\Order;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Str;

class POSCashController extends Controller
{
    public function index()
    {
        return Inertia::render('POSCash/Index', [
            'locations' => Location::dropdown(),
            'employees' => User::dropdown(),
            'transactions' => Order::with('order_items.item', 'location')->whereDate('transaction_date', today())->where('employee_id', Auth::id())->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string',
            'province' => 'required|string',
            'zipcode' => 'nullable|string',
            'country' => 'required|string',
            'email' => 'nullable|string',
            'existing_customer_id' => 'nullable|numeric',
            'phone' => ['nullable', 'regex:/^09\d{9}$/'],
            'payment_method' => 'required|string|in:Cash,Gcash,Bank Transfer,Debit/Credit Card,Home Credit/Skyro/Billease',
            'reference_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(function () use ($request) {
                    return $request->payment_method !== 'Cash';
                })
            ],
            'location_id' => 'required|exists:locations,id',
            'employee_id' => 'required|exists:users,id',
            'orders' => 'required',
            'total_price' => 'required|numeric',
            'receipt_number' => 'required|unique:orders,receipt_number',
        ]);


        $validated['order_number'] = $this->generateOrderNumber();

        try {
            DB::beginTransaction();

            if (isset($validated['existing_customer_id'])) {
                $customer = Customer::findOrFail($validated['existing_customer_id']);
                $customer->update([
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'address' => $validated['address'],
                    'phone_number' => $validated['phone'],
                    'email' => $validated['email'],
                    'city' => $validated['city'],
                    'province' => $validated['province'],
                    'zipcode' => $validated['zipcode'],
                    'country' => $validated['country'],
                ]);
            } else {
                $customer = Customer::create([
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'address' => $validated['address'],
                    'phone_number' => $validated['phone'],
                    'email' => $validated['email'],
                    'city' => $validated['city'],
                    'province' => $validated['province'],
                    'zipcode' => $validated['zipcode'],
                    'country' => $validated['country'],
                ]);
            }

            $order = Order::create([
                'customer_id' => $customer->id,
                'location_id' => $validated['location_id'],
                'employee_id' => $validated['employee_id'],
                'order_number' => $validated['order_number'],
                'total_price' => $validated['total_price'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'transaction_date' => now(),
                'receipt_number' => $validated['receipt_number']
            ]);

            // Coming on this part

            foreach ($validated['orders'] as $item) {

                $iventoryItem = Item::where('date_out', null)->findOrFail($item['id']);
                $iventoryItem->update(['date_out' => Carbon::parse(Carbon::parse($order->transaction_date)->toDateString())]);

                $order->order_items()->create([
                    'order_number' => $order->order_number,
                    'serial' => $item['serial'],
                    'item_id' => $item['id'],
                    'sale_amount' => $item['sale_amount'],
                    'discount_amount' => $iventoryItem->srp - $item['sale_amount']
                ]);
            }
            DB::commit();
        } catch (Exception $e) {

            DB::rollBack();
            return back()->withErrors([
                'error' => $e->getMessage()
            ]);
        }
    }

    public function generateOrderNumber()
    {
        $date = now()->format('Ymd');
        $lastOrder = Order::whereDate('created_at', today())
            ->latest('id')
            ->first();

        $sequence = $lastOrder ? intval(substr($lastOrder->order_number, -4)) + 1 : 1;
        return 'ORD-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
