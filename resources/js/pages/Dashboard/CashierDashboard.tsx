import { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import ModuleHeading from '@/components/cards/module-heading';
import { CollectionMetricGrid } from '@/components/dashboard/collection-metric-grid';
import { CollectionSummaryCard } from '@/components/dashboard/collection-summary-card';
import type { DashboardTransaction } from '@/components/dashboard/collection-dashboard-types';
import { PaymentMethodBreakdown } from '@/components/dashboard/payment-method-breakdown';
import { TransactionDetailsCard } from '@/components/dashboard/transaction-details-card';
import AppLayout from '@/layouts/app-layout';
import { Calendar } from 'lucide-react';

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
}

const formattedToday = () =>
    new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
        year: 'numeric',
    });

export default function CashierDashboard({
    expenses,
    totalCashOnHand,
    totalOtherMop,
    allTransactions,
    mops,
    miCollection,
    dpCollection,
    cashCollection,
    netCollection,
}: PageProps) {
    const currentDate = useMemo(formattedToday, []);

    return (
        <AppLayout>
            <Head title="Cashier Dashboard" />
            <div className="min-h-screen">
                <div className="space-y-6">
                    <ModuleHeading title="RJL Household trading" description="Daily Cash Collection Report">
                        <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-white shadow-md sm:px-6">
                            <Calendar className="h-5 w-5" />
                            <span className="text-sm font-semibold">{currentDate}</span>
                        </div>
                    </ModuleHeading>

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
                        downloadUrl="/transactions/download-pdf"
                        emptyMessage="No transactions found for the selected date"
                        transactions={allTransactions}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
