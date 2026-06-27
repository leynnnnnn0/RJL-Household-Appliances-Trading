import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function BulkPaymentConfirmationDialog({
    open,
    onOpenChange,
    paymentCount,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentCount: number;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Confirm Payment Submission
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to save {paymentCount} payment
                        {paymentCount > 1 ? 's' : ''}. This action cannot be
                        undone. Are you sure you want to proceed?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Confirm & Save
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
