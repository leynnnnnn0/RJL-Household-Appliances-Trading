<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Order;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class POSCashOrderController extends Controller
{
    public function index()
    {
        $transactions = Order::with('order_items.item', 'employee', 'location')
        ->latest()
        ->paginate(8);


        return Inertia::render('POSCashOrder/Index',[
            'transactions' => $transactions,
            'locations' => Location::dropdown(),
            'employees' => User::dropdown()
        ]);
    }

    public function voidOrder(Request $request, $id)
    {
        $validated = $request->validate([
            'reason_for_cancellation' => 'required',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['void_date'] = now();
        $validated['is_void'] = true;

        DB::beginTransaction();
        $order = Order::with('order_items.item')->findOrFail($id);
        $order->update($validated);
        foreach($order->order_items as $item){
            $item->item->date_out = null;
            $item->item->save();
        }

        DB::commit();

        return back();
        
    }

    public function downloadPDF(Request $request)
{
    // Get filter parameters
    $search = $request->input('search', '');
    $dateFrom = $request->input('date_from', now()->startOfDay());
    $dateTo = $request->input('date_to', now()->endOfDay());
    $locationId = $request->input('location_id', '');
    $employeeId = $request->input('employee_id', '');
    $status = $request->input('status', 'all'); // Added status parameter
    
    // Build query with filters
    $query = Order::with([
        'order_items.item.supplier',
        'order_items.item.location',
        'location',
        'employee'
    ]);
    
    // Apply filters
    if ($search) {
        $query->where(function($q) use ($search) {
            $q->where('order_number', 'like', "%{$search}%")
              ->orWhere('employee_id', $search);
        });
    }
    
    if ($dateFrom) {
        $query->whereDate('transaction_date', '>=', $dateFrom);
    }
    
    if ($dateTo) {
        $query->whereDate('transaction_date', '<=', $dateTo);
    }
    
    if ($locationId) {
        $query->where('location_id', $locationId);
    }
    
    if ($employeeId) {
        $query->where('employee_id', $employeeId);
    }
    
    // Apply status filter
    if ($status !== 'all') {
        $isVoided = $status === '1';
        $query->where('is_void', $isVoided);
    }
    
    $orders = $query->orderBy('transaction_date', 'desc')->get();
    
    // Calculate totals properly
    $totalOrders = $orders->count();
    $totalVoided = $orders->where('is_void', true)->count();
    $totalActive = $orders->where('is_void', false)->count();
    
    // Only sum non-voided orders for total amount (voided = refunded money)
    $totalAmount = $orders->where('is_void', false)->sum('total_price');
    $voidedAmount = $orders->where('is_void', true)->sum('total_price');
    
    // Prepare data for PDF
    $data = [
        'orders' => $orders,
        'dateFrom' => $dateFrom,
        'dateTo' => $dateTo,
        'status' => $status,
        'generatedAt' => now()->format('F d, Y h:i A'),
        'totalOrders' => $totalOrders,
        'totalActive' => $totalActive,
        'totalVoided' => $totalVoided,
        'totalAmount' => $totalAmount,
        'voidedAmount' => $voidedAmount
    ];
    
    $pdf = Pdf::loadView('pdf.orders', $data);
    $pdf->setPaper('a4', 'landscape');
    
    $filename = 'orders_report_' . now()->format('Y-m-d_His') . '.pdf';
    
    return $pdf->download($filename);
}
    public function show($orderNumber)
{
    $transaction = Order::with('order_items.item', 'employee', 'location')
        ->where('order_number', $orderNumber)
        ->firstOrFail();
    
    return Inertia::render('POSCashOrder/Show', [
        'transaction' => $transaction
    ]);
}


}
