import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { OrderWithrelations } from '@/types';
import { Package } from 'lucide-react';
import { formatCurrency } from './formatters';

export function OrderItemsCard({
    transaction,
}: {
    transaction: OrderWithrelations;
}) {
    return (
        <Card>
            <CardHeader className="px-4 pb-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-4 w-4" />
                    Order Items ({transaction.order_items?.length || 0})
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-0 sm:px-6">
                <div className="w-full max-w-full overflow-x-auto rounded-md border">
                    <Table className="min-w-[640px]">
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="h-9 px-3 text-xs">
                                    Item ID
                                </TableHead>
                                <TableHead className="h-9 px-3 text-xs">
                                    Description
                                </TableHead>
                                <TableHead className="h-9 px-3 text-xs">
                                    Model
                                </TableHead>
                                <TableHead className="h-9 px-3 text-xs">
                                    Serial
                                </TableHead>
                                <TableHead className="h-9 px-3 text-right text-xs">
                                    Discount
                                </TableHead>
                                <TableHead className="h-9 px-3 text-right text-xs">
                                    Amount
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transaction.order_items?.length ? (
                                transaction.order_items.map(
                                    (orderItem, index) => (
                                        <TableRow
                                            key={`${orderItem.item_id}-${index}`}
                                            className="hover:bg-muted/30"
                                        >
                                            <TableCell className="px-3 py-2 text-sm font-medium">
                                                {orderItem.item_id}
                                            </TableCell>
                                            <TableCell className="max-w-[220px] px-3 py-2 text-sm whitespace-normal">
                                                {orderItem.item?.description ||
                                                    'N/A'}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-sm whitespace-nowrap">
                                                {orderItem.item?.model || 'N/A'}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                                                {orderItem.serial}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-right text-sm whitespace-nowrap text-red-600">
                                                {orderItem.discount_amount
                                                    ? formatCurrency(
                                                          orderItem.discount_amount,
                                                      )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-right text-sm font-semibold whitespace-nowrap">
                                                {formatCurrency(
                                                    orderItem.sale_amount,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-6 text-center text-sm text-muted-foreground"
                                    >
                                        No items in this order
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
