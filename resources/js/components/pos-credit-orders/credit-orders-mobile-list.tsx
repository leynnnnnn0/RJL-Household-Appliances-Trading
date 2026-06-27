import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { CreditOrderEmptyState } from './credit-order-empty-state';
import { CreditOrderStatusBadge } from './credit-order-status-badge';
import {
    formatCurrency,
    formatShortDate,
    remainingBalance,
} from './formatters';
import { POSCreditOrderListProps } from './types';

export function CreditOrdersMobileList({
    transactions,
    canViewDetails,
    onViewDetails,
}: POSCreditOrderListProps) {
    return (
        <div className="space-y-4 lg:hidden">
            {transactions.length === 0 ? (
                <Card>
                    <CardContent className="py-10 sm:py-12">
                        <CreditOrderEmptyState />
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
                                            {transaction.customer.full_name}
                                        </h3>
                                        <p className="text-sm break-words text-muted-foreground">
                                            Order #{transaction.order_number}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatShortDate(
                                                transaction.transaction_date,
                                            )}
                                        </p>
                                    </div>
                                    <CreditOrderStatusBadge
                                        transaction={transaction}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                    <Detail label="No. of Terms">
                                        {transaction.number_of_terms} months
                                    </Detail>
                                    <Detail label="Total PNV">
                                        {formatCurrency(transaction.total_pnv)}
                                    </Detail>
                                    <Detail label="Monthly">
                                        {formatCurrency(
                                            transaction.monthly_payment,
                                        )}
                                    </Detail>
                                    <Detail label="Remaining Balance">
                                        <span className="font-semibold">
                                            {formatCurrency(
                                                remainingBalance(
                                                    transaction.remaining_balance,
                                                ),
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
