<?php

namespace App\Http\Controllers;

use App\Services\Dashboard\DashboardService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboard) {}

    public function index(Request $request)
    {
        $user = $request->user();

        if ($this->dashboard->canViewCollectionDashboard($user)) {
            return Inertia::render(
                'Dashboard/OwnerDashboard',
                $this->dashboard->collectionDashboard($request->all())
            );
        }

        if (! $this->dashboard->isSuperAdmin($user)) {
            return Inertia::render('Dashboard/NonAdminDashboard');
        }

        return Inertia::render('Dashboard/Index', $this->dashboard->inventoryOverview());
    }

    public function downloadTransactionsPdf(Request $request)
    {
        $userId = Auth::user()->getRoleNames()->contains('cashier')
            ? Auth::id()
            : null;

        $filters = $request->all();
        $data = $this->dashboard->transactionsPdf($filters, $userId);

        $pdf = Pdf::loadView('pdf.transactions', $data)
            ->setPaper('a4', 'landscape')
            ->setOption('margin-top', 10)
            ->setOption('margin-bottom', 10)
            ->setOption('margin-left', 10)
            ->setOption('margin-right', 10);

        $fromDate = $filters['from_date'] ?? today()->toDateString();
        $toDate = $filters['to_date'] ?? today()->toDateString();

        return $pdf->download("transactions_{$fromDate}_to_{$toDate}.pdf");
    }
}
