<?php

use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\InstallmentOrderController;
use App\Http\Controllers\ItemAPIController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/items', [ItemAPIController::class, 'index']);
Route::get('/customers', [CustomerController::class, 'index']);
Route::get('/installment-orders', [InstallmentOrderController::class, 'index']);


Route::post('/reports/aging/request', [ReportController::class, 'requestAgingReport'])
    ->name('reports.aging.request');

Route::get('/reports/aging/status/{jobId}', [ReportController::class, 'agingReportStatus'])
    ->name('reports.aging.status');

Route::get('/reports/aging/download/{jobId}', [ReportController::class, 'downloadAgingReport'])
    ->name('reports.aging.download');
