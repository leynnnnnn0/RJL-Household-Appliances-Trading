<?php

namespace App\Exports;

use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class CombinedReportExport implements WithMultipleSheets
{
    protected string $zone;
    protected ?int $branchId;
    protected Carbon $periodStart;
    protected Carbon $periodEnd;

    public function __construct(
        string $zone,
        ?int $branchId,
        Carbon $periodStart,
        Carbon $periodEnd
    ) {
        $this->zone        = $zone;
        $this->branchId    = $branchId;
        $this->periodStart = $periodStart;
        $this->periodEnd   = $periodEnd;
    }

    public function sheets(): array
    {
        return [
            new AgingReportExport($this->zone, $this->branchId),
            new TopSheetExport($this->zone, $this->branchId, $this->periodStart, $this->periodEnd),
        ];
    }
}
