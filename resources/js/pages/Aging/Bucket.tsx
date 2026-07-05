import { AgingTable } from '@/components/aging/aging-table';
import ModuleHeading from '@/components/cards/module-heading';
import { SalesFiltersCard } from '@/components/sales/sales-filters';
import { salesQueryString } from '@/components/sales/formatters';
import type {
    AgingTableData,
    SalesBranch,
    SalesBucketKey,
    SalesFilters,
} from '@/components/sales/types';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface AgingBucketPageProps {
    filters: SalesFilters;
    bucket: SalesBucketKey;
    bucketLabel: string;
    branches: SalesBranch[];
    table: AgingTableData;
}

export default function AgingBucket({
    filters,
    bucket,
    bucketLabel,
    branches,
    table,
}: AgingBucketPageProps) {
    return (
        <AppLayout>
            <Head title={bucketLabel} />
            <div className="space-y-6">
                <ModuleHeading
                    title={bucketLabel}
                    description="Full installment receivables list for this aging bucket"
                >
                    <Button variant="outline" asChild>
                        <Link href={`/aging?${salesQueryString(filters)}`}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Aging
                        </Link>
                    </Button>
                </ModuleHeading>

                <SalesFiltersCard
                    branches={branches}
                    filters={filters}
                    action="/aging/bucket"
                    extraParams={{ bucket }}
                    showSearch
                    showDownloadAll
                    downloadLabel={`Download ${bucketLabel} PDF`}
                    downloadParams={{ bucket }}
                />
                <AgingTable bucket={bucket} filters={filters} table={table} />
            </div>
        </AppLayout>
    );
}
