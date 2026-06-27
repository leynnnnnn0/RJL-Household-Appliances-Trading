<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateAgingReportJob;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    /**
     * STEP 1 — Dispatch the job and return a job_id immediately.
     *
     * POST /reports/aging/request
     * Body: { zone, period_start, period_end }
     */
    public function requestAgingReport(Request $request): JsonResponse
    {
        $request->validate([
            'zone'         => 'nullable|string|max:100',
            'period_start' => 'nullable|date',
            'period_end'   => 'nullable|date|after_or_equal:period_start',
        ]);

        $zone        = $request->input('zone', 'ZONE 1');
        $periodStart = Carbon::parse($request->input('period_start', now()->startOfMonth()));
        $periodEnd   = Carbon::parse($request->input('period_end', now()));
        $jobId       = (string) Str::uuid();

        // Set initial status in cache before dispatching
        Cache::put(
            GenerateAgingReportJob::CACHE_PREFIX . $jobId,
            [
                'status'     => 'pending',
                'message'    => 'Report is queued for generation.',
                'updated_at' => now()->toISOString(),
            ],
            now()->addHours(6)
        );

        GenerateAgingReportJob::dispatch(
            $jobId,
            $zone,
            2,
            $periodStart,
            $periodEnd,
            1,
        );

        return response()->json([
            'job_id'  => $jobId,
            'message' => 'Report generation started. Poll the status endpoint.',
        ], 202);
    }

    /**
     * STEP 2 — Poll this endpoint to check job progress.
     *
     * GET /reports/aging/status/{jobId}
     *
     * Response shape:
     * {
     *   "status":  "pending" | "processing" | "done" | "failed",
     *   "message": "...",
     *   "download_url": "/reports/aging/download/{jobId}"  // only when done
     * }
     */
    public function agingReportStatus(string $jobId): JsonResponse
    {
        $cached = Cache::get(GenerateAgingReportJob::CACHE_PREFIX . $jobId);

        if (!$cached) {
            return response()->json([
                'status'  => 'not_found',
                'message' => 'Job not found or has expired.',
            ], 404);
        }

        $response = [
            'status'     => $cached['status'],
            'message'    => $cached['message'],
            'updated_at' => $cached['updated_at'],
        ];

        if ($cached['status'] === 'done') {
            $response['download_url'] = route('reports.aging.download', ['jobId' => $jobId]);
            $response['filename']     = $cached['filename'];
        }

        return response()->json($response);
    }

    /**
     * STEP 3 — Serve the file once the job is done.
     *
     * GET /reports/aging/download/{jobId}
     */
    public function downloadAgingReport(string $jobId): mixed
    {
        $cached = Cache::get(GenerateAgingReportJob::CACHE_PREFIX . $jobId);

        if (!$cached || $cached['status'] !== 'done') {
            return response()->json([
                'message' => 'Report is not ready yet or job ID is invalid.',
            ], 404);
        }

        $path = $cached['path'];

        if (!Storage::disk('local')->exists($path)) {
            return response()->json([
                'message' => 'Report file not found. It may have expired.',
            ], 404);
        }


        $filePath = Storage::disk('local')->path($path);

        return response()->download(
            $filePath,
            $cached['filename'],
            [
                'Content-Type' =>
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ]
        );
    }
}
