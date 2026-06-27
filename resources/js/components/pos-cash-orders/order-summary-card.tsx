import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderWithrelations } from '@/types';
import { formatCurrency, toNumber } from './formatters';

export function OrderSummaryCard({
    transaction,
}: {
    transaction: OrderWithrelations;
}) {
    const totalDiscount =
        transaction.order_items?.reduce(
            (sum, item) => sum + toNumber(item.discount_amount),
            0,
        ) || 0;
    const totalPrice = toNumber(transaction.total_price);

    return (
        <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                <div className="space-y-2">
                    <SummaryRow
                        label="Items"
                        value={transaction.order_items?.length || 0}
                    />

                    {totalDiscount > 0 && (
                        <>
                            <SummaryRow
                                label="Subtotal"
                                value={formatCurrency(
                                    totalPrice + totalDiscount,
                                )}
                            />
                            <SummaryRow
                                label="Discount"
                                value={`-${formatCurrency(totalDiscount)}`}
                                className="text-red-600"
                            />
                        </>
                    )}
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4 pt-1">
                    <span className="font-semibold">Total</span>
                    <span className="text-right text-2xl font-bold break-words">
                        {formatCurrency(totalPrice)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function SummaryRow({
    label,
    value,
    className = '',
}: {
    label: string;
    value: string | number;
    className?: string;
}) {
    return (
        <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className={`text-right font-medium break-words ${className}`}>
                {value}
            </span>
        </div>
    );
}
