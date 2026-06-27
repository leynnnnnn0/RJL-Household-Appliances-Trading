import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { ItemCountBadge, StatusBadge } from './cash-orders-table';
import { formatCurrency, formatShortDate } from './formatters';
import { OrderEmptyState } from './order-empty-state';
import { POSCashOrderListProps } from './types';

export function CashOrdersMobileList({
    transactions,
    canViewDetails,
    onViewDetails,
}: POSCashOrderListProps) {
    return (
        <div className="space-y-4 lg:hidden">
            {transactions.length === 0 ? (
                <Card>
                    <CardContent className="py-10 sm:py-12">
                        <OrderEmptyState />
                    </CardContent>
                </Card>
            ) : (
                transactions.map((transaction) => (
                    <Card
                        key={transaction.order_number}
                        className="transition-shadow hover:shadow-md"
                    >
                        <CardContent className="pt-5 sm:pt-6">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-semibold break-words">
                                            Order #{transaction.order_number}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {formatShortDate(
                                                transaction.transaction_date,
                                            )}
                                        </p>
                                    </div>
                                    <StatusBadge isVoid={transaction.is_void} />
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                    <Detail label="Branch">
                                        {transaction.branch.name}
                                    </Detail>
                                    <Detail label="Employee">
                                        {transaction.employee.full_name}
                                    </Detail>
                                    <Detail label="Items">
                                        <ItemCountBadge
                                            count={
                                                transaction.order_items
                                                    ?.length || 0
                                            }
                                        />
                                    </Detail>
                                    <Detail label="Total Price">
                                        <span className="font-semibold">
                                            {formatCurrency(
                                                transaction.total_price,
                                            )}
                                        </span>
                                    </Detail>
                                </div>

                                {canViewDetails && (
                                    <div className="flex items-center gap-2 border-t pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() =>
                                                onViewDetails(
                                                    transaction.order_number,
                                                )
                                            }
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

function Detail({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0">
            <p className="mb-1 text-xs text-muted-foreground">{label}</p>
            <div className="font-medium break-words">{children}</div>
        </div>
    );
}
