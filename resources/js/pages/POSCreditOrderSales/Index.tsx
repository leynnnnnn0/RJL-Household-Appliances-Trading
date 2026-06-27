import { AccountStatusChart } from '@/components/pos-credit-order-sales/account-status-chart';
import { AgingChartCard } from '@/components/pos-credit-order-sales/aging-chart-card';
import { BalanceSummary } from '@/components/pos-credit-order-sales/balance-summary';
import { ItemTypeBreakdown } from '@/components/pos-credit-order-sales/item-type-breakdown';
import { MonthlyTrendChart } from '@/components/pos-credit-order-sales/monthly-trend-chart';
import { PortfolioOverview } from '@/components/pos-credit-order-sales/portfolio-overview';
import { CreditSalesDashboardFilters } from '@/components/pos-credit-order-sales/sales-dashboard-filters';
import { CreditSalesDashboardProps } from '@/components/pos-credit-order-sales/types';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function CreditSalesDashboard({
    filters,
    locations,
    portfolio,
    period,
    receivables,
    collections,
    by_item_type,
    monthly_trend,
}: CreditSalesDashboardProps) {
    return (
        <AppLayout>
            <Head title="Credit Sales Dashboard" />

            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Credit Sales Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Track installment sales, collection performance, and
                        receivable aging.
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <CreditSalesDashboardFilters
                            filters={filters}
                            locations={locations}
                        />
                    </CardContent>
                </Card>

                <PortfolioOverview portfolio={portfolio} />

                <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                    <AccountStatusChart portfolio={portfolio} />
                    <MonthlyTrendChart monthlyTrend={monthly_trend} />
                </div>

                <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                    <AgingChartCard
                        title="Receivables by Aging"
                        description="Outstanding balance grouped by how overdue each payment is."
                        buckets={receivables}
                        totalLabel="Total Receivables"
                        totalClassName="text-primary"
                    />
                    <AgingChartCard
                        title="Collections by Aging"
                        description="Payments received grouped by when the due date fell."
                        buckets={collections}
                        totalLabel="Total Collections"
                        totalClassName="text-green-600"
                    />
                </div>

                <ItemTypeBreakdown
                    filters={filters}
                    byItemType={by_item_type}
                    portfolio={portfolio}
                    period={period}
                />

                <BalanceSummary portfolio={portfolio} />

                <p className="pb-4 text-center text-xs text-muted-foreground">
                    All figures are in Philippine Peso (PHP). Aging and period
                    metrics use active accounts only.
                </p>
            </div>
        </AppLayout>
    );
}
