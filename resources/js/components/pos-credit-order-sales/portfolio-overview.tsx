import { CheckCircle2, Users, Wallet, XCircle } from 'lucide-react';
import { formatPeso } from './formatters';
import { SectionTitle } from './section-title';
import { StatCard } from './stat-card';
import { PortfolioSummary } from './types';

export function PortfolioOverview({
    portfolio,
}: {
    portfolio: PortfolioSummary;
}) {
    return (
        <div className="space-y-3">
            <SectionTitle>Portfolio Overview</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total PNV"
                    value={formatPeso(portfolio.total_pnv)}
                    sub={`Active: ${formatPeso(portfolio.total_active_pnv)}`}
                    icon={Wallet}
                />
                <StatCard
                    label="Active Accounts"
                    value={portfolio.active_accounts.toString()}
                    sub={`of ${portfolio.total_accounts} total accounts`}
                    accent="text-primary"
                    icon={Users}
                />
                <StatCard
                    label="Completed Accounts"
                    value={portfolio.completed_accounts.toString()}
                    sub={`${formatPeso(portfolio.total_completed_pnv)} PNV`}
                    accent="text-green-600"
                    icon={CheckCircle2}
                />
                <StatCard
                    label="Defaulted Accounts"
                    value={portfolio.defaulted_accounts.toString()}
                    sub={`${formatPeso(portfolio.total_defaulted_pnv)} PNV`}
                    accent="text-destructive"
                    icon={XCircle}
                />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Collectible Balance"
                    value={formatPeso(portfolio.collectible_balance)}
                    sub="Active accounts only"
                    accent="text-primary"
                />
                <StatCard
                    label="Defaulted Balance"
                    value={formatPeso(portfolio.defaulted_balance)}
                    sub="Uncollectible"
                    accent="text-destructive"
                />
                <StatCard
                    label="Total Down Payments"
                    value={formatPeso(portfolio.total_down_payment)}
                    sub="Collected upfront"
                />
                <StatCard
                    label="Rebates Given"
                    value={formatPeso(portfolio.total_rebate)}
                    sub="All accounts"
                />
            </div>
        </div>
    );
}
