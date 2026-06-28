import { formatCurrency } from '@/components/pos-credit/credit-calculations';
import type { Location } from '@/components/pos-credit/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Account Creation</DialogTitle>
                    <DialogDescription>
                        Please provide additional details to complete the
                        account setup
                    </DialogDescription>
                </DialogHeader>

                {validationError && (
                    <Alert variant="destructive" className="mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{validationError}</AlertDescription>
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
                                    onValueChange={onModeOfPaymentChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHODS.map((method) => (
                                            <SelectItem
                                                key={method}
                                                value={method}
                                            >
                                                {method}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Down payment: ₱{formatCurrency(downPayment)}
                                </p>
                            </div>

                            {modeOfPayment && modeOfPayment !== 'Cash' && (
                                <TextField
                                    id="referenceNumber"
                                    label="Reference Number *"
                                    placeholder="Enter reference/transaction number"
                                    value={referenceNumber}
                                    onChange={onReferenceNumberChange}
                                />
                            )}
                        </>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                No down payment - payment details not required
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            onClearValidationError();
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Confirm & Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
