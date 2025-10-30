<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Location;
use App\Models\Order;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Str;

class POSCashController extends Controller
{
    public function index()
    {
        return Inertia::render('POSCash/Index',[
            'locations' => Location::dropdown(),
            'employees' => User::dropdown(),
            'transactions' => Order::with('order_items.item', 'location')->whereDate('transaction_date', today())->latest()->get()
        ]);
    } 

    public function store(Request $request)
    {
        $validated = $request->validate([
            'location_id' => 'required|exists:locations,id',
            'employee_id' => 'required|exists:users,id',
            'orders' => 'required',
            'total_price' => 'required|numeric',
        ]);

        $validated['order_number'] = $this->generateOrderNumber();

        try {
            DB::beginTransaction();
            $order = Order::create(Arr::except($validated, 'orders'));

            foreach($validated['orders'] as $item){
                $order->order_items()->create([
                    'order_number' => $order->order_number,
                    'serial' => $item['serial'],
                    'item_id' => $item['id'],
                    'sale_amount' => $item['sale_amount']
                ]);

                 $item = Item::where('date_out', null)->findOrFail($item['id'])->update(['date_out' => Carbon::parse(Carbon::parse($order->transaction_date)->toDateString())]);
            }

            DB::commit(); 
        }catch(Exception $e){
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
