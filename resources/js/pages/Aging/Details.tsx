import ModuleHeading from '@/components/cards/module-heading';
import Pagination from '@/components/pagination';
import { salesQueryString } from '@/components/sales/formatters';
import type { SalesFilters } from '@/components/sales/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchInput } from '@/components/ui/search-input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { show as showInstallmentOrder } from '@/routes/pos-installment-orders';
import type { Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    ArrowUpDown,
    Search,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface DetailColumn {
    key: keyof DetailRow;
    label: string;
    format: 'text' | 'date' | 'money' | 'status';
}

interface DetailRow {
    record_id: string;
    installment_order_id: number;
    order_number: string;
    customer_name: string;
    payment_schedule_id: number | null;
    due_date: string | null;
    paid_date: string | null;
    scheduled_amount: number;
    amount_paid: number;
    outstanding_balance: number;
    rebate_amount: number;
    aging_category: string;
    payment_status: string;
    branch: string;
    collector: string;
}

interface Props {
    filters: SalesFilters;
    type: string;
    title: string;
    columns: DetailColumn[];
    totalRecords: number;
    totalAmount: number | null;
    records: Paginated<DetailRow>;
    tableFilters: {
        search: string;
        sort: string;
        direction: 'asc' | 'desc';
    };
}

export default function AgingDetails({
    filters,
    type,
    title,
    columns,
    totalRecords,
    totalAmount,
    records,
    tableFilters,
}: Props) {
    const [search, setSearch] = useState(tableFilters.search);
    const highlightPaidRows = [
        'current',
        'aging-30',
        'aging-60',
        'aging-90',
    ].includes(type);

    useEffect(() => setSearch(tableFilters.search), [tableFilters.search]);

    const navigateWith = (changes: Record<string, string>) => {
        const params = new URLSearchParams(window.location.search);
        Object.entries(changes).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        params.delete('page');
        router.get(
            `/aging-report/details?${params.toString()}`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        navigateWith({ detail_search: search });
    };

    const sortBy = (key: string) => {
        navigateWith({
            sort: key,
            direction:
                tableFilters.sort === key && tableFilters.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        });
    };

    const openOrder = (orderNumber: string) => {
        router.visit(showInstallmentOrder.url(orderNumber));
    };

    const backUrl = `/aging?${salesQueryString(filters)}`;

    return (
        <AppLayout>
            <Head title={title} />
            <div className="space-y-6">
                <ModuleHeading
                    title={title}
                    description="Complete records included in this Aging Report statistic"
                >
                    <Button variant="outline" asChild>
                        <Link href={backUrl}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Aging Report
                        </Link>
                    </Button>
                </ModuleHeading>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm font-semibold text-muted-foreground">
                                Total Records
                            </p>
                            <p className="mt-2 text-2xl font-bold">
                                {totalRecords.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                    {totalAmount !== null && (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm font-semibold text-muted-foreground">
                                    Total Amount
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                    {formatMoney(totalAmount)}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card>
                    <CardContent className="space-y-4 p-4">
                        <form
                            onSubmit={submitSearch}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder="Search customer, order, schedule, collector, or branch..."
                                className="flex-1"
                            />
                            <Button type="submit" className="sm:w-32">
                                <Search className="h-4 w-4" />
                                Search
                            </Button>
                        </form>

                        <div className="hidden overflow-x-auto rounded-lg border lg:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        {columns.map((column) => (
                                            <TableHead
                                                key={column.key}
                                                className="font-semibold whitespace-nowrap"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        sortBy(column.key)
                                                    }
                                                    className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground"
                                                >
                                                    {column.label}
                                                    <SortIcon
                                                        active={
                                                            tableFilters.sort ===
                                                            column.key
                                                        }
                                                        direction={
                                                            tableFilters.direction
                                                        }
                                                    />
                                                </button>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="py-12 text-center text-muted-foreground"
                                            >
                                                No records found for this
                                                statistic and the current
                                                filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        records.data.map((row) => (
                                            <TableRow
                                                key={row.record_id}
                                                tabIndex={0}
                                                role="link"
                                                onClick={() =>
                                                    openOrder(row.order_number)
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === 'Enter' ||
                                                        event.key === ' '
                                                    )
                                                        openOrder(
                                                            row.order_number,
                                                        );
                                                }}
                                                className={`cursor-pointer transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none ${highlightPaidRows && row.payment_status === 'Paid' ? 'bg-emerald-50/80 hover:bg-emerald-100/80' : ''}`}
                                            >
                                                {columns.map((column) => (
                                                    <TableCell
                                                        key={column.key}
                                                        className="whitespace-nowrap"
                                                    >
                                                        <CellValue
                                                            value={
                                                                row[column.key]
                                                            }
                                                            format={
                                                                column.format
                                                            }
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-3 lg:hidden">
                            {records.data.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    No records found for this statistic and the
                                    current filters.
                                </div>
                            ) : (
                                records.data.map((row) => (
                                    <button
                                        key={row.record_id}
                                        type="button"
                                        onClick={() =>
                                            openOrder(row.order_number)
                                        }
                                        className={`w-full cursor-pointer rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50 ${highlightPaidRows && row.payment_status === 'Paid' ? 'border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/80' : ''}`}
                                    >
                                        <p className="font-semibold">
                                            {row.customer_name}
                                        </p>
                                        <p className="mb-3 text-xs text-muted-foreground">
                                            {row.order_number}
                                        </p>
                                        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                                            {columns
                                                .filter(
                                                    (column) =>
                                                        ![
                                                            'customer_name',
                                                            'order_number',
                                                        ].includes(column.key),
                                                )
                                                .map((column) => (
                                                    <div
                                                        key={column.key}
                                                        className="min-w-0"
                                                    >
                                                        <dt className="text-xs text-muted-foreground">
                                                            {column.label}
                                                        </dt>
                                                        <dd className="truncate font-medium">
                                                            <CellValue
                                                                value={
                                                                    row[
                                                                        column
                                                                            .key
                                                                    ]
                                                                }
                                                                format={
                                                                    column.format
                                                                }
                                                            />
                                                        </dd>
                                                    </div>
                                                ))}
                                        </dl>
                                    </button>
                                ))
                            )}
                        </div>

                        <Pagination data={records} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function CellValue({
    value,
    format,
}: {
    value: DetailRow[keyof DetailRow];
    format: DetailColumn['format'];
}) {
    if (value === null || value === '')
        return <span className="text-muted-foreground">—</span>;
    if (format === 'money') return formatMoney(Number(value));
    if (format === 'date') return formatDate(String(value));
    if (format === 'status')
        return <Badge variant="outline">{String(value)}</Badge>;
    return String(value);
}

function SortIcon({
    active,
    direction,
}: {
    active: boolean;
    direction: 'asc' | 'desc';
}) {
    if (!active)
        return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
    return direction === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5" />
    ) : (
        <ArrowDown className="h-3.5 w-3.5" />
    );
}

function formatMoney(value: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
}
