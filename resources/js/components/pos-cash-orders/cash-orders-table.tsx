import { Badge } from '@/components/ui/badge';
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
import { formatCurrency, formatShortDate } from './formatters';
import { OrderEmptyState } from './order-empty-state';
import { POSCashOrderListProps } from './types';

export function CashOrdersTable({
    transactions,
    canViewDetails,
    onViewDetails,
}: POSCashOrderListProps) {
    const columnCount = canViewDetails ? 8 : 7;

    return (
        <div className="hidden overflow-hidden rounded-lg border bg-card lg:block">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">
                            Order Number
                        </TableHead>
                        <TableHead className="font-semibold">
                            Transaction Date
                        </TableHead>
                        <TableHead className="font-semibold">Branch</TableHead>
                        <TableHead className="font-semibold">
                            Employee
                        </TableHead>
                        <TableHead className="font-semibold">Items</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">
                            Total Price
                        </TableHead>
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
                                <OrderEmptyState />
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((transaction) => (
                            <TableRow
                                key={transaction.order_number}
                                className="transition-colors hover:bg-muted/50"
                            >
                                <TableCell className="font-medium">
                                    {transaction.order_number}
                                </TableCell>
                                <TableCell>
                                    {formatShortDate(
                                        transaction.transaction_date,
                                    )}
                                </TableCell>
                                <TableCell>{transaction.branch.name}</TableCell>
                                <TableCell>
                                    {transaction.employee.full_name}
                                </TableCell>
                                <TableCell>
                                    <ItemCountBadge
                                        count={
                                            transaction.order_items?.length || 0
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge isVoid={transaction.is_void} />
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    {formatCurrency(transaction.total_price)}
                                </TableCell>
                                {canViewDetails && (
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
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

export function StatusBadge({ isVoid }: { isVoid: boolean | number }) {
    return (
        <Badge variant={isVoid ? 'destructive' : 'default'}>
            {isVoid ? 'Voided' : 'Active'}
        </Badge>
    );
}

export function ItemCountBadge({ count }: { count: number }) {
    return (
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {count} items
        </span>
    );
}
