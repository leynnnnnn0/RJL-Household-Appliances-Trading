import { formatCurrency } from '@/components/pos-credit/credit-calculations';
import type { Location, SelectedProduct } from '@/components/pos-credit/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

const PAYMENT_METHODS = [
    'Cash',
    'Gcash',
    'Bank Transfer',
    'Debit/Credit Card',
    'Home Credit/Skyro/Billease',
];

interface CheckoutDialogProps {
    open: boolean;
    locations: Location[];
    validationError: string;
    receiptNumber: string;
    transactionDate: string;
    selectedLocation: string;
    modeOfPayment: string;
    referenceNumber: string;
    downPayment: number;
    customerName: string;
    selectedProducts: SelectedProduct[];
    term: number;
    loanContractPrice: number;
    promisoryNoteValue: number;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onReceiptNumberChange: (value: string) => void;
    onTransactionDateChange: (value: string) => void;
    onSelectedLocationChange: (value: string) => void;
    onModeOfPaymentChange: (value: string) => void;
    onReferenceNumberChange: (value: string) => void;
    onClearValidationError: () => void;
    onSubmit: () => void;
}

export function CheckoutDialog({
    open,
    locations,
    validationError,
    receiptNumber,
    transactionDate,
    selectedLocation,
    modeOfPayment,
    referenceNumber,
    downPayment,
    customerName,
    selectedProducts,
    term,
    loanContractPrice,
    promisoryNoteValue,
    isSubmitting,
    onOpenChange,
    onReceiptNumberChange,
    onTransactionDateChange,
    onSelectedLocationChange,
    onModeOfPaymentChange,
    onReferenceNumberChange,
    onClearValidationError,
    onSubmit,
}: CheckoutDialogProps) {
    const [step, setStep] = useState<'form' | 'review'>('form');

    function handleOpenChange(open: boolean) {
        if (!open) setStep('form');
        onOpenChange(open);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Confirm Account Creation</DialogTitle>
                            <DialogDescription>
                                Please provide additional details to complete
                                the account setup
                            </DialogDescription>
                        </DialogHeader>

                        {validationError && (
                            <Alert variant="destructive" className="mb-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {validationError}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4 py-4">
                            <TextField
                                id="receiptNumber"
                                label="Receipt Number *"
                                placeholder="#000000923"
                                value={receiptNumber}
                                onChange={onReceiptNumberChange}
                            />

                            <TextField
                                id="transactionDate"
                                label="Transaction Date *"
                                type="date"
                                value={transactionDate}
                                onChange={onTransactionDateChange}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="location">Branch *</Label>
                                <Select
                                    value={selectedLocation}
                                    onValueChange={onSelectedLocationChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((location) => (
                                            <SelectItem
                                                key={location.id}
                                                value={location.id.toString()}
                                            >
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {downPayment > 0 ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="modeOfPayment">
                                            Mode of Payment *
                                        </Label>
                                        <Select
                                            value={modeOfPayment}
                                            onValueChange={
                                                onModeOfPaymentChange
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PAYMENT_METHODS.map(
                                                    (method) => (
                                                        <SelectItem
                                                            key={method}
                                                            value={method}
                                                        >
                                                            {method}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Down payment: ₱
                                            {formatCurrency(downPayment)}
                                        </p>
                                    </div>

                                    {modeOfPayment &&
                                        modeOfPayment !== 'Cash' && (
                                            <TextField
                                                id="referenceNumber"
                                                label="Reference Number *"
                                                placeholder="Enter reference/transaction number"
                                                value={referenceNumber}
                                                onChange={
                                                    onReferenceNumberChange
                                                }
                                            />
                                        )}
                                </>
                            ) : (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        No down payment — payment details not
                                        required
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    handleOpenChange(false);
                                    onClearValidationError();
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => setStep('review')}
                                disabled={isSubmitting}
                            >
                                Review Account
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Account Review</DialogTitle>
                            <DialogDescription>
                                Double-check the customer, payment terms, and
                                selected items before creating the account.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                                <Label className="text-xs tracking-wide text-muted-foreground uppercase">
                                    Account Details
                                </Label>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <ReviewLine
                                        label="Customer"
                                        value={customerName || 'N/A'}
                                    />
                                    <ReviewLine
                                        label="Receipt"
                                        value={
                                            receiptNumber || 'Not yet entered'
                                        }
                                    />
                                    <ReviewLine
                                        label="Term"
                                        value={`${term} months`}
                                    />
                                    <ReviewLine
                                        label="Down Payment"
                                        value={`₱${formatCurrency(downPayment)}`}
                                    />
                                    <ReviewLine
                                        label="Loan Contract Price"
                                        value={`₱${formatCurrency(loanContractPrice)}`}
                                    />
                                    <ReviewLine
                                        label="Promissory Note Value"
                                        value={`₱${formatCurrency(promisoryNoteValue)}`}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="text-xs tracking-wide text-muted-foreground uppercase">
                                    Selected Items ({selectedProducts.length})
                                </Label>
                                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border bg-muted/20 p-3">
                                    {selectedProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-start justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm shadow-sm"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {product.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.model} ·{' '}
                                                    {product.serial}
                                                </p>
                                            </div>
                                            <p className="shrink-0 font-semibold">
                                                {product.isFree
                                                    ? 'Free'
                                                    : `₱${formatCurrency(product.srp)}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setStep('form')}
                                disabled={isSubmitting}
                            >
                                Back
                            </Button>
                            <Button onClick={onSubmit} disabled={isSubmitting}>
                                {isSubmitting
                                    ? 'Creating...'
                                    : 'Confirm & Create'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-3 rounded-md bg-white px-3 py-2 shadow-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function TextField({
    id,
    label,
    placeholder,
    value,
    type = 'text',
    onChange,
}: {
    id: string;
    label: string;
    placeholder?: string;
    value: string;
    type?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            {type === 'date' ? (
                <DatePicker id={id} value={value} onChange={onChange} />
            ) : (
                <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
        </div>
    );
}
