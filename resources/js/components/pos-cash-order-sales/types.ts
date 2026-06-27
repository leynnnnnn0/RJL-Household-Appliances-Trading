import { Location } from '@/types';

export type SalesCategory = {
    name: string;
    sales: number | string;
    percentage: number | string;
    color: string;
};

export type SalesLocation = {
    id: number;
    name: string;
    revenue: number | string;
};

export type SalesFilters = {
    date_from: string;
    date_to: string;
    location_id: string;
};

export type SalesDashboardProps = {
    total_sales: number | string;
    total_expense: number | string;
    total_profit: number | string;
    sales_per_category: Record<string, SalesCategory>;
    sales_by_location: Record<string, SalesLocation>;
    locations: Location[];
    filters: SalesFilters;
};
