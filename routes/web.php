<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\POSCashController;
use App\Http\Controllers\POSCashOrderController;
use App\Http\Controllers\POSCreditController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');


Route::resource('pos-cash', POSCashController::class)->only(['index', 'store']);
Route::resource('pos-credit', POSCreditController::class)->only('index');
Route::get('/pos-cash/search', [POSCashController::class, 'search'])->name('pos-cash.search');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

Route::get('/items/export', [ItemController::class, 'export'])->name('items.export');
    Route::post('/items/import/cancel', [ItemController::class, 'cancelImport'])->name('items.import.cancel');
Route::get('/items/create-from-import', [ItemController::class, 'createFromImport']);
Route::get('/export/items-template', [ItemController::class, 'exportTemplate'])->name('items.export.template');
Route::post('/items/import', [ItemController::class, 'import'])->name('items.import.upload');
Route::post('/items/import/save', [ItemController::class, 'saveImportedItems'])->name('items.import.save');
Route::resource('items', ItemController::class);
});

Route::resource('locations', LocationController::class);
Route::resource('suppliers', SupplierController::class);
Route::resource('pos-cash-orders', POSCashOrderController::class);


require __DIR__.'/settings.php';
