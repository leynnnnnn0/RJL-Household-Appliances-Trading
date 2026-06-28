import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ModuleHeading from '@/components/cards/module-heading';
import { CollectionFilterCard } from '@/components/dashboard/collection-filter-card';
import { CollectionMetricGrid } from '@/components/dashboard/collection-metric-grid';
import { CollectionSummaryCard } from '@/components/dashboard/collection-summary-card';
import type { DashboardBranchOption, DashboardFilters, DashboardTransaction } from '@/components/dashboard/collection-dashboard-types';
import { PaymentMethodBreakdown } from '@/components/dashboard/payment-method-breakdown';
import { TransactionDetailsCard } from '@/components/dashboard/transaction-details-card';
import AppLayout from '@/layouts/app-layout';

interface PageProps {
    allTransactions: DashboardTransaction[];
    mops: Record<string, number>;
    miCollection: number;
    dpCollection: number;
    cashCollection: number;
    netCollection: number;
    totalCashOnHand: number;
    totalOtherMop: number;
    expenses: number;
    employees: DashboardBranchOption[];
    filters: DashboardFilters;
}

const today = () => new Date().toISOString().split('T')[0];

const transactionsDownloadUrl = (fromDate: string, toDate: string, selectedBranch: string) => {
    const params = new URLSearchParams({
        from_date: fromDate,
        to_date: toDate,
    });

    if (selectedBranch !== 'all') {
        params.set('branch_id', selectedBranch);
    }

    return `/transactions/download-pdf?${params.toString()}`;
};

export default function OwnerDashboard({
    expenses,
    totalCashOnHand,
    totalOtherMop,
    allTransactions,
    mops,
    miCollection,
    dpCollection,
    cashCollection,
    netCollection,
    employees,
    filters,
}: PageProps) {
    const [fromDate, setFromDate] = useState(filters.from_date || today());
    const [toDate, setToDate] = useState(filters.to_date || today());
    const [selectedBranch, setSelectedBranch] = useState(filters.employee_id || 'all');

    const applyFilters = () => {
        router.get(
            '/dashboard',
            {
                from_date: fromDate,
                to_date: toDate,
                branch_id: selectedBranch !== 'all' ? selectedBranch : null,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Owner Dashboard" />
            <div className="min-h-screen">
                <div className="space-y-6">
                    <ModuleHeading title="Dashboard" description="Track your sales performance and revenue across all locations" />

                    <CollectionFilterCard
                        branches={employees}
                        fromDate={fromDate}
                        selectedBranch={selectedBranch}
                        toDate={toDate}
                        onApply={applyFilters}
                        onFromDateChange={setFromDate}
                        onSelectedBranchChange={setSelectedBranch}
                        onToDateChange={setToDate}
                    />

                    <CollectionSummaryCard
                        expenses={expenses}
                        netCollection={netCollection}
                        totalCashOnHand={totalCashOnHand}
                        totalOtherMop={totalOtherMop}
                    />

                    <CollectionMetricGrid
                        cashCollection={cashCollection}
                        dpCollection={dpCollection}
                        expenses={expenses}
                        miCollection={miCollection}
                    />

                    <PaymentMethodBreakdown methods={mops} />

                    <TransactionDetailsCard
                        downloadUrl={transactionsDownloadUrl(fromDate, toDate, selectedBranch)}
                        showEmployee={selectedBranch === 'all'}
                        transactions={allTransactions}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
