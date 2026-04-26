import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle2,
    ChevronRight,
    Users,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Location {
    id: number;
    name: string;
}

interface Props {
    filters: {
        date_from: string;
        date_to: string;
        item_type: string;
        location_id: string | number;
    };
    locations: Location[];
    portfolio: {
        total_pnv: number;
        total_active_pnv: number;
        total_completed_pnv: number;
        total_defaulted_pnv: number;
        active_accounts: number;
        completed_accounts: number;
        defaulted_accounts: number;
        total_accounts: number;
        total_lcp: number;
        total_down_payment: number;
        collectible_balance: number;
        defaulted_balance: number;
        total_remaining_balance: number;
        total_rebate: number;
        total_advanced_payment: number;
    };
    period: {
        date_from: string;
        date_to: string;
        expected: number;
        actual_collected: number;
        uncollected: number;
        collection_rate: number;
        target_rate: number;
        variance: number;
        overall_collection_rate: number;
    };
    receivables: {
        current: number;
        '30_days': number;
        '60_days': number;
        '90_days': number;
        '90_plus_days': number;
        total: number;
    };
    collections: {
        current: number;
        '30_days': number;
        '60_days': number;
        '90_days': number;
        '90_plus_days': number;
        total: number;
    };
    by_item_type: {
        furniture: {
            count: number;
            pnv: number;
            expected: number;
            collected: number;
            balance: number;
        };
        appliances: {
            count: number;
            pnv: number;
            expected: number;
            collected: number;
            balance: number;
        };
        gadgets: {
            count: number;
            pnv: number;
            expected: number;
            collected: number;
            balance: number;
        };
    };
    monthly_trend: { month: string; expected: number; collected: number }[];
}

const php = (n: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    }).format(n);

const pct = (n: number) => `${n.toFixed(1)}%`;

const COLORS = {
    active: '#2563eb',
    completed: '#16a34a',
    defaulted: '#dc2626',
    expected: '#94a3b8',
    collected: '#2563eb',
    furniture: '#7c3aed',
    appliances: '#0891b2',
    gadgets: '#d97706',
};

