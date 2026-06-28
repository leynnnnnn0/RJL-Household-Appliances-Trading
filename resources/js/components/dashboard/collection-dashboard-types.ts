export interface DashboardTransaction {
    date: string;
    receipt_number: string;
    customer: string;
    m_i: number | null;
    d_p: number | null;
    amount_paid: number | null;
    payment_method: string;
    reference_number?: string;
    is_voided: boolean;
    remarks: string;
    employee_name?: string;
}

export interface DashboardBranchOption {
    id: number;
    name?: string;
    full_name?: string;
}

export interface DashboardFilters {
    from_date: string;
    to_date: string;
    employee_id: string | null;
}
