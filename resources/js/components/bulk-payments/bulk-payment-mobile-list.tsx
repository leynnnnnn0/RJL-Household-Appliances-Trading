import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import {
    AmountDueField,
    AmountPaidField,
    InstallmentSelect,
    PaidDateField,
    PaymentMethodSelect,
    ReceiptNumberField,
    ReferenceNumberField,
} from './bulk-payment-fields';
import { BulkPaymentOrderPicker } from './bulk-payment-order-picker';

export function BulkPaymentMobileList(props: any) {
    const {
        rows,
        payments,
        openPopovers,
        setOpenPopovers,
        searchQuery,
        setSearchQuery,
        isSearching,
        searchResults,
        selectOrder,
        selectInstallment,
        updatePayment,
        removeRow,
        validationErrors,
    } = props;

    return (
        <div className="space-y-4 lg:hidden">
            {rows.map((row: any, index: number) => (
                <Card key={row.id}>
                    <CardContent className="space-y-4 pt-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold">
                                    Payment #{index + 1}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Search order and enter payment details
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRow(index)}
                                disabled={rows.length === 1}
                                className="h-9 w-9 shrink-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <Field label="Model / Customer">
                            <BulkPaymentOrderPicker
                                payment={payments[index]}
                                open={openPopovers[index]}
                                onOpenChange={(open) => {
                                    setOpenPopovers({
                                        ...openPopovers,
                                        [index]: open,
                                    });
                                    if (!open) {
                                        setSearchQuery('');
                                    }
                                }}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                isSearching={isSearching}
                                searchResults={searchResults}
                                onSelectOrder={(order) =>
                                    selectOrder(index, order)
                                }
                            />
                        </Field>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Installment">
                                <InstallmentSelect
                                    payment={payments[index]}
                                    onSelectInstallment={(value) =>
                                        selectInstallment(index, value)
                                    }
                                />
                            </Field>
                            <Field label="Amount Due">
                                <AmountDueField
                                    value={payments[index]?.amount_due}
                                />
                            </Field>
                            <Field label="Amount Paid *">
                                <AmountPaidField
                                    value={payments[index]?.amount_paid}
                                    hasError={
                                        !!validationErrors[index]?.amount_paid
                                    }
                                    onChange={(value) =>
                                        updatePayment(
                                            index,
                                            'amount_paid',
                                            value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Payment Method">
                                <PaymentMethodSelect
                                    value={
                                        payments[index]?.payment_method ||
                                        'cash'
                                    }
                                    onChange={(value) =>
                                        updatePayment(
                                            index,
                                            'payment_method',
                                            value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Reference #">
                                <ReferenceNumberField
                                    value={payments[index]?.reference_number}
                                    onChange={(value) =>
                                        updatePayment(
                                            index,
                                            'reference_number',
                                            value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Paid Date">
                                <PaidDateField
                                    value={payments[index]?.paid_date}
                                    onChange={(value) =>
                                        updatePayment(index, 'paid_date', value)
                                    }
                                />
                            </Field>
                            <Field label="Receipt # *">
                                <ReceiptNumberField
                                    value={
                                        payments[index]
                                            ?.collection_receipt_number
                                    }
                                    hasError={
                                        !!validationErrors[index]
                                            ?.collection_receipt_number
                                    }
                                    onChange={(value) =>
                                        updatePayment(
                                            index,
                                            'collection_receipt_number',
                                            value,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {children}
        </div>
    );
}
