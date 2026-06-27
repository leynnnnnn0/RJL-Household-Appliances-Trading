import { Button } from '@/components/ui/button';
import { Loader2, Plus, Save } from 'lucide-react';

export function BulkPaymentActions({
    onAddRow,
    onReset,
    onSubmit,
    processing,
}: {
    onAddRow: () => void;
    onReset: () => void;
    onSubmit: () => void;
    processing: boolean;
}) {
    return (
        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddRow}
                className="w-full sm:w-auto"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Row
            </Button>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="w-full sm:w-auto"
                >
                    Reset
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={onSubmit}
                    disabled={processing}
                    className="w-full sm:w-auto"
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Payments
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
