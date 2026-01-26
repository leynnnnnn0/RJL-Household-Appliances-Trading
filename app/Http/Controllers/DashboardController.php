<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\ExpenseRecord;
use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderPaymentHistory;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $data = Item::whereNull('date_out')
            ->selectRaw('item_type AS category, SUM(srp) AS srp, SUM(unit_cost) AS unitCost')
            ->groupBy('item_type')
            ->get()
            ->map(function ($row) {
                return [
                    'category'  => $row->category,
                    'srp'       => (int) $row->srp,
                    'unitCost'  => (int) $row->unitCost,
                ];
            })
            ->values();
        $srpTotal = $data->sum('srp');
        $unitCostTotal = $data->sum('unitCost');
        $customers = Customer::count();
        $users = User::count();
        $employees = Employee::count();
        $marginPercent = $unitCostTotal > 0
            ? (($srpTotal - $unitCostTotal) / $unitCostTotal) * 100
            : 0;

        if (Auth::user()->getRoleNames()->contains('super admin')) {
            // Get filter parameters
            $fromDate = $request->input('from_date', today()->toDateString());
            $toDate = $request->input('to_date', today()->toDateString());
            $employeeId = $request->input('branch_id');

            // Build base queries with date range filter
            $cashOrdersQuery = Order::with(['customer', 'order_items.item', 'employee'])
                ->whereBetween(DB::raw('DATE(transaction_date)'), [$fromDate, $toDate]);
            $installmentOrdersQuery = InstallmentOrder::with(['customer', 'user'])
                ->whereBetween(DB::raw('DATE(transaction_date)'), [$fromDate, $toDate]);
            $installmentPaymentsQuery = InstallmentOrderPaymentHistory::with([
                'installment_order_payment.installment_order.customer',
                'user'
            ])
                ->whereBetween(DB::raw('DATE(paid_date)'), [$fromDate, $toDate])
                ->whereHas('installment_order_payment.installment_order', function ($q) {
                    $q->where('is_voided', false);
                });

            // Apply employee filter if specified
            if ($employeeId) {
                $cashOrdersQuery->where('branch_id', $employeeId);
                $installmentOrdersQuery->where('branch_id', $employeeId);
                $installmentPaymentsQuery->where('branch_id', $employeeId);
            }

            // Get cash orders
            $cashOrders = $cashOrdersQuery->get()
                ->map(function ($order) {
                    return [
                        'date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
                        'receipt_number' => $order->receipt_number,
                        'customer' => $order->customer->full_name,
                        'm_i' => null,
                        'd_p' => null,
                        'amount_paid' => $order->total_price,
                        'payment_method' => Str::of(strtolower($order->payment_method))->replace('_', ' '),
                        'reference_number' => $order->reference_number,
                        'is_voided' => $order->is_void,
                        'created_at' => $order->created_at,
                        'employee_name' => $order->employee->full_name ?? 'N/A',
                        'remarks' => $order->order_items
                            ->map(fn($item) => $item->item->model)
                            ->implode(', ')
                    ];
                });

            // Get installment orders
            $installmentOrders = $installmentOrdersQuery->get()
                ->map(function ($order) {
                    return [
                        'date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
                        'receipt_number' => $order->receipt_number,
                        'customer' => $order->customer->full_name,
                        'm_i' => null,
                        'd_p' => $order->down_payment,
                        'amount_paid' => null,
                        'payment_method' => Str::of(strtolower($order->payment_method))->replace('_', ' '),
                        'reference_number' => $order->reference_number,
                        'is_voided' => $order->is_voided,
                        'created_at' => $order->created_at,
                        'employee_name' => $order->user->full_name ?? 'N/A',
                        'remarks' => $order->installment_order_items->map(fn($item) => $item->item->model)
                            ->implode(', ')
                    ];
                });

            // Get installment payments (keep individual records for accurate MOP calculation)
            $installmentPayments = $installmentPaymentsQuery->get()
                ->map(function ($order) {
                    return [
                        'date' => Carbon::parse($order->paid_date)->format('F d, Y'),
                        'receipt_number' => $order->collection_receipt_number,
                        'customer' => $order->installment_order_payment->installment_order->customer->full_name,
                        'm_i' => $order->amount,
                        'd_p' => null,
                        'amount_paid' => null,
                        'payment_method' => Str::of(strtolower($order->payment_method))->replace('_', ' '),
                        'reference_number' => $order->reference_number,
                        'is_voided' => false,
                        'created_at' => $order->created_at,
                        'employee_name' => $order->user->full_name ?? 'N/A',
                        'remarks' => $order->installment_order_payment->installment_order->installment_order_items->map(fn($item) => $item->item->model)
                            ->implode(', ')
                    ];
                });

            // Create grouped version for display (shows split payments clearly)
            $groupedInstallmentPayments = $installmentPayments
                ->groupBy('receipt_number')
                ->map(function ($group) {
                    $paymentMethods = $group->pluck('payment_method')->unique();
                    $amounts = $group->groupBy('payment_method')->map(fn($items) => $items->sum('m_i'));

                    return [
                        'date' => $group->first()['date'],
                        'receipt_number' => $group->first()['receipt_number'],
                        'customer' => $group->first()['customer'],
                        'm_i' => $group->sum('m_i'),
                        'd_p' => null,
                        'amount_paid' => null,
                        'payment_method' => $paymentMethods->count() > 1
                            ? 'Split: ' . $amounts->map(fn($amt, $method) => ucfirst($method) . ' ₱' . number_format($amt, 2))->implode(', ')
                            : $group->first()['payment_method'],
                        'reference_number' => $group->first()['reference_number'],
                        'is_voided' => false,
                        'employee_name' => $group->first()['employee_name'],
                        'remarks' => $group->first()['remarks'],
                    ];
                })
                ->values();

            // Combine all transactions (use ungrouped installment payments for accurate MOP totals)
            $transactions = collect()
                ->concat($cashOrders)
                ->concat($installmentOrders)
                ->concat($installmentPayments);

            // Calculate totals
            $miCollection = $transactions
                ->where('m_i', '!=', null)
                ->where('is_voided', false)
                ->sum('m_i') ?? 0;
            $dpCollection = $transactions->where('d_p', '!=', null)
                ->where('is_voided', false)
                ->sum('d_p') ?? 0;
            $cashCollection = $transactions->where('amount_paid', '!=', null)
                ->where('is_voided', false)
                ->sum('amount_paid') ?? 0;

            // Group by payment method (this will now correctly split cash and bank)
            $mops = $transactions
                ->where('is_voided', false)
                ->groupBy('payment_method')
                ->map(function ($group) {
                    return $group->sum(function ($t) {
                        return ($t['m_i'] ?? 0) + ($t['d_p'] ?? 0) + ($t['amount_paid'] ?? 0);
                    });
                });

            $totalCashOnHand = $mops->get('cash', 0);
            $totalOtherMop = $mops
                ->except(['cash'])
                ->sum();

            // Get expenses within date range
            $expensesQuery = ExpenseRecord::where('status', 'approved')
                ->whereBetween('expense_date', [$fromDate, $toDate]);
            if ($employeeId) {
                $expensesQuery->where('user_id', $employeeId);
            }
            $expenses = $expensesQuery->sum('amount');

            // Use grouped version for display
            $allTransactions = collect()
                ->concat($cashOrders)
                ->concat($installmentOrders)
                ->concat($groupedInstallmentPayments)
                ->sortByDesc('date')
                ->values();

            // Get all employees for filter dropdown
            $employees = Branch::dropdown();

            return Inertia::render('Dashboard/OwnerDashboard', [
                'allTransactions' => $allTransactions,
                'mops' => $mops,
                'miCollection' => $miCollection,
                'dpCollection' => $dpCollection,
                'cashCollection' => $cashCollection,
                'netCollection' => $miCollection + $dpCollection + $cashCollection,
                'expenses' => $expenses,
                'totalCashOnHand' => $totalCashOnHand,
                'totalOtherMop' => $totalOtherMop,
                'employees' => $employees,
                'filters' => [
                    'from_date' => $fromDate,
                    'to_date' => $toDate,
                    'employee_id' => $employeeId
                ]
            ]);
        }

        if (Auth::user()->getRoleNames()->contains('cashier')) {
            $cashOrders = Order::with(['customer', 'order_items.item'])->whereDate('transaction_date', today())
                ->where('employee_id', Auth::id())
                ->get()
                ->map(function ($order) {
                    return [
                        'date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
                        'receipt_number' => $order->receipt_number,
                        'customer' => $order->customer->full_name,
                        'm_i' => null,
                        'd_p' => null,
                        'amount_paid' => $order->total_price,
                        'payment_method' => Str::of(strtolower($order->payment_method))->replace('_', ' '),
                        'reference_number' => $order->reference_number,
                        'is_voided' => $order->is_void,
                        'created_at' => $order->created_at,
                        'remarks' => $order->order_items
                            ->map(fn($item) => $item->item->model)
                            ->implode(', ')
                    ];
                });

            $installmentOrders = InstallmentOrder::with(['customer', 'installment_order_items.item'])->whereDate('transaction_date', today())
                ->where('user_id', Auth::id())
                ->get()
                ->map(function ($order) {
                    return [
                        'date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
                        'receipt_number' => $order->receipt_number,
                        'customer' => $order->customer->full_name,
                        'm_i' => null,
                        'd_p' => $order->down_payment,
                        'amount_paid' => null,
                        'payment_method' => Str::of(strtolower($order->payment_method))->replace('_', ' '),
                        'reference_number' => $order->reference_number,
                        'is_voided' => $order->is_voided,
                        'created_at' => $order->created_at,
                        'remarks' => $order->installment_order_items->map(fn($item) => $item->item->model)
                            ->implode(', ')
                    ];
                });

            // Get installment payments (keep individual records)
            $installmentPayments = InstallmentOrderPaymentHistory::with('installment_order_payment.installment_order.customer', 'installment_order_payment.installment_order.installment_order_items.item')
                ->whereDate('paid_date', today())
                ->where('user_id', Auth::id())
                ->whereHas('installment_order_payment.installment_order', function ($q) {
                    $q->where('is_voided', false);
                })
                ->get()
                ->map(function ($order) {
                    return [
                        'date' => Carbon::parse($order->paid_date)->format('F d, Y'),
                        'receipt_number' => $order->collection_receipt_number,
                        'customer' => $order->installment_order_payment->installment_order->customer->full_name,
                        'm_i' => $order->amount,
                        'd_p' => null,
                        'amount_paid' => null,
                        'payment_method' => Str::of(strtolower($order->payment_method))->replace('_', ' '),
                        'reference_number' => $order->reference_number,
                        'is_voided' => false,
                        'created_at' => $order->created_at,
                        'remarks' => $order->installment_order_payment->installment_order->installment_order_items->map(fn($item) => $item->item->model)->implode(', ')
                    ];
                });

            // Create grouped version for display
            $groupedInstallmentPayments = $installmentPayments
                ->groupBy('receipt_number')
                ->map(function ($group) {
                    $paymentMethods = $group->pluck('payment_method')->unique();
                    $amounts = $group->groupBy('payment_method')->map(fn($items) => $items->sum('m_i'));

                    return [
                        'date' => $group->first()['date'],
                        'receipt_number' => $group->first()['receipt_number'],
                        'customer' => $group->first()['customer'],
                        'm_i' => $group->sum('m_i'),
                        'd_p' => null,
                        'amount_paid' => null,
                        'payment_method' => $paymentMethods->count() > 1
                            ? 'Split: ' . $amounts->map(fn($amt, $method) => ucfirst($method) . ' ₱' . number_format($amt, 2))->implode(', ')
                            : $group->first()['payment_method'],
                        'reference_number' => $group->first()['reference_number'],
                        'is_voided' => false,
                        'remarks' => $group->first()['remarks'],
                    ];
                })
                ->values();

            // Use ungrouped payments for accurate MOP calculation
            $transactions = collect()
                ->concat($cashOrders)
                ->concat($installmentOrders)
                ->concat($installmentPayments);

            $miCollection = $transactions
                ->where('is_voided', false)
                ->where('m_i', '!=', null)
                ->sum('m_i') ?? 0;
            $dpCollection = $transactions->where('is_voided', false)->where('d_p', '!=', null)->sum('d_p') ?? 0;
            $cashCollection = $transactions->where('is_voided', false)->where('amount_paid', '!=', null)->sum('amount_paid') ?? 0;

            $mops = $transactions
                ->where('is_voided', false)
                ->groupBy('payment_method')
                ->map(function ($group) {
                    return $group->sum(function ($t) {
                        return ($t['m_i'] ?? 0) + ($t['d_p'] ?? 0) + ($t['amount_paid'] ?? 0);
                    });
                });

            $totalCashOnHand = $mops->get('cash', 0);
            $totalOtherMop = $mops
                ->except(['cash'])
                ->sum();

            $expenses = ExpenseRecord::where('user_id', Auth::id())
                ->where('status', 'approved')
                ->whereDate('expense_date', today())
                ->sum('amount');

            // Use grouped version for display
            $allTransactions = collect()
                ->concat($cashOrders)
                ->concat($installmentOrders)
                ->concat($groupedInstallmentPayments)
                ->sortByDesc('date')
                ->values();

            return Inertia::render('Dashboard/CashierDashboard', [
                'allTransactions' => $allTransactions,
                'mops' => $mops,
                'miCollection' => $miCollection,
                'dpCollection' => $dpCollection,
                'cashCollection' => $cashCollection,
                'netCollection' => $miCollection + $dpCollection + $cashCollection,
                'expenses' => $expenses,
                'totalCashOnHand' => $totalCashOnHand,
                'totalOtherMop' => $totalOtherMop
            ]);
        }

        if (!Auth::user()->getRoleNames()->contains('super admin')) {
            return Inertia::render('Dashboard/NonAdminDashboard');
        }

        return Inertia::render('Dashboard/Index', [
            'srpTotal' => number_format($srpTotal, 2, '.', ','),
            'unitTotalCost' => number_format($unitCostTotal, 2, '.', ','),
            'customers' => $customers,
            'users' => $users,
            'employees' => $employees,
            'marginPercent' => number_format($marginPercent),
            'potentialProfit' => number_format($srpTotal - $unitCostTotal, 2, '.', ','),
            'inventoryData' => $data->toArray()
        ]);
    }

    public function cashierDashboard()
    {
        $cashOrders = Order::whereDate('transaction_date', today())
            ->where('employee_id', Auth::id())
            ->get();

        $installmentOrders = InstallmentOrder::whereDate('transaction_date', today())
            ->where('user_id', Auth::id())
            ->get();


        return Inertia::render('Dashboard/CashierDashboard');
    }



  public function downloadTransactionsPdf(Request $request)
{
    // Get filter parameters
    $fromDate = $request->input('from_date', today()->toDateString());
    $toDate = $request->input('to_date', today()->toDateString());
    $employeeId = $request->input('branch_id');
    $userId = null;
    if (Auth::user()->getRoleNames()->contains('cashier')) {
        $userId = Auth::id();
    }
    
    // Build base queries with date range filter
    $cashOrdersQuery = Order::with(['customer', 'order_items.item', 'employee'])
        ->whereBetween(DB::raw('DATE(transaction_date)'), [$fromDate, $toDate]);
    $installmentOrdersQuery = InstallmentOrder::with(['customer', 'user'])
        ->whereBetween(DB::raw('DATE(transaction_date)'), [$fromDate, $toDate]);
    $installmentPaymentsQuery = InstallmentOrderPaymentHistory::with([
        'installment_order_payment.installment_order.customer',
        'user'
    ])
        ->whereBetween(DB::raw('DATE(paid_date)'), [$fromDate, $toDate])
        ->whereHas('installment_order_payment.installment_order', function ($q) {
            $q->where('is_voided', false);
        });
    
    // Apply employee filter if specified
    if ($employeeId && $employeeId != 'all') {
        $cashOrdersQuery->where('branch_id', $employeeId);
        $installmentOrdersQuery->where('branch_id', $employeeId);
        $installmentPaymentsQuery->where('branch_id', $employeeId);
    }

    if($userId) {
        $cashOrdersQuery->where('employee_id', $userId);
        $installmentOrdersQuery->where('user_id', $userId);
        $installmentPaymentsQuery->where('user_id', $userId);
    }
    
    // Get cash orders
    $cashOrders = $cashOrdersQuery->get()
        ->map(function ($order) {
            return [
                'date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
                'receipt_number' => $order->receipt_number,
                'customer' => $order->customer->full_name,
                'm_i' => null,
                'd_p' => null,
                'amount_paid' => $order->total_price,
                'payment_method' => Str::of(strtolower($order->payment_method))->replace('_', ' '),
                'reference_number' => $order->reference_number,
                'is_voided' => $order->is_void,
                'created_at' => $order->created_at,
                'employee_name' => $order->employee->full_name ?? 'N/A',
                'remarks' => $order->order_items
                    ->map(fn($item) => $item->item->model)
                    ->implode(', ')
            ];
        });
    
    // Get installment orders
    $installmentOrders = $installmentOrdersQuery->get()
        ->map(function ($order) {
            return [
                'date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
                'receipt_number' => $order->receipt_number,
                'customer' => $order->customer->full_name,
                'm_i' => null,
                'd_p' => $order->down_payment,
                'amount_paid' => null,
                'payment_method' => Str::of(strtolower($order->payment_method))->replace('_', ' '),
                'reference_number' => $order->reference_number,
                'is_voided' => $order->is_voided,
                'created_at' => $order->created_at,
                'employee_name' => $order->user->full_name ?? 'N/A',
                'remarks' => $order->installment_order_items->map(fn($item) => $item->item->model)
                        ->implode(', ')
            ];
        });
    
    // Get installment payments (keep individual records for accurate MOP calculation)
    $installmentPayments = $installmentPaymentsQuery->get()
        ->map(function ($order) {
            return [
                'date' => Carbon::parse($order->paid_date)->format('F d, Y'),
                'receipt_number' => $order->collection_receipt_number,
                'customer' => $order->installment_order_payment->installment_order->customer->full_name,
                'm_i' => $order->amount,
                'd_p' => null,
                'amount_paid' => null,
                'payment_method' => Str::of(strtolower($order->payment_method))->replace('_', ' '),
                'reference_number' => $order->reference_number,
                'is_voided' => false,
                'created_at' => $order->created_at,
                'employee_name' => $order->user->full_name ?? 'N/A',
                'remarks' => $order->installment_order_payment->installment_order->installment_order_items->map(fn($item) => $item->item->model)
                        ->implode(', ')
            ];
        });

    // Create grouped version for display (shows split payments clearly)
    $groupedInstallmentPayments = $installmentPayments
        ->groupBy('receipt_number')
        ->map(function ($group) {
            $paymentMethods = $group->pluck('payment_method')->unique();
            $amounts = $group->groupBy('payment_method')->map(fn($items) => $items->sum('m_i'));
            
            return [
                'date' => $group->first()['date'],
                'receipt_number' => $group->first()['receipt_number'],
                'customer' => $group->first()['customer'],
                'm_i' => $group->sum('m_i'),
                'd_p' => null,
                'amount_paid' => null,
                'payment_method' => $paymentMethods->count() > 1 
                    ? 'Split: ' . $amounts->map(fn($amt, $method) => ucfirst($method) . ' ₱' . number_format($amt, 2))->implode(', ')
                    : $group->first()['payment_method'],
                'reference_number' => $group->first()['reference_number'],
                'is_voided' => false,
                'employee_name' => $group->first()['employee_name'],
                'remarks' => $group->first()['remarks'],
            ];
        })
        ->values();
    
    // Combine transactions using ungrouped installment payments for accurate MOP totals
    $transactions = collect()
        ->concat($cashOrders)
        ->concat($installmentOrders)
        ->concat($installmentPayments);
    
    // Calculate totals
    $miCollection = $transactions->where('is_voided', false)->where('m_i', '!=', null)->sum('m_i') ?? 0;
    $dpCollection = $transactions->where('is_voided', false)->where('d_p', '!=', null)->sum('d_p') ?? 0;
    $cashCollection = $transactions->where('is_voided', false)->where('amount_paid', '!=', null)->sum('amount_paid') ?? 0;
    
    // Group by payment method (this will now correctly split cash and bank)
    $mops = $transactions
        ->where('is_voided', false)
        ->groupBy('payment_method')
        ->map(function ($group) {
            return $group->sum(function ($t) {
                return ($t['m_i'] ?? 0) + ($t['d_p'] ?? 0) + ($t['amount_paid'] ?? 0);
            });
        });
    
    $totalCashOnHand = $mops->get('cash', 0);
    $totalOtherMop = $mops->except(['cash'])->sum();
    
    // Get expenses within date range
    $expensesQuery = ExpenseRecord::where('status', 'approved')
        ->whereDate('expense_date', '>=', $fromDate)
        ->whereDate('expense_date', '<=', $toDate);
    
    if ($employeeId && $employeeId != 'all') {
        $expensesQuery->where('user_id', $employeeId);
    }
    
    $expenses = $expensesQuery->sum('amount');
    
    // Use grouped version for display in PDF
    $allTransactions = collect()
        ->concat($cashOrders)
        ->concat($installmentOrders)
        ->concat($groupedInstallmentPayments)
        ->sortByDesc('date')
        ->values();

    // Get employee name if filtered
    $employeeName = null;
    if ($employeeId && $employeeId != 'all') {
        $employee = User::find($employeeId);
        $employeeName = $employee ? $employee->full_name : 'N/A';
    }
    
    // Prepare data for PDF
    $data = [
        'allTransactions' => $allTransactions,
        'mops' => $mops,
        'miCollection' => $miCollection,
        'dpCollection' => $dpCollection,
        'cashCollection' => $cashCollection,
        'netCollection' => $miCollection + $dpCollection + $cashCollection,
        'expenses' => $expenses,
        'totalCashOnHand' => $totalCashOnHand,
        'totalOtherMop' => $totalOtherMop,
        'fromDate' => Carbon::parse($fromDate)->format('F d, Y'),
        'toDate' => Carbon::parse($toDate)->format('F d, Y'),
        'employeeName' => $employeeName,
        'generatedAt' => now()->format('F d, Y h:i A')
    ];
    
    // Generate PDF
    $pdf = Pdf::loadView('pdf.transactions', $data)
        ->setPaper('a4', 'landscape')
        ->setOption('margin-top', 10)
        ->setOption('margin-bottom', 10)
        ->setOption('margin-left', 10)
        ->setOption('margin-right', 10);
    
    // Generate filename
    $filename = 'transactions_' . $fromDate . '_to_' . $toDate . '.pdf';
    
    return $pdf->download($filename);
}
}
