import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { router } from '@inertiajs/react';
import { HelpCircle, PackagePlus } from 'lucide-react';
import { formatPeso } from '../sales/formatters';
import type { NewReleaseRow, NewReleasesTableData } from '../sales/types';

function MobileNewReleaseRow({ row }: { row: NewReleaseRow }) {
    return (
        <button
            type="button"
            onClick={() => router.visit(`/pos-installment-orders/${row.order_number}`)}
            className="w-full rounded-xl border bg-white p-4 text-left transition-colors hover:bg-slate-50"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="break-words text-base font-bold">{row.customer_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{row.order_number}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">PNV</p>
                    <p className="font-bold">{formatPeso(row.pnv)}</p>
                </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-muted-foreground">Model</p>
                    <p className="line-clamp-2">{row.model}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-muted-foreground">Branch</p>
                    <p>{row.branch}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-muted-foreground">Term</p>
                    <p>{row.term}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-muted-foreground">Released</p>
                    <p>{row.transaction_date}</p>
                </div>
            </div>
        </button>
    );
}

export function NewReleasesTable({ table }: { table: NewReleasesTableData }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <PackagePlus className="h-5 w-5" />
                    <CardTitle>New Releases</CardTitle>
                    <Tooltip>
                        <TooltipTrigger type="button" className="text-muted-foreground">
                            <HelpCircle className="h-3.5 w-3.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                            Credit orders with a transaction date exactly matching the selected report date.
                        </TooltipContent>
                    </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                    {table.total_accounts} accounts · {formatPeso(table.total_pnv)} PNV
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-3 p-4 md:hidden">
                    {table.rows.map((row) => (
                        <MobileNewReleaseRow key={row.order_id} row={row} />
                    ))}
                    {table.rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No new releases found.</p>}
                </div>

                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[960px] text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 text-left font-bold">Customer</th>
                                <th className="p-3 text-left font-bold">Order #</th>
                                <th className="p-3 text-left font-bold">Branch</th>
                                <th className="p-3 text-left font-bold">Item Type</th>
                                <th className="p-3 text-left font-bold">Model</th>
                                <th className="p-3 text-right font-bold">Term</th>
                                <th className="p-3 text-left font-bold">Transaction Date</th>
                                <th className="p-3 text-right font-bold">PNV</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table.rows.map((row) => (
                                <tr
                                    key={row.order_id}
                                    onClick={() => router.visit(`/pos-installment-orders/${row.order_number}`)}
                                    className="cursor-pointer border-b bg-white hover:bg-slate-50"
                                >
                                    <td className="p-3 font-semibold">{row.customer_name}</td>
                                    <td className="p-3">{row.order_number}</td>
                                    <td className="p-3">{row.branch}</td>
                                    <td className="p-3 capitalize">{row.item_type}</td>
                                    <td className="max-w-[280px] truncate p-3">{row.model}</td>
                                    <td className="p-3 text-right">{row.term}</td>
                                    <td className="p-3">{row.transaction_date}</td>
                                    <td className="p-3 text-right font-semibold">{formatPeso(row.pnv)}</td>
                                </tr>
                            ))}
                            {table.rows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                        No new releases found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
