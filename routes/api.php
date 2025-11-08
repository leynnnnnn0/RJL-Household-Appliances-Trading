<?php

use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\InstallmentOrderController;
use App\Http\Controllers\ItemAPIController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/items', [ItemAPIController::class, 'index']);
Route::get('/customers', [CustomerController::class, 'index']);
Route::get('/installment-orders', [InstallmentOrderController::class, 'index']);