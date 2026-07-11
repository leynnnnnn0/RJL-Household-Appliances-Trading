export type SalesBucketKey = 'current' | '1_30' | '31_60' | '61_90' | '90_plus';

export interface SalesFilters {
    month: string;
    branch_id: string;
    item_type: string;
    as_of_date: string;
    cutoff_start: string;
    collector_id: string;
    search: string;
}

export interface SalesBranch {
    id: number;
    name: string;
}

export interface SalesCollector {
    id: number;
    name: string;
}

export interface AgingBucketStatistic {
    label: string;
    accounts: number;
    paid_accounts: number;
    unpaid_accounts: number;
    account_percentage: number;
    expected_amount: number;
    collected_amount: number;
    outstanding_amount: number;
    collection_percentage: number;
}

export interface AgingStatistics {
    cutoff: { start: string; end: string };
    accounts: { total: number; fully_paid: number; outstanding: number };
    aging_distribution: Record<
        'current' | '30_days' | '60_days' | '90_plus',
        AgingBucketStatistic
    >;
    collection_summary: {
        expected_amount: number;
        collected_amount: number;
        outstanding_amount: number;
        collection_percentage: number;
    };
    advance_payments: { count: number; amount: number };
    rebates: { count: number; amount: number };
    revenue: { without_advance: number; including_advance: number };
}

export interface AgingRow {
    order_id: number;
    order_number: string;
    customer_name: string;
    address: string;
    branch: string;
    item_type: string;
    model: string;
    term: number;
    date_released: string;
    due_date: string;
    days_overdue: number;
    bucket: SalesBucketKey;
    monthly_installment: number;
    pnv: number;
    amount_due: number;
    amount_paid: number;
    remaining_balance: number;
    installments_count: number;
    is_paid: boolean;
    is_final_payment_paid: boolean;
}

export interface AgingTableData {
    label: string;
    total_accounts: number;
    total_due: number;
    total_paid: number;
    total_balance: number;
    rows: AgingRow[];
}

export interface NewReleaseRow {
    order_id: number;
    order_number: string;
    customer_name: string;
    branch: string;
    item_type: string;
    model: string;
    term: number;
    transaction_date: string;
    pnv: number;
}

export interface NewReleasesTableData {
    total_accounts: number;
    total_pnv: number;
    rows: NewReleaseRow[];
}

export interface SalesAnalytics {
    monthly_trend: {
        month: string;
        accounts: number;
        sales: number;
        collections: number;
    }[];
    category_sales: { type: string; sales: number; units: number }[];
    insights: {
        best_month?: {
            month: string;
            accounts: number;
            sales: number;
            collections: number;
        };
        worst_month?: {
            month: string;
            accounts: number;
            sales: number;
            collections: number;
        };
        top_category?: { type: string; sales: number; units: number };
    };
}

export interface SalesIndexProps {
    filters: SalesFilters;
    branches: SalesBranch[];
    summary: {
        accounts: number;
        active_accounts: number;
        pnv: number;
        remaining_balance: number;
        risk_balance: number;
        collection_rate: number;
    };
    analytics: SalesAnalytics;
}
