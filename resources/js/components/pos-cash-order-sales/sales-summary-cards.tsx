import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { formatCurrency } from './formatters';

type Props = {
    totalSales: number | string;
    totalExpense: number | string;
    totalProfit: number | string;
};

export function SalesSummaryCards({
    totalSales,
    totalExpense,
    totalProfit,
}: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
                title="Total Sales"
                value={totalSales}
                icon={
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                }
            />
            <SummaryCard
                title="Total Expenses"
                value={totalExpense}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <SummaryCard
                title="Total Profit"
                value={totalProfit}
                valueClassName="text-emerald-600"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    valueClassName = '',
}: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    valueClassName?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div
                    className={`text-2xl font-bold break-words ${valueClassName}`}
                >
                    {formatCurrency(value)}
                </div>
            </CardContent>
        </Card>
    );
}
