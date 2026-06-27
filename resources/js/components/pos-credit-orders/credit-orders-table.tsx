import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { CreditOrderEmptyState } from './credit-order-empty-state';
import { CreditOrderStatusBadge } from './credit-order-status-badge';
import {
    formatCurrency,
    formatShortDate,
    remainingBalance,
} from './formatters';
import { POSCreditOrderListProps } from './types';

export function CreditOrdersTable({
    transactions,
    canViewDetails,
    onViewDetails,
}: POSCreditOrderListProps) {
    const columnCount = canViewDetails ? 10 : 9;

    return (
        <div className="hidden overflow-hidden rounded-lg border bg-card lg:block">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">
                            Customer
                        </TableHead>
                        <TableHead className="font-semibold">Item</TableHead>
                        <TableHead className="font-semibold">CRN</TableHead>
                        <TableHead className="font-semibold">
                            Transaction Date
                        </TableHead>
                        <TableHead className="font-semibold">
                            No. of Terms
                        </TableHead>
                        <TableHead className="font-semibold">
                            Total PNV
                        </TableHead>
                        <TableHead className="font-semibold">Monthly</TableHead>
                        <TableHead className="font-semibold">
                            Remaining Balance
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        {canViewDetails && (
                            <TableHead className="text-center font-semibold">
                                Actions
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columnCount}
                                className="py-12 text-center"
                            >
                                <CreditOrderEmptyState />
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((transaction) => (
                            <TableRow
                                key={transaction.order_number}
                                className="transition-colors hover:bg-muted/50"
                            >
                                <TableCell>
                                    {transaction.customer.full_name}
                                </TableCell>
                                <TableCell className="max-w-[220px] text-xs whitespace-normal">
                                    {transaction.installment_order_items
                                        .map((item) => item.item.model)
                                        .join(', ')}
                                </TableCell>
                                <TableCell className="text-xs">
                                    {transaction.receipt_number}
                                </TableCell>
                                <TableCell>
                                    {formatShortDate(
                                        transaction.transaction_date,
                                    )}
                                </TableCell>
                                <TableCell>
                                    {transaction.number_of_terms} months
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(transaction.total_pnv)}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(
                                        transaction.monthly_payment,
                                    )}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(
                                        remainingBalance(
                                            transaction.remaining_balance,
                                        ),
                                    )}
                                </TableCell>
                                <TableCell>
                                    <CreditOrderStatusBadge
                                        transaction={transaction}
                                    />
                                </TableCell>
                                {canViewDetails && (
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 cursor-pointer"
                                            onClick={() =>
                                                onViewDetails(
                                                    transaction.order_number,
                                                )
                                            }
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