function StatCard({
    label,
    value,
    sub,
    accent,
    icon: Icon,
}: {
    label: string;
    value: string;
    sub?: string;
    accent?: string;
    icon?: React.ElementType;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                    {label}
                </p>
                {Icon && <Icon className="h-4 w-4 text-slate-300" />}
            </div>
            <p
                className={`text-2xl font-bold tracking-tight ${accent ?? 'text-slate-800'}`}
            >
                {value}
            </p>
            {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <ChevronRight className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-bold tracking-widest text-slate-600 uppercase">
                {children}
            </h2>
        </div>
    );
}

function GaugeBar({ rate, target }: { rate: number; target: number }) {
    const capped = Math.min(rate, 100);
    const color =
        rate >= target
            ? '#16a34a'
            : rate >= target * 0.8
              ? '#d97706'
              : '#dc2626';
    return (
        <div className="space-y-1">
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${capped}%`, backgroundColor: color }}
                />
                {/* Target marker */}
                <div
                    className="absolute top-0 h-full w-0.5 bg-slate-400"
                    style={{ left: `${target}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
                <span>0%</span>
                <span>Target: {target}%</span>
                <span>100%</span>
            </div>
        </div>
    );
}

const agingLabels = [
    'Current',
    '1–30 Days',
    '31–60 Days',
    '61–90 Days',
    '90+ Days',
];
const agingKeys = [
    'current',
    '30_days',
    '60_days',
    '90_days',
    '90_plus_days',
] as const;
const agingColors = ['#2563eb', '#f59e0b', '#ef4444', '#b91c1c', '#7f1d1d'];

export default function Index({
    filters,
    locations,
    portfolio,
    period,
    receivables,
    collections,
    by_item_type,
    monthly_trend,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [itemType, setItemType] = useState(filters.item_type);
    const [locationId, setLocationId] = useState(
        filters.location_id.toString(),
    );

    const handleFilter = () => {
        router.get(
            '/pos-installment-orders-sales',
            {
                date_from: dateFrom,
                date_to: dateTo,
                item_type: itemType,
                location_id: locationId,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const accountPieData = [
        {
            name: 'Active',
            value: portfolio.active_accounts,
            fill: COLORS.active,
        },
        {
            name: 'Completed',
            value: portfolio.completed_accounts,
            fill: COLORS.completed,
        },
        {
            name: 'Defaulted',
            value: portfolio.defaulted_accounts,
            fill: COLORS.defaulted,
        },
    ];

    const receivablesData = agingKeys.map((k, i) => ({
        name: agingLabels[i],
        amount: receivables[k],
        fill: agingColors[i],
    }));

    const collectionsData = agingKeys.map((k, i) => ({
        name: agingLabels[i],
        amount: collections[k],
        fill: agingColors[i],
    }));

    const itemTypeRows = [
        {
            label: 'Furniture',
            key: 'furniture' as const,
            color: COLORS.furniture,
        },
        {
            label: 'Appliances',
            key: 'appliances' as const,
            color: COLORS.appliances,
        },
        { label: 'Gadgets', key: 'gadgets' as const, color: COLORS.gadgets },
    ];

    const itemTypeChartData = itemTypeRows.map((r) => ({
        name: r.label,
        Expected: by_item_type[r.key].expected,
        Collected: by_item_type[r.key].collected,
        Balance: by_item_type[r.key].balance,
    }));

    const collectionRateColor =
        period.collection_rate >= period.target_rate
            ? 'text-green-600'
            : period.collection_rate >= period.target_rate * 0.8
              ? 'text-amber-500'
              : 'text-red-600';

    return (
        <AppLayout>
            <Head title="Credit Sales Dashboard" />

            <div className="min-h-screen  px-4 py-6 md:px-8">
                <div className="mx-auto max-w-screen-2xl space-y-6">
                    {/* ── Page Header ───────────────────────────────────── */}
                    <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                Credit Sales Dashboard
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-400">
                                Showing data as of{' '}
                                <span className="font-medium text-slate-600">
                                    {new Date(
                                        filters.date_to,
                                    ).toLocaleDateString('en-PH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* ── Filters ───────────────────────────────────────── */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
                            Filters — Period & Scope
                        </p>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">
                                    Date From
                                </Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">
                                    Date To
                                </Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">
                                    Item Type
                                </Label>
                                <Select
                                    value={itemType}
                                    onValueChange={setItemType}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Types
                                        </SelectItem>
                                        <SelectItem value="furniture">
                                            Furniture
                                        </SelectItem>
                                        <SelectItem value="appliances">
                                            Appliances
                                        </SelectItem>
                                        <SelectItem value="gadgets">
                                            Gadgets
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">
                                    Location
                                </Label>
                                <Select
                                    value={locationId}
                                    onValueChange={setLocationId}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Locations
                                        </SelectItem>
                                        {locations.map((l) => (
                                            <SelectItem
                                                key={l.id}
                                                value={l.id.toString()}
                                            >
                                                {l.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleFilter}
                                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                            <span className="font-semibold text-slate-500">
                                Expected
                            </span>{' '}
                            = dues scheduled within this period (active
                            accounts) &nbsp;·&nbsp;
                            <span className="font-semibold text-slate-500">
                                Collected
                            </span>{' '}
                            = payments received within this period (by paid
                            date)
                        </p>
                    </div>

                    {/* ── Period Performance Banner ─────────────────────── */}
                    {/* <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-md">
                        <p className="mb-4 text-xs font-bold tracking-widest text-blue-200 uppercase">
                            Period Performance
                        </p>
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                            <div>
                                <p className="text-xs text-blue-200">
                                    Expected to Collect
                                </p>
                                <p className="text-2xl font-bold">
                                    {php(period.expected)}
                                </p>
                                <p className="text-xs text-blue-300">
                                    Dues within selected period
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">
                                    Actually Collected
                                </p>
                                <p className="text-2xl font-bold">
                                    {php(period.actual_collected)}
                                </p>
                                <p className="text-xs text-blue-300">
                                    Payments received in period
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">
                                    Uncollected
                                </p>
                                <p className="text-2xl font-bold text-amber-300">
                                    {php(period.uncollected)}
                                </p>
                                <p className="text-xs text-blue-300">
                                    Expected but not yet paid
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200">
                                    Collection Rate
                                </p>
                                <div className="flex items-end gap-2">
                                    <p className="text-2xl font-bold">
                                        {pct(period.collection_rate)}
                                    </p>
                                    {period.variance >= 0 ? (
                                        <div className="mb-0.5 flex items-center gap-1 text-sm text-green-300">
                                            <ArrowUpRight className="h-4 w-4" />
                                            <span>
                                                +{pct(period.variance)} vs
                                                target
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mb-0.5 flex items-center gap-1 text-sm text-red-300">
                                            <ArrowDownRight className="h-4 w-4" />
                                            <span>
                                                {pct(period.variance)} vs target
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <GaugeBar
                                        rate={period.collection_rate}
                                        target={period.target_rate}
                                    />
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* ── Portfolio Overview ────────────────────────────── */}
                    <div className="space-y-3">
                        <SectionTitle>Portfolio Overview</SectionTitle>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <StatCard
                                label="Total PNV"
                                value={php(portfolio.total_pnv)}
                                sub={`Active: ${php(portfolio.total_active_pnv)}`}
                                icon={Wallet}
                            />
                            <StatCard
                                label="Active Accounts"
                                value={portfolio.active_accounts.toString()}
                                sub={`of ${portfolio.total_accounts} total accounts`}
                                accent="text-blue-600"
                                icon={Users}
                            />
                            <StatCard
                                label="Completed Accounts"
                                value={portfolio.completed_accounts.toString()}
                                sub={
                                    php(portfolio.total_completed_pnv) + ' PNV'
                                }
                                accent="text-green-600"
                                icon={CheckCircle2}
                            />
                            <StatCard
                                label="Defaulted Accounts"
                                value={portfolio.defaulted_accounts.toString()}
                                sub={
                                    php(portfolio.total_defaulted_pnv) + ' PNV'
                                }
                                accent="text-red-600"
                                icon={XCircle}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <StatCard
                                label="Collectible Balance"
                                value={php(portfolio.collectible_balance)}
                                sub="Active accounts only"
                                accent="text-blue-700"
                            />
                            <StatCard
                                label="Defaulted Balance"
                                value={php(portfolio.defaulted_balance)}
                                sub="Uncollectible"
                                accent="text-red-600"
                            />
                            <StatCard
                                label="Total Down Payments"
                                value={php(portfolio.total_down_payment)}
                                sub="Collected upfront"
                            />
                            <StatCard
                                label="Rebates Given"
                                value={php(portfolio.total_rebate)}
                                sub="All accounts"
                            />
                        </div>
                    </div>

                    {/* ── Account Status + Monthly Trend ────────────────── */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Account Status Pie */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <SectionTitle>
                                Account Status Distribution
                            </SectionTitle>
                            <div className="mt-4 flex items-center gap-6">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={accountPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            dataKey="value"
                                            paddingAngle={3}
                                        >
                                            {accountPieData.map((e, i) => (
                                                <Cell key={i} fill={e.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(v: number) =>
                                                v + ' accounts'
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="shrink-0 space-y-3 text-sm">
                                    {accountPieData.map((d) => (
                                        <div
                                            key={d.name}
                                            className="flex items-center gap-2"
                                        >
                                            <span
                                                className="inline-block h-3 w-3 rounded-full"
                                                style={{ background: d.fill }}
                                            />
                                            <span className="text-slate-500">
                                                {d.name}
                                            </span>
                                            <span className="ml-auto font-bold text-slate-800">
                                                {d.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Monthly Trend */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <SectionTitle>
                                6-Month Expected vs Collected
                            </SectionTitle>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart
                                    data={monthly_trend}
                                    margin={{
                                        top: 16,
                                        right: 8,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(v) =>
                                            `₱${(v / 1000).toFixed(0)}k`
                                        }
                                    />
                                    <Tooltip
                                        formatter={(v: number) => php(v)}
                                    />
                                    <Legend iconType="circle" iconSize={8} />
                                    <Line
                                        type="monotone"
                                        dataKey="expected"
                                        name="Expected"
                                        stroke={COLORS.expected}
                                        strokeWidth={2}
                                        dot={false}
                                        strokeDasharray="5 3"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="collected"
                                        name="Collected"
                                        stroke={COLORS.collected}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Receivables & Collections Aging ───────────────── */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Receivables */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <SectionTitle>
                                Receivables by Aging (Active Accounts)
                            </SectionTitle>
                            <p className="mt-1 mb-3 text-xs text-slate-400">
                                Outstanding balance grouped by how overdue
                            </p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={receivablesData} barSize={32}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(v) =>
                                            `₱${(v / 1000).toFixed(0)}k`
                                        }
                                    />
                                    <Tooltip
                                        formatter={(v: number) => php(v)}
                                    />
                                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                        {receivablesData.map((e, i) => (
                                            <Cell key={i} fill={e.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-1.5">
                                {receivablesData.map((r, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="inline-block h-2.5 w-2.5 rounded-full"
                                                style={{ background: r.fill }}
                                            />
                                            <span className="text-slate-500">
                                                {r.name}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-slate-700">
                                            {php(r.amount)}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between border-t pt-2 text-sm font-bold">
                                    <span className="text-slate-700">
                                        Total Receivables
                                    </span>
                                    <span className="text-blue-600">
                                        {php(receivables.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Collections by Aging */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <SectionTitle>
                                Collections by Aging (Active Accounts)
                            </SectionTitle>
                            <p className="mt-1 mb-3 text-xs text-slate-400">
                                Payments received grouped by when the due date
                                fell
                            </p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={collectionsData} barSize={32}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(v) =>
                                            `₱${(v / 1000).toFixed(0)}k`
                                        }
                                    />
                                    <Tooltip
                                        formatter={(v: number) => php(v)}
                                    />
                                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                        {collectionsData.map((e, i) => (
                                            <Cell key={i} fill={e.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-1.5">
                                {collectionsData.map((r, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="inline-block h-2.5 w-2.5 rounded-full"
                                                style={{ background: r.fill }}
                                            />
                                            <span className="text-slate-500">
                                                {r.name}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-slate-700">
                                            {php(r.amount)}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between border-t pt-2 text-sm font-bold">
                                    <span className="text-slate-700">
                                        Total Collections
                                    </span>
                                    <span className="text-green-600">
                                        {php(collections.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Item Type Breakdown ───────────────────────────── */}
                    <div className="space-y-3">
                        <SectionTitle>
                            Item Type Breakdown — Active Accounts (Period:{' '}
                            {filters.date_from} → {filters.date_to})
                        </SectionTitle>

          
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={itemTypeChartData} barGap={4}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f1f5f9"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(v) =>
                                            `₱${(v / 1000).toFixed(0)}k`
                                        }
                                    />
                                    <Tooltip
                                        formatter={(v: number) => php(v)}
                                    />
                                    <Legend iconType="circle" iconSize={8} />
                                    <Bar
                                        dataKey="Expected"
                                        fill={COLORS.expected}
                                        radius={[4, 4, 0, 0]}
                                        barSize={28}
                                    />
                                    <Bar
                                        dataKey="Collected"
                                        fill={COLORS.collected}
                                        radius={[4, 4, 0, 0]}
                                        barSize={28}
                                    />
                                    <Bar
                                        dataKey="Balance"
                                        fill="#ef4444"
                                        radius={[4, 4, 0, 0]}
                                        barSize={28}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        <th className="px-5 py-3 text-left">
                                            Category
                                        </th>
                                        <th className="px-5 py-3 text-right">
                                            Accounts
                                        </th>
                                        <th className="px-5 py-3 text-right">
                                            PNV
                                        </th>
                                        <th className="px-5 py-3 text-right">
                                            Expected (Period)
                                        </th>
                                        <th className="px-5 py-3 text-right">
                                            Collected (Period)
                                        </th>
                                        <th className="px-5 py-3 text-right">
                                            Outstanding Balance
                                        </th>
                                        <th className="px-5 py-3 text-right">
                                            Collection Rate
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemTypeRows.map((row, i) => {
                                        const d = by_item_type[row.key];
                                        const rate =
                                            d.expected > 0
                                                ? (d.collected / d.expected) *
                                                  100
                                                : 0;
                                        return (
                                            <tr
                                                key={row.key}
                                                className={`border-b border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="inline-block h-2.5 w-2.5 rounded-full"
                                                            style={{
                                                                background:
                                                                    row.color,
                                                            }}
                                                        />
                                                        <span className="font-semibold text-slate-700">
                                                            {row.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right font-bold text-slate-700">
                                                    {d.count}
                                                </td>
                                                <td className="px-5 py-3 text-right text-slate-600">
                                                    {php(d.pnv)}
                                                </td>
                                                <td className="px-5 py-3 text-right text-slate-600">
                                                    {php(d.expected)}
                                                </td>
                                                <td className="px-5 py-3 text-right font-semibold text-green-600">
                                                    {php(d.collected)}
                                                </td>
                                                <td className="px-5 py-3 text-right font-semibold text-red-500">
                                                    {php(d.balance)}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <span
                                                        className={`font-bold ${rate >= 85 ? 'text-green-600' : rate >= 60 ? 'text-amber-500' : 'text-red-500'}`}
                                                    >
                                                        {pct(rate)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Totals row */}
                                    <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                                        <td className="px-5 py-3 text-slate-700">
                                            Total
                                        </td>
                                        <td className="px-5 py-3 text-right text-slate-700">
                                            {portfolio.active_accounts}
                                        </td>
                                        <td className="px-5 py-3 text-right text-slate-700">
                                            {php(portfolio.total_active_pnv)}
                                        </td>
                                        <td className="px-5 py-3 text-right text-slate-700">
                                            {php(period.expected)}
                                        </td>
                                        <td className="px-5 py-3 text-right text-green-600">
                                            {php(period.actual_collected)}
                                        </td>
                                        <td className="px-5 py-3 text-right text-red-500">
                                            {php(portfolio.collectible_balance)}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <span
                                                className={`${period.collection_rate >= 85 ? 'text-green-600' : period.collection_rate >= 60 ? 'text-amber-500' : 'text-red-500'}`}
                                            >
                                                {pct(period.collection_rate)}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Balance Summary ───────────────────────────────── */}
                    <div className="space-y-3">
                        <SectionTitle>Balance Summary</SectionTitle>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Collectible */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                                <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">
                                    Collectible Balance
                                </p>
                                <p className="mt-1 text-3xl font-extrabold text-blue-700">
                                    {php(portfolio.collectible_balance)}
                                </p>
                                <p className="mt-1 text-xs text-blue-400">
                                    From {portfolio.active_accounts} active
                                    accounts
                                </p>
                            </div>
                            {/* Defaulted */}
                            <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                                <p className="text-xs font-bold tracking-widest text-red-400 uppercase">
                                    Defaulted Balance
                                </p>
                                <p className="mt-1 text-3xl font-extrabold text-red-600">
                                    {php(portfolio.defaulted_balance)}
                                </p>
                                <p className="mt-1 text-xs text-red-400">
                                    From {portfolio.defaulted_accounts}{' '}
                                    defaulted accounts
                                </p>
                            </div>
                            {/* Total Remaining */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                    Total Remaining Balance
                                </p>
                                <p className="mt-1 text-3xl font-extrabold text-slate-800">
                                    {php(portfolio.total_remaining_balance)}
                                </p>
                                <div className="mt-2 space-y-1 text-xs text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Collectible</span>
                                        <span className="font-semibold text-blue-600">
                                            {php(portfolio.collectible_balance)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Defaulted</span>
                                        <span className="font-semibold text-red-500">
                                            {php(portfolio.defaulted_balance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="pb-4 text-center text-xs text-slate-300">
                        All figures are in Philippine Peso (PHP) · Active
                        accounts only for aging & period metrics
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
