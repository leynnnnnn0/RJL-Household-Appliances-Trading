import { salesQueryString } from '@/components/sales/formatters';
import type {
    AgingBucketStatistic,
    AgingStatistics,
    SalesFilters,
} from '@/components/sales/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import {
    Banknote,
    CalendarClock,
    CircleCheck,
    CircleDollarSign,
    Percent,
    ReceiptText,
    Users,
    WalletCards,
} from 'lucide-react';

const bucketOrder = ['current', '30_days', '60_days', '90_plus'] as const;

const peso = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

const percentage = (value: number) => `${Number(value).toFixed(2)}%`;

export function AgingStatisticsDashboard({
    statistics,
    filters,
}: {
    statistics: AgingStatistics;
    filters: SalesFilters;
}) {
    const detailHref = (type: string, extra: Record<string, string> = {}) =>
        `/aging-report/details?${salesQueryString(filters, {
            type,
            ...extra,
        })}`;
    const accountCards = [
        {
            label: 'Total Accounts',
            value: statistics.accounts.total,
            icon: Users,
            type: 'total-accounts',
        },
        {
            label: 'Fully Paid Accounts',
            value: statistics.accounts.fully_paid,
            icon: CircleCheck,
            type: 'paid-accounts',
        },
        {
            label: 'Accounts with Outstanding Balance',
            value: statistics.accounts.outstanding,
            icon: WalletCards,
            type: 'unpaid-accounts',
        },
    ];

    const collectionCards = [
        {
            label: 'Expected Collection',
            value: peso(statistics.collection_summary.expected_amount),
            icon: ReceiptText,
            type: 'expected-collection',
        },
        {
            label: 'Collected Amount',
            value: peso(statistics.collection_summary.collected_amount),
            icon: CircleDollarSign,
            type: 'collected',
        },
        {
            label: 'Outstanding Amount',
            value: peso(statistics.collection_summary.outstanding_amount),
            icon: Banknote,
            type: 'outstanding',
        },
        {
            label: 'Collection Percentage',
            value: percentage(
                statistics.collection_summary.collection_percentage,
            ),
            icon: Percent,
            type: 'collection-percentage',
        },
    ];

    return (
        <section className="space-y-6" aria-labelledby="aging-statistics-title">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2
                        id="aging-statistics-title"
                        className="text-xl font-bold tracking-tight"
                    >
                        Statistics Dashboard
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        All values reflect the active report filters.
                    </p>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                    Cutoff: {formatDate(statistics.cutoff.start)} –{' '}
                    {formatDate(statistics.cutoff.end)}
                </p>
            </div>

            <DashboardSection title="Account Statistics">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {accountCards.map(({ label, value, icon: Icon, type }) => (
                        <MetricCard
                            key={label}
                            label={label}
                            value={value.toLocaleString()}
                            icon={Icon}
                            href={detailHref(type)}
                        />
                    ))}
                </div>
            </DashboardSection>

            <DashboardSection title="Aging Account Distribution">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {bucketOrder.map((bucket) => {
                        const item = statistics.aging_distribution[bucket];
                        const bucketType = {
                            current: 'current',
                            '30_days': 'aging-30',
                            '60_days': 'aging-60',
                            '90_plus': 'aging-90',
                        }[bucket];

                        return (
                            <Card key={bucket}>
                                <CardContent className="space-y-4 p-4">
                                    <Link
                                        href={detailHref(bucketType)}
                                        className="flex cursor-pointer items-start justify-between gap-3 rounded-md transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-muted-foreground">
                                                {item.label}
                                            </p>
                                            <p className="mt-1 text-2xl font-bold">
                                                {item.accounts.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Accounts
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                            {percentage(
                                                item.account_percentage,
                                            )}
                                        </span>
                                    </Link>
                                    <div className="grid grid-cols-2 gap-2 border-t pt-3 text-sm">
                                        <StatPair
                                            label="Paid"
                                            value={item.paid_accounts.toLocaleString()}
                                            tone="text-emerald-700"
                                            href={detailHref('paid-accounts', {
                                                aging_category: bucketType,
                                                payment_status: 'paid',
                                            })}
                                        />
                                        <StatPair
                                            label="Unpaid"
                                            value={item.unpaid_accounts.toLocaleString()}
                                            tone="text-rose-700"
                                            href={detailHref(
                                                'unpaid-accounts',
                                                {
                                                    aging_category: bucketType,
                                                    payment_status: 'unpaid',
                                                },
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </DashboardSection>

            <DashboardSection title="Collection Summary">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {collectionCards.map(
                        ({ label, value, icon: Icon, type }) => (
                            <MetricCard
                                key={label}
                                label={label}
                                value={value}
                                icon={Icon}
                                href={detailHref(type)}
                            />
                        ),
                    )}
                </div>
            </DashboardSection>

            <div className="grid gap-4 xl:grid-cols-3">
                <SummaryCard
                    title="Advance Payment Summary"
                    icon={CalendarClock}
                    items={[
                        [
                            'Number of Advance Payments',
                            statistics.advance_payments.count.toLocaleString(),
                        ],
                        [
                            'Total Advance Payment Amount',
                            peso(statistics.advance_payments.amount),
                        ],
                    ]}
                    href={detailHref('advance-payments')}
                />
                <SummaryCard
                    title="Rebate Summary"
                    icon={ReceiptText}
                    items={[
                        [
                            'Number of Rebates',
                            statistics.rebates.count.toLocaleString(),
                        ],
                        [
                            'Total Rebate Amount',
                            peso(statistics.rebates.amount),
                        ],
                    ]}
                    href={detailHref('rebates')}
                />
                <SummaryCard
                    title="Collection Revenue"
                    icon={CircleDollarSign}
                    items={[
                        [
                            'Without Advance Payments',
                            peso(statistics.revenue.without_advance),
                        ],
                        [
                            'Including Advance Payments',
                            peso(statistics.revenue.including_advance),
                        ],
                    ]}
                    itemHrefs={[
                        detailHref('revenue-without-advance'),
                        detailHref('revenue-with-advance'),
                    ]}
                />
            </div>

            <DashboardSection title="Collection Percentage Per Aging">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {bucketOrder.map((bucket) => (
                        <AgingCollectionCard
                            key={bucket}
                            item={statistics.aging_distribution[bucket]}
                            href={detailHref(
                                {
                                    current: 'current',
                                    '30_days': 'aging-30',
                                    '60_days': 'aging-60',
                                    '90_plus': 'aging-90',
                                }[bucket],
                            )}
                        />
                    ))}
                </div>
            </DashboardSection>
        </section>
    );
}

function DashboardSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
                {title}
            </h3>
            {children}
        </div>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
    href,
}: {
    label: string;
    value: string;
    icon: typeof Users;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="block cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
                <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">
                            {label}
                        </p>
                        <p className="mt-2 text-2xl font-bold tracking-tight">
                            {value}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
                        <Icon className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function StatPair({
    label,
    value,
    tone,
    href,
}: {
    label: string;
    value: string;
    tone: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="cursor-pointer rounded p-1 transition-colors hover:bg-muted"
        >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`font-bold ${tone}`}>{value}</p>
        </Link>
    );
}

function SummaryCard({
    title,
    icon: Icon,
    items,
    href,
    itemHrefs,
}: {
    title: string;
    icon: typeof Users;
    items: [string, string][];
    href?: string;
    itemHrefs?: string[];
}) {
    const content = (
        <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                <Icon className="h-5 w-5 text-slate-700" />
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.map(([label, value], index) => {
                    const row = (
                        <div className="flex items-end justify-between gap-4 border-t pt-3 first:border-0 first:pt-0">
                            <p className="text-sm text-muted-foreground">
                                {label}
                            </p>
                            <p className="text-right font-bold">{value}</p>
                        </div>
                    );

                    return itemHrefs?.[index] ? (
                        <Link
                            key={label}
                            href={itemHrefs[index]}
                            className="block cursor-pointer rounded transition-colors hover:bg-muted/50"
                        >
                            {row}
                        </Link>
                    ) : (
                        <div key={label}>{row}</div>
                    );
                })}
            </CardContent>
        </Card>
    );

    return href ? (
        <Link href={href} className="block cursor-pointer rounded-xl">
            {content}
        </Link>
    ) : (
        content
    );
}

function AgingCollectionCard({
    item,
    href,
}: {
    item: AgingBucketStatistic;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="block cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">
                            {item.label}
                        </CardTitle>
                        <span className="text-lg font-bold">
                            {percentage(item.collection_percentage)}
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-slate-700"
                            style={{
                                width: `${Math.min(Math.max(item.collection_percentage, 0), 100)}%`,
                            }}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <AmountRow label="Expected" value={item.expected_amount} />
                    <AmountRow
                        label="Collected"
                        value={item.collected_amount}
                    />
                    <AmountRow
                        label="Outstanding"
                        value={item.outstanding_amount}
                    />
                </CardContent>
            </Card>
        </Link>
    );
}

function AmountRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{peso(value)}</span>
        </div>
    );
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
}
