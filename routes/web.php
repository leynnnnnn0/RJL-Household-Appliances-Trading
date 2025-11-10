<?php

use App\Http\Controllers\BulkPaymentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ExpenseRecordController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\POSCashController;
use App\Http\Controllers\POSCashOrderController;
use App\Http\Controllers\POSCashOrderSalesController;
use App\Http\Controllers\POSCreditController;
use App\Http\Controllers\POSCreditOrderController;
use App\Http\Controllers\POSCreditOrderSalesController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');


Route::middleware('auth')->group(function () {

    Route::patch('/expense-record/{expenseRecord}/update-status', [ExpenseRecordController::class, 'updateStatus'])
        ->name('expense-record.update-status');

    Route::resource('pos-cash', POSCashController::class)->only(['index', 'store']);
    Route::resource('pos-credit', POSCreditController::class)->only(['index', 'store']);
    Route::get('/pos-cash/search', [POSCashController::class, 'search'])->name('pos-cash.search');
    Route::get('/items/export', [ItemController::class, 'export'])->name('items.export');
    Route::post('/items/import/cancel', [ItemController::class, 'cancelImport'])->name('items.import.cancel');
    Route::get('/items/create-from-import', [ItemController::class, 'createFromImport']);
    Route::get('/export/items-template', [ItemController::class, 'exportTemplate'])->name('items.export.template');
    Route::post('/items/import', [ItemController::class, 'import'])->name('items.import.upload');
    Route::post('/items/import/save', [ItemController::class, 'saveImportedItems'])->name('items.import.save');
    Route::resource('items', ItemController::class);
    Route::get('/pos-cash-orders/download-pdf', [POSCashOrderController::class, 'downloadPDF']);
    Route::resource('locations', LocationController::class);
    Route::resource('suppliers', SupplierController::class);

    Route::resource('users', UserController::class);

    Route::resource('expense-record', ExpenseRecordController::class);
    Route::resource('customers', CustomerController::class);
    Route::resource('employees', EmployeeController::class);

    Route::resource('/pos-installment-orders-sales', POSCreditOrderSalesController::class);
    Route::post('/pos-installment-orders/record-payment', [POSCreditOrderController::class, 'recordPayment']);
    Route::post('/pos-installment-orders/{id}/void', [POSCreditOrderController::class, 'void']);
    Route::post('/pos-installment-orders/{id}/accelerate', [POSCreditOrderController::class, 'accelerate']);
    Route::post('/pos-installment-orders/{id}/default', [POSCreditOrderController::class, 'default']);
     Route::put('/pos-installment-orders/rebate', [POSCreditOrderController::class, 'rebate']);
    Route::resource('/pos-installment-orders', POSCreditOrderController::class);
    Route::post('/pos-cash-orders/void/{id}', [POSCashOrderController::class, 'voidOrder']);
    Route::resource('pos-cash-orders', POSCashOrderController::class);
    Route::resource('pos-cash-order-sales', POSCashOrderSalesController::class);

    Route::resource('roles', RoleController::class);
    Route::resource('bulk-payments', BulkPaymentController::class);
});

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::middleware(['auth', 'verified'])->group(function () {
   
});


require __DIR__ . '/settings.php';
