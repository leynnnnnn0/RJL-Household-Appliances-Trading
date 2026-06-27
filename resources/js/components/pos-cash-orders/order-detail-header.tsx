import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderWithrelations } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { formatLongDate } from './formatters';
import { OrderVoidDialog } from './order-void-dialog';

type Props = {
    transaction: OrderWithrelations;
    previousUrl: string;
    isVoidDialogOpen: boolean;
    onVoidDialogOpenChange: (open: boolean) => void;
};

export function OrderDetailHeader({
    transaction,
    previousUrl,
    isVoidDialogOpen,
    onVoidDialogOpenChange,
}: Props) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight break-words">
                        Order #{transaction.order_number}
                    </h1>
                    {transaction.is_void && (
                        <Badge variant="destructive" className="h-5">
                            VOIDED
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    {formatLongDate(transaction.transaction_date)}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={previousUrl}>
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Back
                    </Link>
                </Button>

                <OrderVoidDialog
                    transaction={transaction}
                    open={isVoidDialogOpen}
                    onOpenChange={onVoidDialogOpenChange}
                />
            </div>
        </div>
    );
}
