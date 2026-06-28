import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Banknote, HelpCircle, Percent, Users } from 'lucide-react';
import { formatPeso } from './formatters';
import type { SalesIndexProps } from './types';

export function SalesSummaryCards({ summary }: { summary: SalesIndexProps['summary'] }) {
    const cards = [
        {
            label: 'Accounts With Balance',
            value: summary.accounts.toLocaleString(),
            helper: `${summary.active_accounts} active accounts`,
            icon: Users,
            tooltip: 'Unique installment accounts with unpaid scheduled balances as of the report date.',
        },
        {
            label: 'Active PNV',
            value: formatPeso(summary.pnv),
            helper: 'Open installment portfolio',
            icon: Banknote,
            tooltip: 'Total promissory note value for active installment orders in the filtered portfolio.',
        },
        {
            label: 'Remaining Balance',
            value: formatPeso(summary.remaining_balance),
            helper: 'Uncollected receivables',
            icon: Banknote,
            tooltip: 'Total unpaid scheduled balance across all aging buckets.',
        },
        {
            label: 'Risk Balance',
            value: formatPeso(summary.risk_balance),
            helper: '61 days and above',
            icon: AlertTriangle,
            tooltip: 'Balances in the 61-90 and 90+ aging buckets, useful for collection risk review.',
        },
        {
            label: 'Collection Rate',
            value: `${summary.collection_rate}%`,
            helper: 'Paid vs active PNV',
            icon: Percent,
            tooltip: 'Estimated collected percentage against active PNV after subtracting remaining balance.',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map(({ label, value, helper, icon: Icon, tooltip }) => (
                <Card key={label}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-semibold text-muted-foreground">{label}</p>
                                    <Tooltip>
                                        <TooltipTrigger type="button" className="text-muted-foreground">
                                            <HelpCircle className="h-3.5 w-3.5" />
                                        </TooltipTrigger>
                                        <TooltipContent>{tooltip}</TooltipContent>
                                    </Tooltip>
                                </div>
                                <p className="mt-2 text-2xl font-bold">{value}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
                            </div>
                            <div className="rounded-lg bg-slate-100 p-2">
                                <Icon className="h-5 w-5 text-slate-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
