export const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'gcash', label: 'GCash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
];

export function createEmptyPayment(): BulkPaymentForm {
    return {
        installment_order_id: '',
        installment_order_payment_id: '',
        installment_number: '',
        amount_due: '',
        amount_paid: '',
        payment_method: 'cash',
        reference_number: '',
        paid_date: new Date().toISOString().split('T')[0],
        collection_receipt_number: '',
        selected_order: null,
        available_installments: [],
    };
}
import { BulkPaymentForm } from './types';
