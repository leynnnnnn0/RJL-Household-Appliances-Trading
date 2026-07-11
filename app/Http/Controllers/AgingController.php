<?php

namespace App\Http\Controllers;

use App\Http\Requests\Aging\DownloadAgingPdfRequest;
use App\Http\Requests\Aging\IndexAgingRequest;
use App\Http\Requests\Aging\ShowAgingBucketRequest;
use App\Http\Requests\Aging\ShowAgingDetailsRequest;
use App\Services\Aging\AgingReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class AgingController extends Controller
{
    public function __construct(private readonly AgingReportService $aging) {}

    public function index(IndexAgingRequest $request)
    {
        return Inertia::render('Aging/Index', $this->aging->index($request->validated()));
    }

    public function showBucket(ShowAgingBucketRequest $request)
    {
        return Inertia::render('Aging/Bucket', $this->aging->bucketPage($request->validated()));
    }

    public function showDetails(ShowAgingDetailsRequest $request)
    {
        return Inertia::render('Aging/Details', $this->aging->details($request->validated()));
    }

    public function downloadPdf(DownloadAgingPdfRequest $request)
    {
        $data = $this->aging->pdfData($request->validated());
        $bucket = $data['bucket'] === 'all' ? 'all' : $data['bucketLabels'][$data['bucket']];

        $pdf = Pdf::loadView('pdf.sales-aging', $data)
            ->setPaper('a4', 'landscape');

        return $pdf->download('aging-'.$data['filters']['month'].'-'.str($bucket)->slug().'.pdf');
    }
}
