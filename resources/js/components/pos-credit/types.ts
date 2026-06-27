import type { CustomerReference, InvenstigationDetail } from '@/types';

export interface Customer {
    id: string;
    first_name: string;
    last_name: string;
    address: string;
    phone_number: string;
    source_of_income?: string;
    monthly_income?: string;
    reference?: CustomerReference;
    investigation_detail?: InvenstigationDetail;
    email: string | null;
    zipcode: string | null;
    country: string | null;
    province: string | null;
    city: string | null;
}

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    file: File;
}

export interface Product {
    id: string;
    supplier: string;
    description: string;
    serial: string;
    model: string;
    srp: number;
    unit_cost: string;
    item_type: 'furniture' | 'gadgets' | 'appliances';
}

export interface SelectedProduct extends Product {
    downPayment: number;
    selectedTerm: number;
    noDownPayment?: boolean;
    isFree: boolean;
}

export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
}

export interface Location {
    id: number;
    name: string;
    address: string;
    remarks: string | null;
}

export interface TransactionSummary {
    order_number: string;
    customer: string;
    term: string;
}
