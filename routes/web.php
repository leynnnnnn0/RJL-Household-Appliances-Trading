<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\BulkPaymentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerDocumentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ExpenseRecordController;
use App\Http\Controllers\InstallmentOrderRemarkController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PDFController;
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

Route::get('/', fn () => redirect()->route('login'))->name('home');

// Dashboard
Route::middleware(['auth'])->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::middleware('auth')->group(function () {

    Route::get('/pos-installment-orders/{id}/payment-schedule-pdf', [POSCreditOrderController::class, 'printPaymentSchedule']);

    Route::get('/installmentContract/{id}', [PDFController::class, 'installmentContract']);
    Route::get('/demandLetter/{id}', [PDFController::class, 'demandLetter']);
    Route::get('/depositAgreement/{id}', [PDFController::class, 'depositAgreement']);
    Route::get('/download', [PDFController::class, 'download']);
    Route::get('/promisory-note/{id}', [PDFController::class, 'generatePromissoryNote']);
    Route::resource('pdf', PDFController::class);
    /*
    |--------------------------------------------------------------------------
    | POS Cash
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can access cash pos')->group(function () {
        Route::resource('pos-cash', POSCashController::class)->only(['index', 'store']);
        Route::get('/pos-cash/search', [POSCashController::class, 'search'])->name('pos-cash.search');
    });

    /*
    |--------------------------------------------------------------------------
    | POS Credit
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can access credit pos')->group(function () {
        Route::resource('pos-credit', POSCreditController::class)->only(['index', 'store']);
    });

    /*
    |--------------------------------------------------------------------------
    | Cash Orders
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can view cash orders')->group(function () {
        Route::get('/pos-cash-orders/download-pdf', [POSCashOrderController::class, 'downloadPDF']);
        Route::resource('pos-cash-orders', POSCashOrderController::class);
    });
    Route::put('/pos-cash-orders/void/{id}', [POSCashOrderController::class, 'voidOrder'])
        ->middleware('permission:can void cash order')
        ->name('pos-cash-orders.void');

    /*
    |--------------------------------------------------------------------------
    | Cash Orders Sales
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can view cash orders sales')->group(function () {
        Route::resource('pos-cash-order-sales', POSCashOrderSalesController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | Credit / Installment Orders
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can view installment orders')->group(function () {
        Route::resource('/pos-installment-orders', POSCreditOrderController::class);

        Route::post('/pos-installment-orders/remarks', [InstallmentOrderRemarkController::class, 'store']);
        Route::delete('/pos-installment-orders/remarks/{id}', [InstallmentOrderRemarkController::class, 'destroy']);

        Route::put('/pos-installment-orders/payment-history/{history}', [POSCreditOrderController::class, 'updatePaymentHistory'])
            ->name('pos-installment-orders.payment-history.update');

        Route::delete('/pos-installment-orders/payment-history/{history}', [POSCreditOrderController::class, 'deletePaymentHistory'])
            ->name('pos-installment-orders.payment-history.delete');
    });

    Route::put('/pos-installment-orders/{id}/rebate', [POSCreditOrderController::class, 'rebate'])
        ->middleware('permission:can add rebate');
    Route::post('/pos-installment-orders/{id}/accelerate', [POSCreditOrderController::class, 'accelerate'])
        ->middleware('permission:can accelerate');
    Route::post('/pos-installment-orders/{id}/default', [POSCreditOrderController::class, 'default'])
        ->middleware('permission:can default');
    Route::post('/pos-installment-orders/{id}/reactivate', [POSCreditOrderController::class, 'reactivate'])
        ->middleware('permission:can default');
    Route::post('/pos-installment-orders/{id}/void', [POSCreditOrderController::class, 'void'])
        ->middleware('permission:can void');
    Route::post('/pos-installment-orders/record-payment', [POSCreditOrderController::class, 'recordPayment'])
        ->middleware('permission:can record installment order payment');

    Route::middleware('permission:can view installment orders sales')->group(function () {
        Route::resource('/pos-installment-orders-sales', POSCreditOrderSalesController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | Bulk Payments
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can access bulk payments')->group(function () {
        Route::resource('bulk-payments', BulkPaymentController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | Expense Records
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can view expense records')->group(function () {
        Route::resource('expense-record', ExpenseRecordController::class);
    });

    Route::put('/expense-record/{expenseRecord}/update-status', [ExpenseRecordController::class, 'updateStatus'])
        ->middleware('permission:can review expense record')
        ->name('expense-record.update-status');

    /*
    |--------------------------------------------------------------------------
    | Items
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can view items')->group(function () {
        Route::get('/items/export', [ItemController::class, 'export'])->name('items.export');
        Route::get('/export/items-template', [ItemController::class, 'exportTemplate'])->name('items.export.template');
        Route::get('/items/create-from-import', [ItemController::class, 'createFromImport']);
        Route::post('/items/import', [ItemController::class, 'import'])->name('items.import.upload');
        Route::post('/items/import/save', [ItemController::class, 'saveImportedItems'])->name('items.import.save');
        Route::post('/items/import/cancel', [ItemController::class, 'cancelImport'])->name('items.import.cancel');
        Route::resource('items', ItemController::class);
        Route::put('/items/{item}/move', [ItemController::class, 'move'])->name('items.move');
    });

    /*
    |--------------------------------------------------------------------------
    | References
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can manage locations')->resource('locations', LocationController::class);

    Route::middleware('permission:can manage locations')->resource('branches', BranchController::class);

    Route::middleware('permission:can manage suppliers')->resource('suppliers', SupplierController::class);

    /*
    |--------------------------------------------------------------------------
    | People
    |--------------------------------------------------------------------------
    */
    Route::middleware('permission:can view customers')->resource('customers', CustomerController::class);
    Route::middleware('permission:can view employees')->resource('employees', EmployeeController::class);
    Route::middleware('permission:can view users')->resource('users', UserController::class);

    /*
    |--------------------------------------------------------------------------
    | Roles
    |--------------------------------------------------------------------------
    */
    Route::resource('roles', RoleController::class)->middleware('permission:can manage roles');

    /*
    TODO
    */

    Route::get('/transactions/download-pdf', [DashboardController::class, 'downloadTransactionsPdf'])
        ->name('transactions.download.pdf');

    Route::delete('/customers/{customer}/documents/{document}', [CustomerDocumentController::class, 'destroy'])
        ->name('customers.documents.destroy');
});

require __DIR__.'/settings.php';
