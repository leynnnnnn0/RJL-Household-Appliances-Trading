<?php

namespace App\Http\Controllers;

use App\Http\Requests\Sales\DownloadSalesAgingPdfRequest;
use App\Http\Requests\Sales\IndexSalesRequest;
use App\Http\Requests\Sales\ShowSalesAgingBucketRequest;
use App\Services\Sales\SalesReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function __construct(private readonly SalesReportService $sales) {}

    public function index(IndexSalesRequest $request)
    {
        return Inertia::render('Sales/Index', $this->sales->dashboard($request->validated()));
    }

    public function showBucket(ShowSalesAgingBucketRequest $request)
    {
        return Inertia::render('Sales/Bucket', $this->sales->bucketPage($request->validated()));
    }

    public function downloadPdf(DownloadSalesAgingPdfRequest $request)
    {
        $data = $this->sales->pdfData($request->validated());
        $bucket = $data['bucket'] === 'all' ? 'all' : $data['bucketLabels'][$data['bucket']];

        $pdf = Pdf::loadView('pdf.sales-aging', $data)
            ->setPaper('a4', 'landscape');

        return $pdf->download('sales-aging-'.$data['filters']['month'].'-'.str($bucket)->slug().'.pdf');
    }
}
