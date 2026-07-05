import ModuleHeading from '@/components/cards/module-heading';
import { SalesAnalyticsCards } from '@/components/sales/sales-analytics';
import { SalesFiltersCard } from '@/components/sales/sales-filters';
import { SalesSummaryCards } from '@/components/sales/sales-summary-cards';
import { salesQueryString } from '@/components/sales/formatters';
import type { SalesIndexProps } from '@/components/sales/types';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ChartNoAxesCombined, Construction } from 'lucide-react';

export default function SalesIndex({
    filters,
    branches,
    summary,
    analytics,
}: SalesIndexProps) {
    return (
        <AppLayout>
            <Head title="Sales" />
            <div className="space-y-6">
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                    <Construction className="h-4 w-4 shrink-0" />
                    <p className="text-sm font-medium">
                        This page is currently under development. Some data or
                        features may be incomplete or unavailable.
                    </p>
                </div>

                <ModuleHeading
                    title="Sales"
                    description="Monitor installment receivables, aging risk, customer demand, and category sales performance"
                >
                    <Button asChild variant="outline">
                        <Link href={`/aging?${salesQueryString(filters)}`}>
                            <ChartNoAxesCombined className="h-4 w-4" />
                            Open Aging
                        </Link>
                    </Button>
                </ModuleHeading>

                <SalesFiltersCard branches={branches} filters={filters} />
                <SalesSummaryCards summary={summary} />
                <SalesAnalyticsCards analytics={analytics} />
            </div>
        </AppLayout>
    );
}
