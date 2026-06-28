import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { paymentMethods } from './payment-defaults';
import { BulkPaymentInstallment } from './types';

export function InstallmentSelect({
    payment,
    onSelectInstallment,
}: {
    payment: {
        selected_order: unknown;
        installment_order_payment_id: string;
        available_installments: BulkPaymentInstallment[];
    };
    onSelectInstallment: (value: string) => void;
}) {
    return (
        <Select
            value={payment?.installment_order_payment_id || ''}
            onValueChange={onSelectInstallment}
            disabled={!payment?.selected_order}
        >
            <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
                {payment?.available_installments?.map((installment) => {
                    const isPaid = installment.status?.toLowerCase() === 'paid';

                    return (
                        <SelectItem
                            key={installment.id}
                            value={installment.id}
                            className="text-xs"
                            disabled={isPaid}
                        >
                            {installment.due_date} - {installment.status}{' '}
                            {isPaid ? '(Paid)' : ''}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}

export function AmountDueField({ value }: { value: string }) {
    return (
        <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            disabled
            className="h-9 text-xs"
            value={value || ''}
            readOnly
        />
    );
}

export function AmountPaidField({
    value,
    hasError,
    onChange,
}: {
    value: string;
    hasError: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            className={`h-9 text-xs ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

export function PaymentMethodSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Select value={value || 'cash'} onValueChange={onChange}>
            <SelectTrigger className="h-9 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {paymentMethods.map((method) => (
                    <SelectItem
                        key={method.value}
                        value={method.value}
                        className="text-xs"
                    >
                        {method.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function ReferenceNumberField({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Input
            type="text"
            placeholder="REF-123"
            className="h-9 text-xs"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

export function PaidDateField({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Input
            type="date"
            className="h-9 text-xs"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

export function ReceiptNumberField({
    value,
    hasError,
    onChange,
}: {
    value: string;
    hasError: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <Input
            type="text"
            placeholder="CR-123"
            className={`h-9 text-xs ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}
