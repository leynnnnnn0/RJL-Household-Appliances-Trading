import { Badge } from '@/components/ui/badge';
import { InstallmentOrderWithRelations } from '@/types';

export function CreditOrderStatusBadge({
    transaction,
}: {
    transaction: InstallmentOrderWithRelations;
}) {
    if (transaction.is_voided) {
        return <Badge variant="destructive">Voided</Badge>;
    }

    if (transaction.is_defaulted) {
        return (
            <Badge className="bg-orange-500 hover:bg-orange-600">
                Defaulted
            </Badge>
        );
    }

    if (transaction.is_completed) {
        return (
            <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
        );
    }

    return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
}
