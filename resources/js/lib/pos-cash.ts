import { User } from '@/types';

export interface POSCashProduct {
    id: string | number;
    supplier: string;
    description: string;
    serial: string;
    model: string;
    srp: number;
    unit_cost: string;
}

export interface POSCashCartItem {
    id: string;
    product: POSCashProduct;
    employee: User;
    saleAmount: number;
    timestamp: string;
    date: string;
}

export interface POSCashCustomerForm {
    existing_customer_id: string | number | null;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    province: string;
    zipcode: string;
    country: string;
    email: string;
    phone: string;
    payment_method: string;
    reference_number: string;
    receipt_number: string;
}

export interface POSCashPayment {
    payment_method: string;
    amount: number;
    reference_number: string;
}

export const posCashPaymentMethods = [
    'Cash',
    'Gcash',
    'Bank Transfer',
    'Debit/Credit Card',
    'Home Credit/Skyro/Billease',
];

export function emptyPOSCashCustomerForm(): POSCashCustomerForm {
    return {
        existing_customer_id: null,
        first_name: '',
        last_name: '',
        address: '',
        city: '',
        province: '',
        zipcode: '',
        country: 'PHILIPPINES',
        email: '',
        phone: '',
        payment_method: 'Cash',
        reference_number: '',
        receipt_number: '',
    };
}

export function formatPOSCashCurrency(
    value: number | string | null | undefined,
) {
    return `₱${Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
    })}`;
}

export function posCashOrderTotal(orders: POSCashCartItem[]) {
    return orders.reduce((sum, order) => sum + Number(order.saleAmount), 0);
}
