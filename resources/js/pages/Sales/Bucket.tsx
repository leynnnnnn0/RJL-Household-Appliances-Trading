import ModuleHeading from '@/components/cards/module-heading';
import { AgingTable } from '@/components/sales/aging-table';
import { SalesFiltersCard } from '@/components/sales/sales-filters';
import type { AgingTableData, SalesBranch, SalesBucketKey, SalesFilters } from '@/components/sales/types';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface SalesBucketPageProps {
    filters: SalesFilters;
    bucket: SalesBucketKey;
    bucketLabel: string;
    branches: SalesBranch[];
    table: AgingTableData;
}

export default function SalesBucket({ filters, bucket, bucketLabel, branches, table }: SalesBucketPageProps) {
    return (
        <AppLayout>
            <Head title={bucketLabel} />
            <div className="space-y-6">
                <ModuleHeading title={bucketLabel} description="Full installment receivables list for this aging bucket">
                    <Button variant="outline" asChild>
                        <a href={`/sales?as_of_date=${filters.as_of_date}&branch_id=${filters.branch_id}&item_type=${filters.item_type}`}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Sales
                        </a>
                    </Button>
                </ModuleHeading>

                <SalesFiltersCard branches={branches} filters={filters} />
                <AgingTable bucket={bucket} filters={filters} table={table} />
            </div>
        </AppLayout>
    );
}
