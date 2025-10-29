<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Order;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSCashOrderController extends Controller
{
    public function index()
    {
        $transactions = Order::with('order_items.item', 'employee', 'location')->latest()->paginate(8);
        return Inertia::render('POSCashOrder/Index',[
            'transactions' => $transactions,
            'locations' => Location::dropdown(),
            'employees' => User::dropdown()
        ]);
    }

    public function downloadPDF(Request $request)
{
    // Get filter parameters
    $search = $request->input('search', '');
    $dateFrom = $request->input('date_from', now()->startOfDay());
    $dateTo = $request->input('date_to', now()->endOfDay());
    $locationId = $request->input('location_id', '');
    $employeeId = $request->input('employee_id', '');

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

    $orders = $query->orderBy('transaction_date', 'desc')->get();

    // Prepare data for PDF
    $data = [
        'orders' => $orders,
        'dateFrom' => $dateFrom,
        'dateTo' => $dateTo,
        'generatedAt' => now()->format('F d, Y h:i A'),
        'totalOrders' => $orders->count(),
        'totalAmount' => $orders->sum('total_price')
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
