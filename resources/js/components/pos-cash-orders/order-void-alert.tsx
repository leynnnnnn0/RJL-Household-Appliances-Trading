import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrderWithrelations } from '@/types';
import { AlertCircle } from 'lucide-react';
import { formatLongDate } from './formatters';

export function OrderVoidAlert({
    transaction,
}: {
    transaction: OrderWithrelations;
}) {
    if (!transaction.is_void) return null;

    return (
        <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
                <span className="font-semibold">
                    This order has been voided
                </span>{' '}
                on{' '}
                {transaction.void_date
                    ? formatLongDate(transaction.void_date)
                    : 'N/A'}
                {transaction.reason_for_cancellation &&
                    ` - ${transaction.reason_for_cancellation}`}
            </AlertDescription>
        </Alert>
    );
}
