import { Card, CardContent } from '@/components/ui/card';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    chartColors,
    compactPeso,
    formatPercent,
    formatPeso,
} from './formatters';
import { SectionTitle } from './section-title';
import {
    CreditSalesFilters,
    ItemTypeKey,
    ItemTypeSummary,
    PeriodPerformance,
    PortfolioSummary,
} from './types';

const itemTypeRows: {
    label: string;
    key: ItemTypeKey;
    color: string;
}[] = [
    { label: 'Furniture', key: 'furniture', color: chartColors.furniture },
    { label: 'Appliances', key: 'appliances', color: chartColors.appliances },
    { label: 'Gadgets', key: 'gadgets', color: chartColors.gadgets },
];

export function ItemTypeBreakdown({
    filters,
    byItemType,
    portfolio,
    period,
}: {
    filters: CreditSalesFilters;
    byItemType: Record<ItemTypeKey, ItemTypeSummary>;
    portfolio: PortfolioSummary;
    period: PeriodPerformance;
}) {
    const chartData = itemTypeRows.map((row) => ({
        name: row.label,
        Expected: byItemType[row.key].expected,
        Collected: byItemType[row.key].collected,
        Balance: byItemType[row.key].balance,
    }));

    return (
        <div className="space-y-3">
            <SectionTitle>
                Item Type Breakdown - Active Accounts ({filters.date_from} to{' '}
                {filters.date_to})
            </SectionTitle>

            <Card>
                <CardContent className="p-4 sm:p-5">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={chartData} barGap={4}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                vertical={false}
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={compactPeso}
                            />
                            <Tooltip
                                formatter={(value: number) => formatPeso(value)}
                            />
                            <Legend iconType="circle" iconSize={8} />
                            <Bar
                                dataKey="Expected"
                                fill={chartColors.expected}
                                radius={[4, 4, 0, 0]}
                                barSize={28}
                            />
                            <Bar
                                dataKey="Collected"
                                fill={chartColors.collected}
                                radius={[4, 4, 0, 0]}
                                barSize={28}
                            />
                            <Bar
                                dataKey="Balance"
                                fill={chartColors.defaulted}
                                radius={[4, 4, 0, 0]}
                                barSize={28}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="space-y-3 lg:hidden">
                {itemTypeRows.map((row) => (
                    <ItemTypeCard
                        key={row.key}
                        label={row.label}
                        color={row.color}
                        data={byItemType[row.key]}
                    />
                ))}
                <ItemTypeCard
                    label="Total"
                    color={chartColors.active}
                    data={{
                        count: portfolio.active_accounts,
                        pnv: portfolio.total_active_pnv,
                        expected: period.expected,
                        collected: period.actual_collected,
                        balance: portfolio.collectible_balance,
                    }}
                />
            </div>

            <div className="hidden overflow-hidden rounded-lg border bg-card lg:block">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-right">Accounts</th>
                            <th className="px-4 py-3 text-right">PNV</th>
                            <th className="px-4 py-3 text-right">Expected</th>
                            <th className="px-4 py-3 text-right">Collected</th>
                            <th className="px-4 py-3 text-right">
                                Outstanding
                            </th>
                            <th className="px-4 py-3 text-right">
                                Collection Rate
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemTypeRows.map((row) => (
                            <ItemTypeTableRow
                                key={row.key}
                                label={row.label}
                                color={row.color}
                                data={byItemType[row.key]}
                            />
                        ))}
                        <ItemTypeTableRow
                            label="Total"
                            color={chartColors.active}
                            data={{
                                count: portfolio.active_accounts,
                                pnv: portfolio.total_active_pnv,
                                expected: period.expected,
                                collected: period.actual_collected,
                                balance: portfolio.collectible_balance,
                            }}
                            isTotal
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function itemTypeRate(data: ItemTypeSummary) {
    return data.expected > 0 ? (data.collected / data.expected) * 100 : 0;
}

function rateClassName(rate: number) {
    if (rate >= 85) {
        return 'text-green-600';
    }

    if (rate >= 60) {
        return 'text-amber-500';
    }

    return 'text-destructive';
}

function ItemTypeCard({
    label,
    color,
    data,
}: {
    label: string;
    color: string;
    data: ItemTypeSummary;
}) {
    const rate = itemTypeRate(data);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: color }}
                        />
                        <span className="font-semibold">{label}</span>
                    </div>
                    <span className={`font-bold ${rateClassName(rate)}`}>
                        {formatPercent(rate)}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <Metric label="Accounts" value={data.count.toString()} />
                    <Metric label="PNV" value={formatPeso(data.pnv)} />
                    <Metric
                        label="Expected"
                        value={formatPeso(data.expected)}
                    />
                    <Metric
                        label="Collected"
                        value={formatPeso(data.collected)}
                        valueClassName="text-green-600"
                    />
                    <Metric
                        label="Outstanding"
                        value={formatPeso(data.balance)}
                        className="col-span-2"
                        valueClassName="text-destructive"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function ItemTypeTableRow({
    label,
    color,
    data,
    isTotal = false,
}: {
    label: string;
    color: string;
    data: ItemTypeSummary;
    isTotal?: boolean;
}) {
    const rate = itemTypeRate(data);

    return (
        <tr
            className={`border-b ${isTotal ? 'bg-muted/50 font-bold' : 'hover:bg-muted/40'}`}
        >
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: color }}
                    />
                    <span className="font-semibold">{label}</span>
                </div>
            </td>
            <td className="px-4 py-3 text-right font-bold">{data.count}</td>
            <td className="px-4 py-3 text-right text-muted-foreground">
                {formatPeso(data.pnv)}
            </td>
            <td className="px-4 py-3 text-right text-muted-foreground">
                {formatPeso(data.expected)}
            </td>
            <td className="px-4 py-3 text-right font-semibold text-green-600">
                {formatPeso(data.collected)}
            </td>
            <td className="px-4 py-3 text-right font-semibold text-destructive">
                {formatPeso(data.balance)}
            </td>
            <td className="px-4 py-3 text-right">
                <span className={`font-bold ${rateClassName(rate)}`}>
                    {formatPercent(rate)}
                </span>
            </td>
        </tr>
    );
}

function Metric({
    label,
    value,
    className = '',
    valueClassName = '',
}: {
    label: string;
    value: string;
    className?: string;
    valueClassName?: string;
}) {
    return (
        <div className={className}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`mt-1 font-semibold break-words ${valueClassName}`}>
                {value}
            </p>
        </div>
    );
}
