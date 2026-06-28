import ModuleHeading from '@/components/cards/module-heading';
import { AgingTable } from '@/components/sales/aging-table';
import { SalesAnalyticsCards } from '@/components/sales/sales-analytics';
import { SalesFiltersCard } from '@/components/sales/sales-filters';
import { SalesSummaryCards } from '@/components/sales/sales-summary-cards';
import type { SalesBucketKey, SalesIndexProps } from '@/components/sales/types';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const bucketOrder: SalesBucketKey[] = ['current', '1_30', '31_60', '61_90', '90_plus'];

export default function SalesIndex({ filters, branches, summary, agingTables, analytics }: SalesIndexProps) {
    return (
        <AppLayout>
            <Head title="Sales" />
            <div className="space-y-6">
                <ModuleHeading
                    title="Sales"
                    description="Monitor installment receivables, aging risk, customer demand, and category sales performance"
                />

                <SalesFiltersCard branches={branches} filters={filters} />
                <SalesSummaryCards summary={summary} />
                <SalesAnalyticsCards analytics={analytics} />

                <div className="space-y-4">
                    {bucketOrder.map((bucket) => (
                        <AgingTable key={bucket} bucket={bucket} filters={filters} table={agingTables[bucket]} preview />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
