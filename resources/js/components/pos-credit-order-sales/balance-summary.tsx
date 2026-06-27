import { Card, CardContent } from '@/components/ui/card';
import { formatPeso } from './formatters';
import { SectionTitle } from './section-title';
import { PortfolioSummary } from './types';

export function BalanceSummary({ portfolio }: { portfolio: PortfolioSummary }) {
    return (
        <div className="space-y-3">
            <SectionTitle>Balance Summary</SectionTitle>
            <div className="grid gap-4 md:grid-cols-3">
                <BalanceCard
                    label="Collectible Balance"
                    value={formatPeso(portfolio.collectible_balance)}
                    sub={`From ${portfolio.active_accounts} active accounts`}
                    className="border-primary/20 bg-primary/5"
                    valueClassName="text-primary"
                />
                <BalanceCard
                    label="Defaulted Balance"
                    value={formatPeso(portfolio.defaulted_balance)}
                    sub={`From ${portfolio.defaulted_accounts} defaulted accounts`}
                    className="border-destructive/20 bg-destructive/5"
                    valueClassName="text-destructive"
                />
                <Card>
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            Total Remaining Balance
                        </p>
                        <p className="mt-1 text-2xl font-extrabold break-words sm:text-3xl">
                            {formatPeso(portfolio.total_remaining_balance)}
                        </p>
                        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                            <div className="flex justify-between gap-3">
                                <span>Collectible</span>
                                <span className="font-semibold text-primary">
                                    {formatPeso(portfolio.collectible_balance)}
                                </span>
                            </div>
                            <div className="flex justify-between gap-3">
                                <span>Defaulted</span>
                                <span className="font-semibold text-destructive">
                                    {formatPeso(portfolio.defaulted_balance)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function BalanceCard({
    label,
    value,
    sub,
    className,
    valueClassName,
}: {
    label: string;
    value: string;
    sub: string;
    className: string;
    valueClassName: string;
}) {
    return (
        <Card className={className}>
            <CardContent className="p-4 sm:p-5">
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    {label}
                </p>
                <p
                    className={`mt-1 text-2xl font-extrabold break-words sm:text-3xl ${valueClassName}`}
                >
                    {value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </CardContent>
        </Card>
    );
}
