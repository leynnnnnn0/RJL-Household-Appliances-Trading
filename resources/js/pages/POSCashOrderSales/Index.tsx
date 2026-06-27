import { CategorySalesChart } from '@/components/pos-cash-order-sales/category-sales-chart';
import { LocationRevenueChart } from '@/components/pos-cash-order-sales/location-revenue-chart';
import { SalesDashboardFilters } from '@/components/pos-cash-order-sales/sales-dashboard-filters';
import { SalesSummaryCards } from '@/components/pos-cash-order-sales/sales-summary-cards';
import { SalesDashboardProps } from '@/components/pos-cash-order-sales/types';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function POSSalesDashboard({
    total_expense,
    total_sales,
    total_profit,
    sales_per_category,
    sales_by_location,
    locations,
    filters,
}: SalesDashboardProps) {
    return (
        <AppLayout>
            <Head title="POS Cash Order Sales" />

            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Sales Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Track your sales performance and revenue across all
                        locations
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <SalesDashboardFilters
                            filters={filters}
                            locations={locations}
                        />
                    </CardContent>
                </Card>

                <SalesSummaryCards
                    totalSales={total_sales}
                    totalExpense={total_expense}
                    totalProfit={total_profit}
                />

                <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                    <CategorySalesChart categories={sales_per_category} />
                    <LocationRevenueChart locations={sales_by_location} />
                </div>
            </div>
        </AppLayout>
    );
}
