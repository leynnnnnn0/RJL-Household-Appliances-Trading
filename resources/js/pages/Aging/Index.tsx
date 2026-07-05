import { AgingTable } from '@/components/aging/aging-table';
import { NewReleasesTable } from '@/components/aging/new-releases-table';
import ModuleHeading from '@/components/cards/module-heading';
import { SalesFiltersCard } from '@/components/sales/sales-filters';
import type {
    AgingTableData,
    NewReleasesTableData,
    SalesBranch,
    SalesBucketKey,
    SalesFilters,
} from '@/components/sales/types';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const bucketOrder: SalesBucketKey[] = [
    'current',
    '1_30',
    '31_60',
    '61_90',
    '90_plus',
];

interface AgingIndexProps {
    filters: SalesFilters;
    branches: SalesBranch[];
    bucketLabels: Record<SalesBucketKey, string>;
    agingTables: Record<SalesBucketKey, AgingTableData>;
    newReleases: NewReleasesTableData;
}

export default function AgingIndex({
    filters,
    branches,
    agingTables,
    newReleases,
}: AgingIndexProps) {
    return (
        <AppLayout>
            <Head title="Aging" />
            <div className="space-y-6">
                <ModuleHeading
                    title="Aging"
                    description="Review installment receivables by current and overdue aging buckets"
                />

                <SalesFiltersCard
                    branches={branches}
                    filters={filters}
                    action="/aging"
                    showDownloadAll
                />

                <NewReleasesTable table={newReleases} />

                <div className="space-y-4">
                    {bucketOrder.map((bucket) => (
                        <AgingTable
                            key={bucket}
                            bucket={bucket}
                            filters={filters}
                            table={agingTables[bucket]}
                            preview
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
