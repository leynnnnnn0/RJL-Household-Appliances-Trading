export interface LocationOption {
    id: number;
    name: string;
}

export interface CreditSalesFilters {
    date_from: string;
    date_to: string;
    item_type: string;
    location_id: string | number;
}

export interface PortfolioSummary {
    total_pnv: number;
    total_active_pnv: number;
    total_completed_pnv: number;
    total_defaulted_pnv: number;
    active_accounts: number;
    completed_accounts: number;
    defaulted_accounts: number;
    total_accounts: number;
    total_lcp: number;
    total_down_payment: number;
    collectible_balance: number;
    defaulted_balance: number;
    total_remaining_balance: number;
    total_rebate: number;
    total_advanced_payment: number;
}

export interface PeriodPerformance {
    date_from: string;
    date_to: string;
    expected: number;
    actual_collected: number;
    uncollected: number;
    collection_rate: number;
    target_rate: number;
    variance: number;
    overall_collection_rate: number;
}

export interface AgingBuckets {
    current: number;
    '30_days': number;
    '60_days': number;
    '90_days': number;
    '90_plus_days': number;
    total: number;
}

export interface ItemTypeSummary {
    count: number;
    pnv: number;
    expected: number;
    collected: number;
    balance: number;
}

export interface CreditSalesDashboardProps {
    filters: CreditSalesFilters;
    locations: LocationOption[];
    portfolio: PortfolioSummary;
    period: PeriodPerformance;
    receivables: AgingBuckets;
    collections: AgingBuckets;
    by_item_type: {
        furniture: ItemTypeSummary;
        appliances: ItemTypeSummary;
        gadgets: ItemTypeSummary;
    };
    monthly_trend: { month: string; expected: number; collected: number }[];
}

export type ItemTypeKey = keyof CreditSalesDashboardProps['by_item_type'];
