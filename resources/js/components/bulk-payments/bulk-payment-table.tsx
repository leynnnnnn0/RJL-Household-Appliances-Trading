import { Button } from '@/components/ui/button';
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
import { BulkPaymentListProps } from './types';

export function BulkPaymentTable(props: BulkPaymentListProps) {
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
        <div className="hidden overflow-hidden rounded-lg border bg-card lg:block">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="w-8 px-2 py-3 text-left font-medium">
                                #
                            </th>
                            <th className="min-w-[220px] px-2 py-3 text-left font-medium">
                                Model / Customer
                            </th>
                            <th className="w-36 px-2 py-3 text-left font-medium">
                                Installment
                            </th>
                            <th className="w-28 px-2 py-3 text-left font-medium">
                                Amount Due
                            </th>
                            <th className="w-28 px-2 py-3 text-left font-medium">
                                Amount Paid *
                            </th>
                            <th className="w-36 px-2 py-3 text-left font-medium">
                                Payment Method
                            </th>
                            <th className="w-32 px-2 py-3 text-left font-medium">
                                Reference #
                            </th>
                            <th className="w-32 px-2 py-3 text-left font-medium">
                                Paid Date
                            </th>
                            <th className="w-32 px-2 py-3 text-left font-medium">
                                Receipt # *
                            </th>
                            <th className="w-16 px-2 py-3 text-center font-medium">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr
                                key={row.id}
                                className="border-b hover:bg-muted/50"
                            >
                                <td className="px-2 py-2 text-center text-muted-foreground">
                                    {index + 1}
                                </td>
                                <td className="px-2 py-2">
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
                                </td>
                                <td className="px-2 py-2">
                                    <InstallmentSelect
                                        payment={payments[index]}
                                        onSelectInstallment={(value) =>
                                            selectInstallment(index, value)
                                        }
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <AmountDueField
                                        value={payments[index]?.amount_due}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <AmountPaidField
                                        value={payments[index]?.amount_paid}
                                        hasError={
                                            !!validationErrors[index]
                                                ?.amount_paid
                                        }
                                        onChange={(value) =>
                                            updatePayment(
                                                index,
                                                'amount_paid',
                                                value,
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-2 py-2">
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
                                </td>
                                <td className="px-2 py-2">
                                    <ReferenceNumberField
                                        value={
                                            payments[index]?.reference_number
                                        }
                                        onChange={(value) =>
                                            updatePayment(
                                                index,
                                                'reference_number',
                                                value,
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <PaidDateField
                                        value={payments[index]?.paid_date}
                                        onChange={(value) =>
                                            updatePayment(
                                                index,
                                                'paid_date',
                                                value,
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-2 py-2">
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
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRow(index)}
                                        disabled={rows.length === 1}
                                        className="h-8 w-8"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
