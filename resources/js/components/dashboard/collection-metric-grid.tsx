import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface CollectionMetricGridProps {
    cashCollection: number;
    dpCollection: number;
    expenses: number;
    miCollection: number;
}

const metrics = [
    {
        key: 'miCollection',
        label: 'M.I Collection',
        helper: 'Monthly Installment',
        icon: TrendingUp,
        iconClassName: 'bg-blue-500',
        cardClassName: 'from-blue-50 to-blue-100',
        valueClassName: 'text-slate-900',
    },
    {
        key: 'dpCollection',
        label: 'D.P Collection',
        helper: 'Down Payment',
        icon: Wallet,
        iconClassName: 'bg-emerald-500',
        cardClassName: 'from-emerald-50 to-emerald-100',
        valueClassName: 'text-slate-900',
    },
    {
        key: 'cashCollection',
        label: 'Cash Collection',
        helper: 'Cash Payments',
        icon: DollarSign,
        iconClassName: 'bg-amber-500',
        cardClassName: 'from-amber-50 to-amber-100',
        valueClassName: 'text-slate-900',
    },
    {
        key: 'expenses',
        label: 'Expenses',
        helper: 'Total Expenses',
        icon: TrendingDown,
        iconClassName: 'bg-rose-500',
        cardClassName: 'from-rose-50 to-rose-100',
        valueClassName: 'text-rose-600',
    },
] as const;

export function CollectionMetricGrid({ cashCollection, dpCollection, expenses, miCollection }: CollectionMetricGridProps) {
    const values = { cashCollection, dpCollection, expenses, miCollection };

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ key, label, helper, icon: Icon, iconClassName, cardClassName, valueClassName }) => (
                <Card
                    key={key}
                    className={`rounded-2xl border-0 bg-gradient-to-br shadow-lg transition-all duration-200 hover:shadow-xl ${cardClassName}`}
                >
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-sm font-semibold text-slate-700">{label}</CardTitle>
                            <div className={`rounded-xl p-2.5 shadow-md ${iconClassName}`}>
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold sm:text-3xl ${valueClassName}`}>
                            ₱{values[key].toLocaleString()}
                        </div>
                        <p className="mt-1.5 text-xs font-medium text-slate-600">{helper}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
