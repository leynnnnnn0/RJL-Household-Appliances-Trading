<?php

namespace App\Jobs;

use App\Exports\AgingReportExport;
use App\Exports\CombinedReportExport;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class GenerateAgingReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 300;

    const CACHE_PREFIX = 'aging_report:';

    public function __construct(
        protected string $jobId,
        protected string $zone,
        protected ?int   $branchId,        // ← added
        protected Carbon $periodStart,
        protected Carbon $periodEnd,
        protected int    $requestedByUserId,
    ) {}

    public function handle(): void
    {
        $cacheKey = self::CACHE_PREFIX . $this->jobId;

        try {
            $this->updateStatus($cacheKey, 'processing', 'Generating report...');

            $filename = 'aging-reports/'
                . 'AGING-' . strtoupper(str_replace(' ', '-', $this->zone))
                . '-' . $this->periodStart->format('M')
                . '-' . $this->periodEnd->format('M-Y')
                . '-' . $this->jobId
                . '.xlsx';

            Excel::store(
                new CombinedReportExport(   // ← was AgingReportExport
                    zone: $this->zone,
                    branchId: $this->branchId,
                    periodStart: $this->periodStart,
                    periodEnd: $this->periodEnd,
                ),
                $filename,
                'local'
            );

            $this->updateStatus($cacheKey, 'done', 'Report ready.', [
                'path'     => $filename,
                'filename' => basename($filename),
            ]);
        } catch (\Throwable $e) {
            Log::error('AgingReportJob failed', [
                'job_id' => $this->jobId,
                'error'  => $e->getMessage(),
            ]);

            $this->updateStatus($cacheKey, 'failed', $e->getMessage());

            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        $cacheKey = self::CACHE_PREFIX . $this->jobId;
        $this->updateStatus($cacheKey, 'failed', 'Report generation failed after multiple attempts.');
    }

    private function updateStatus(string $key, string $status, string $message, array $extra = []): void
    {
        Cache::put($key, array_merge([
            'status'     => $status,
            'message'    => $message,
            'updated_at' => now()->toISOString(),
        ], $extra), now()->addHours(6));
    }
}
