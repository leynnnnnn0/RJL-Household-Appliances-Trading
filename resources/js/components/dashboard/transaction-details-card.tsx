import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconFileExport } from '@tabler/icons-react';
import { FileText } from 'lucide-react';
import type { DashboardTransaction } from './collection-dashboard-types';
import { router } from '@inertiajs/react';

interface TransactionDetailsCardProps {
    downloadUrl: string;
    emptyMessage?: string;
    showEmployee?: boolean;
    transactions: DashboardTransaction[];
}

const currencyOrDash = (value: number | null | undefined) => (value && value > 0 ? `₱${Math.abs(value).toLocaleString()}` : '-');

const transactionAmountRows = (transaction: DashboardTransaction) => [
    { label: 'M.I', value: currencyOrDash(transaction.m_i) },
    { label: 'D.P', value: currencyOrDash(transaction.d_p) },
    { label: 'Cash', value: currencyOrDash(transaction.amount_paid) },
];

export function TransactionDetailsCard({
    downloadUrl,
    emptyMessage = 'No transactions found for the selected filters',
    showEmployee = false,
    transactions,
}: TransactionDetailsCardProps) {
    const colSpan = showEmployee ? 9 : 8;

    const goToDetails = (transaction: DashboardTransaction) => {
        const route =
            transaction.type === 'cash'
                ? `/pos-cash-orders/${transaction.order_number}`
                : `/pos-installment-orders/${transaction.order_number}`;
        router.get(route, {}, { preserveState: true });
    }

    return (
        <Card className="rounded-2xl border-slate-200 shadow-lg">
            <CardHeader className="rounded-t-2xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <FileText className="h-5 w-5" />
                        Transaction Details
                    </CardTitle>
                    <Button variant="outline" asChild>
                        <a href={downloadUrl} target="_blank" rel="noreferrer">
                            <IconFileExport className="h-4 w-4" />
                            Download PDF
                        </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-3 p-4 md:hidden">
                    {transactions.map((transaction, index) => (
                        <div
                            key={`${transaction.receipt_number}-mobile-${index}`}
                            className={`rounded-xl border p-4 ${
                                transaction.is_voided ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{transaction.date}</p>
                                    <p className="mt-1 break-words text-base font-bold text-slate-900">{transaction.customer}</p>
                                    <p className="mt-1 text-sm font-medium text-slate-600">{transaction.receipt_number}</p>
                                </div>
                                <Badge
                                    variant={
                                        transaction.is_voided
                                            ? 'destructive'
                                            : transaction.payment_method === 'cash'
                                              ? 'default'
                                              : 'secondary'
                                    }
                                    className="shrink-0 font-semibold"
                                >
                                    {transaction.payment_method}
                                </Badge>
                            </div>

                            {showEmployee && (
                                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                                    <span className="font-medium text-slate-500">Employee</span>
                                    <span className="ml-2 font-semibold text-slate-800">{transaction.employee_name || 'N/A'}</span>
                                </div>
                            )}

                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {transactionAmountRows(transaction).map((row) => (
                                    <div key={row.label} className="rounded-lg bg-slate-50 px-3 py-2">
                                        <p className="text-xs font-semibold text-slate-500">{row.label}</p>
                                        <p className="mt-1 text-sm font-bold text-slate-900">{row.value}</p>
                                    </div>
                                ))}
                            </div>

                            {transaction.remarks && (
                                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{transaction.remarks}</p>
                            )}
                        </div>
                    ))}

                    {transactions.length === 0 && (
                        <div className="py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-3">
                                <FileText className="h-12 w-12 text-slate-300" />
                                <p className="text-lg font-semibold">{emptyMessage}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[860px]">
                        <thead>
                            <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                                <th className="p-3 text-left text-sm font-bold text-slate-700 sm:p-4">Date</th>
                                <th className="p-3 text-left text-sm font-bold text-slate-700 sm:p-4">OR/CSI #</th>
                                <th className="p-3 text-left text-sm font-bold text-slate-700 sm:p-4">Customer Name</th>
                                {showEmployee && <th className="p-3 text-left text-sm font-bold text-slate-700 sm:p-4">Employee</th>}
                                <th className="p-3 text-right text-sm font-bold text-slate-700 sm:p-4">M.I</th>
                                <th className="p-3 text-right text-sm font-bold text-slate-700 sm:p-4">D.P</th>
                                <th className="p-3 text-right text-sm font-bold text-slate-700 sm:p-4">Cash</th>
                                <th className="p-3 text-left text-sm font-bold text-slate-700 sm:p-4">Payment</th>
                                <th className="p-3 text-left text-sm font-bold text-slate-700 sm:p-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr
                                    onClick={() => goToDetails(transaction)}
                                    key={`${transaction.receipt_number}-${index}`}
                                    className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                                        transaction.is_voided ? 'bg-rose-50' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                    }`}
                                >
                                    <td className="p-3 text-sm font-medium text-slate-600 sm:p-4">{transaction.date}</td>
                                    <td className="p-3 text-sm font-semibold text-slate-900 sm:p-4">{transaction.receipt_number}</td>
                                    <td className="p-3 text-sm font-medium text-slate-700 sm:p-4">{transaction.customer}</td>
                                    {showEmployee && (
                                        <td className="p-3 text-sm font-medium text-slate-700 sm:p-4">
                                            {transaction.employee_name || 'N/A'}
                                        </td>
                                    )}
                                    <td className="p-3 text-right text-sm font-semibold text-slate-900 sm:p-4">
                                        {currencyOrDash(transaction.m_i)}
                                    </td>
                                    <td className="p-3 text-right text-sm font-semibold text-slate-900 sm:p-4">
                                        {currencyOrDash(transaction.d_p)}
                                    </td>
                                    <td className="p-3 text-right text-sm font-semibold text-slate-900 sm:p-4">
                                        {currencyOrDash(transaction.amount_paid)}
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <Badge
                                            variant={
                                                transaction.is_voided
                                                    ? 'destructive'
                                                    : transaction.payment_method === 'cash'
                                                      ? 'default'
                                                      : 'secondary'
                                            }
                                            className="font-semibold"
                                        >
                                            {transaction.payment_method}
                                        </Badge>
                                    </td>
                                    <td className="max-w-xs truncate p-3 text-sm text-slate-600 sm:p-4">{transaction.remarks}</td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={colSpan} className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="h-12 w-12 text-slate-300" />
                                            <p className="text-lg font-semibold">{emptyMessage}</p>
                                        </div>
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
