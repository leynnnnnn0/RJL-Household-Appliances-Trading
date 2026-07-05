import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { router } from '@inertiajs/react';
import { FileDown, HelpCircle, Search } from 'lucide-react';
import { formatPeso, salesQueryString } from '../sales/formatters';
import type {
    AgingRow,
    AgingTableData,
    SalesBucketKey,
    SalesFilters,
} from '../sales/types';

interface AgingTableProps {
    bucket: SalesBucketKey;
    filters: SalesFilters;
    table: AgingTableData;
    preview?: boolean;
}

function agingRowClass(row: AgingRow) {
    if (row.is_final_payment_paid) {
        return 'bg-sky-50 hover:bg-sky-100';
    }

    if (row.is_paid) {
        return 'bg-yellow-50 hover:bg-yellow-100';
    }

    return 'bg-white hover:bg-slate-50';
}

function MobileAgingRow({ row }: { row: AgingRow }) {
    return (
        <button
            type="button"
            onClick={() => router.visit(`/pos-installment-orders/${row.order_number}`)}
            className={`w-full rounded-xl border p-4 text-left transition-colors ${agingRowClass(row)}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="break-words text-base font-bold">{row.customer_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{row.order_number}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="font-bold">{formatPeso(row.remaining_balance)}</p>
                </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-muted-foreground">Model</p>
                    <p className="line-clamp-2">{row.model}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-muted-foreground">Due Date</p>
                    <p>{row.due_date}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-muted-foreground">MI</p>
                    <p>{formatPeso(row.monthly_installment)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-muted-foreground">Age</p>
                    <p>{row.days_overdue}</p>
                </div>
            </div>
        </button>
    );
}

export function AgingTable({ bucket, filters, table, preview = false }: AgingTableProps) {
    const query = salesQueryString(filters, { bucket });

    return (
        <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-1.5">
                        <CardTitle>{table.label}</CardTitle>
                        <Tooltip>
                            <TooltipTrigger type="button" className="text-muted-foreground">
                                <HelpCircle className="h-3.5 w-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Accounts are grouped by the oldest unpaid schedule in the cutoff cycle. Paid current rows are yellow; paid final schedules are blue.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {table.total_accounts} accounts · {formatPeso(table.total_balance)} balance
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    {preview && (
                        <Button variant="outline" asChild>
                            <a href={`/aging/bucket?${query}`}>
                                <Search className="h-4 w-4" />
                                View More
                            </a>
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <a href={`/aging/download-pdf?${query}`}>
                            <FileDown className="h-4 w-4" />
                            PDF
                        </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-3 p-4 md:hidden">
                    {table.rows.map((row) => (
                        <MobileAgingRow key={`${row.order_id}-${row.bucket}`} row={row} />
                    ))}
                    {table.rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No accounts found.</p>}
                </div>

                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[1100px] text-sm">
                        <thead className="bg-lime-100">
                            <tr>
                                <th className="p-3 text-left font-bold">Name of Customer</th>
                                <th className="p-3 text-left font-bold">Address</th>
                                <th className="p-3 text-left font-bold">Model</th>
                                <th className="p-3 text-right font-bold">Term</th>
                                <th className="p-3 text-left font-bold">Date Released</th>
                                <th className="p-3 text-left font-bold">Due Date</th>
                                <th className="p-3 text-right font-bold">MI</th>
                                <th className="p-3 text-right font-bold">PNV</th>
                                <th className="p-3 text-right font-bold">Remaining Balance</th>
                                <th className="p-3 text-right font-bold">Age</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table.rows.map((row) => (
                                <tr
                                    key={`${row.order_id}-${row.bucket}`}
                                    onClick={() => router.visit(`/pos-installment-orders/${row.order_number}`)}
                                    className={`cursor-pointer border-b ${agingRowClass(row)}`}
                                >
                                    <td className="p-3 font-semibold">{row.customer_name}</td>
                                    <td className="max-w-[220px] truncate p-3">{row.address}</td>
                                    <td className="max-w-[260px] truncate p-3">{row.model}</td>
                                    <td className="p-3 text-right">{row.term}</td>
                                    <td className="p-3">{row.date_released}</td>
                                    <td className="p-3">{row.due_date}</td>
                                    <td className="p-3 text-right">{formatPeso(row.monthly_installment)}</td>
                                    <td className="p-3 text-right">{formatPeso(row.pnv)}</td>
                                    <td className="p-3 text-right font-semibold">{formatPeso(row.remaining_balance)}</td>
                                    <td className="p-3 text-right">{row.days_overdue}</td>
                                </tr>
                            ))}
                            {table.rows.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                                        No accounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-orange-100 font-bold">
                                <td className="p-3" colSpan={6}>
                                    Total
                                </td>
                                <td className="p-3 text-right">{formatPeso(table.total_due)}</td>
                                <td />
                                <td className="p-3 text-right">{formatPeso(table.total_balance)}</td>
                                <td className="p-3 text-right">{table.total_accounts}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
