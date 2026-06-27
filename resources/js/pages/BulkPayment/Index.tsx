import { BulkPaymentActions } from '@/components/bulk-payments/bulk-payment-actions';
import { BulkPaymentConfirmationDialog } from '@/components/bulk-payments/bulk-payment-confirmation-dialog';
import { BulkPaymentMobileList } from '@/components/bulk-payments/bulk-payment-mobile-list';
import { BulkPaymentTable } from '@/components/bulk-payments/bulk-payment-table';
import { createEmptyPayment } from '@/components/bulk-payments/payment-defaults';
import ModuleHeading from '@/components/cards/module-heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function BulkPayments() {
    const [rows, setRows] = useState([{ id: 1 }]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [openPopovers, setOpenPopovers] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const [payments, setPayments] = useState([createEmptyPayment()]);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            axios
                .get(`/api/installment-orders?search=${searchQuery}`)
                .then((res) => {
                    setSearchResults(res.data.data || []);
                })
                .catch((err) => {
                    console.error('Search error:', err);
                    setSearchResults([]);
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const addRow = () => {
        const newId =
            rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
        setRows([...rows, { id: newId }]);
        setPayments([...payments, createEmptyPayment()]);
    };

    const removeRow = (index) => {
        if (rows.length === 1) return;
        const newRows = rows.filter((_, i) => i !== index);
        const newPayments = payments.filter((_, i) => i !== index);
        setRows(newRows);
        setPayments(newPayments);

        // Clear validation errors for removed row
        const newErrors = { ...validationErrors };
        delete newErrors[index];
        // Reindex remaining errors
        const reindexedErrors = {};
        Object.keys(newErrors).forEach((key) => {
            const idx = parseInt(key);
            if (idx > index) {
                reindexedErrors[idx - 1] = newErrors[key];
            } else {
                reindexedErrors[idx] = newErrors[key];
            }
        });
        setValidationErrors(reindexedErrors);
    };

    const selectOrder = (index, order) => {
        const newPayments = [...payments];

        // Handle installment_payments whether it's an object or array
        let installments = [];
        if (order.installment_payments) {
            if (Array.isArray(order.installment_payments)) {
                installments = order.installment_payments;
            } else {
                // Convert object to array
                installments = Object.entries(order.installment_payments).map(
                    ([id, details]) => ({
                        id,
                        ...details,
                    }),
                );
            }
        }

        newPayments[index] = {
            ...newPayments[index],
            installment_order_id: order.id,
            selected_order: order,
            available_installments: installments,
            installment_order_payment_id: '',
            installment_number: '',
            amount_due: '',
        };

        setPayments(newPayments);
        setOpenPopovers({ ...openPopovers, [index]: false });
        setSearchQuery(''); // Reset search query after selection
    };

    const selectInstallment = (index, installmentId) => {
        const newPayments = [...payments];
        const currentOrderId = newPayments[index].installment_order_id;

        // Check if this installment is already selected for the same order
        const isDuplicate = newPayments.some(
            (payment, idx) =>
                idx !== index &&
                payment.installment_order_id === currentOrderId &&
                payment.installment_order_payment_id === installmentId,
        );

        if (isDuplicate) {
            toast.error(
                'This installment has already been selected for this customer in another row.',
            );
            return;
        }

        const selectedInstallment = newPayments[
            index
        ].available_installments.find((inst) => inst.id === installmentId);

        if (selectedInstallment) {
            // Check if installment is already paid
            if (selectedInstallment.status?.toLowerCase() === 'paid') {
                toast.error(
                    'This installment has already been paid and cannot be selected.',
                );
                return;
            }

            const installmentNumber =
                newPayments[index].available_installments.findIndex(
                    (inst) => inst.id === installmentId,
                ) + 1;

            // Check sequence - all previous installments must be paid or selected
            const allInstallments = newPayments[index].available_installments;
            const currentOrderPayments = newPayments.filter(
                (p) => p.installment_order_id === currentOrderId,
            );

            for (let i = 0; i < installmentNumber - 1; i++) {
                const prevInstallment = allInstallments[i];
                const isPaid = prevInstallment.status?.toLowerCase() === 'paid';
                const isSelected = currentOrderPayments.some(
                    (p) =>
                        p.installment_order_payment_id === prevInstallment.id,
                );

                if (!isPaid && !isSelected) {
                    toast.error(
                        `You must select installment #${i + 1} before selecting #${installmentNumber}.`,
                    );
                    return;
                }
            }

            newPayments[index] = {
                ...newPayments[index],
                installment_order_payment_id: installmentId,
                installment_number: installmentNumber.toString(),
                amount_due: selectedInstallment.amount_due,
                amount_paid: selectedInstallment.amount_due,
            };

            setPayments(newPayments);
        }
    };

    const updatePayment = (index, field, value) => {
        const newPayments = [...payments];
        newPayments[index][field] = value;
        setPayments(newPayments);

        // Clear validation error when user starts typing
        if (validationErrors[index]?.[field]) {
            const newErrors = { ...validationErrors };
            delete newErrors[index][field];
            if (Object.keys(newErrors[index] || {}).length === 0) {
                delete newErrors[index];
            }
            setValidationErrors(newErrors);
        }
    };

    const validatePayments = () => {
        const errors = {};
        let isValid = true;

        payments.forEach((payment, index) => {
            const rowErrors = {};

            // Validate amount paid
            if (!payment.amount_paid || parseFloat(payment.amount_paid) <= 0) {
                rowErrors.amount_paid = true;
                isValid = false;
            }

            // Validate receipt number
            if (
                !payment.collection_receipt_number ||
                payment.collection_receipt_number.trim() === ''
            ) {
                rowErrors.collection_receipt_number = true;
                isValid = false;
            }

            if (Object.keys(rowErrors).length > 0) {
                errors[index] = rowErrors;
            }
        });

        setValidationErrors(errors);
        return isValid;
    };

    const handleSubmit = async () => {
        // Validate all required fields
        if (!validatePayments()) {
            toast.error(
                'Please fill in all required fields (Amount Paid and Receipt #).',
            );
            return;
        }

        // Check if all payments have order and installment selected
        const validPayments = payments.filter(
            (p) =>
                p.installment_order_id &&
                p.installment_order_payment_id &&
                p.amount_paid,
        );

        if (validPayments.length !== payments.length) {
            toast.error(
                'Please make sure that all rows have order and installment selected.',
            );
            return;
        }

        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);
        setProcessing(true);

        router.post(
            route('bulk-payments.store'),
            {
                payments: payments,
            },
            {
                onSuccess: () => {
                    toast.success('Payments Recorded Successfully.');
                    resetForm();
                },
                onError: (e) => {
                    console.error('Submission error:', e);
                    toast.error('Failed to save payments. Please try again.');
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const resetForm = () => {
        setRows([{ id: 1 }]);
        setPayments([createEmptyPayment()]);
        setSearchQuery('');
        setSearchResults([]);
        setValidationErrors({});
    };

    return (
        <AppLayout>
            <Head title="Bulk Payments" />
            <ModuleHeading
                title="Bulk Payments"
                description="Process multiple installment payments at once"
            />

            <div className="min-h-screen bg-background">
                <div className="space-y-6">
                    {/* Instructions */}
                    <Alert>
                        <AlertDescription className="text-xs">
                            <strong>Instructions:</strong> Search for an order
                            or customer, select the installment number, and fill
                            in the payment details. You can add multiple
                            payments at once.
                        </AlertDescription>
                    </Alert>

                    <div className="overflow-hidden rounded-lg border bg-card">
                        <BulkPaymentTable
                            rows={rows}
                            payments={payments}
                            openPopovers={openPopovers}
                            setOpenPopovers={setOpenPopovers}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            isSearching={isSearching}
                            searchResults={searchResults}
                            selectOrder={selectOrder}
                            selectInstallment={selectInstallment}
                            updatePayment={updatePayment}
                            removeRow={removeRow}
                            validationErrors={validationErrors}
                        />
                        <div className="p-4 lg:hidden">
                            <BulkPaymentMobileList
                                rows={rows}
                                payments={payments}
                                openPopovers={openPopovers}
                                setOpenPopovers={setOpenPopovers}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                isSearching={isSearching}
                                searchResults={searchResults}
                                selectOrder={selectOrder}
                                selectInstallment={selectInstallment}
                                updatePayment={updatePayment}
                                removeRow={removeRow}
                                validationErrors={validationErrors}
                            />
                        </div>
                        <BulkPaymentActions
                            onAddRow={addRow}
                            onReset={resetForm}
                            onSubmit={handleSubmit}
                            processing={processing}
                        />
                    </div>
                </div>
            </div>

            <BulkPaymentConfirmationDialog
                open={showConfirmModal}
                onOpenChange={setShowConfirmModal}
                paymentCount={payments.length}
                onConfirm={confirmSubmit}
            />
        </AppLayout>
    );
}
