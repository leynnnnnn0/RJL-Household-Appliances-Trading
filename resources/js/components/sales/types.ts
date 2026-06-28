export type SalesBucketKey = 'current' | '1_30' | '31_60' | '61_90' | '90_plus';

export interface SalesFilters {
    month: string;
    branch_id: string;
    item_type: string;
    as_of_date: string;
    search: string;
}

export interface SalesBranch {
    id: number;
    name: string;
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
}

export interface AgingTableData {
    label: string;
    total_accounts: number;
    total_due: number;
    total_paid: number;
    total_balance: number;
    rows: AgingRow[];
}

export interface SalesAnalytics {
    monthly_trend: { month: string; accounts: number; sales: number; collections: number }[];
    category_sales: { type: string; sales: number; units: number }[];
    insights: {
        best_month?: { month: string; accounts: number; sales: number; collections: number };
        worst_month?: { month: string; accounts: number; sales: number; collections: number };
        top_category?: { type: string; sales: number; units: number };
    };
}

export interface SalesIndexProps {
    filters: SalesFilters;
    branches: SalesBranch[];
    bucketLabels: Record<SalesBucketKey, string>;
    summary: {
        accounts: number;
        active_accounts: number;
        pnv: number;
        remaining_balance: number;
        risk_balance: number;
        collection_rate: number;
    };
    agingTables: Record<SalesBucketKey, AgingTableData>;
    analytics: SalesAnalytics;
}
