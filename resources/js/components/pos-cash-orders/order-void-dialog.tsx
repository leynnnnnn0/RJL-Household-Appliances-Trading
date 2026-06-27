import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OrderWithrelations } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

type Props = {
    transaction: OrderWithrelations;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function OrderVoidDialog({ transaction, open, onOpenChange }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        reason_for_cancellation: '',
    });

    const canVoid = window.can('can void cash order') || transaction.is_void;

    const submit = () => {
        put(`/pos-cash-orders/void/${transaction.id}`, {
            onSuccess: () => {
                toast.success('Order Void');
                onOpenChange(false);
                reset();
            },
            onError: () => toast.error('An error occurred'),
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);
                if (!nextOpen) reset();
            }}
        >
            <DialogTrigger asChild>
                {canVoid && (
                    <Button
                        size="sm"
                        disabled={Boolean(transaction.is_void)}
                        variant="destructive"
                    >
                        {transaction.is_void ? 'Order Voided' : 'Void Order'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-500">
                        Are you absolutely sure?
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently void
                        the order.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                    <Label>
                        Reason for cancellation{' '}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        value={data.reason_for_cancellation}
                        onChange={(event) =>
                            setData(
                                'reason_for_cancellation',
                                event.target.value,
                            )
                        }
                        placeholder="Enter reason for voiding this order..."
                        rows={4}
                    />
                    {errors.reason_for_cancellation && (
                        <p className="text-sm text-destructive">
                            {errors.reason_for_cancellation}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={submit}
                        variant="destructive"
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : 'Void Order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
