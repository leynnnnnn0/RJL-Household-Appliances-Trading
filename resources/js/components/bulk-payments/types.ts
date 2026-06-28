export interface BulkPaymentRow {
    id: number;
}

export interface BulkPaymentInstallment {
    id: string;
    status: string;
    due_date: string;
    amount_due: string;
}

export interface BulkPaymentOrder {
    id: number;
    order_number: string;
    customer: string;
    item_model: string;
    installment_payments?:
        | BulkPaymentInstallment[]
        | Record<string, Omit<BulkPaymentInstallment, 'id'>>;
}

export interface BulkPaymentForm {
    installment_order_id: string | number;
    installment_order_payment_id: string;
    installment_number: string;
    amount_due: string;
    amount_paid: string;
    payment_method: string;
    reference_number: string;
    paid_date: string;
    collection_receipt_number: string;
    selected_order: BulkPaymentOrder | null;
    available_installments: BulkPaymentInstallment[];
}

export type BulkPaymentField = keyof Pick<
    BulkPaymentForm,
    | 'amount_due'
    | 'amount_paid'
    | 'payment_method'
    | 'reference_number'
    | 'paid_date'
    | 'collection_receipt_number'
>;

export type BulkPaymentValidationErrors = Record<
    number,
    Partial<Record<'amount_paid' | 'collection_receipt_number', boolean>>
>;

export type BulkPaymentOpenPopovers = Record<number, boolean>;

export interface BulkPaymentListProps {
    rows: BulkPaymentRow[];
    payments: BulkPaymentForm[];
    openPopovers: BulkPaymentOpenPopovers;
    setOpenPopovers: (openPopovers: BulkPaymentOpenPopovers) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearching: boolean;
    searchResults: BulkPaymentOrder[];
    selectOrder: (index: number, order: BulkPaymentOrder) => void;
    selectInstallment: (index: number, installmentId: string) => void;
    updatePayment: (
        index: number,
        field: BulkPaymentField,
        value: string,
    ) => void;
    removeRow: (index: number) => void;
    validationErrors: BulkPaymentValidationErrors;
}
