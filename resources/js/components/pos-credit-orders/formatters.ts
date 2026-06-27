import { POSCreditOrderFilters } from './types';

export const toNumber = (value: number | string | null | undefined) => {
    const numberValue = Number(value ?? 0);

    return Number.isFinite(numberValue) ? numberValue : 0;
};

export const formatCurrency = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(toNumber(value));

export const formatShortDate = (date: string) =>
    new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

export const remainingBalance = (value: number | string | null | undefined) => {
    const balance = toNumber(value);

    return balance > 1 ? balance : 0;
};

export const buildCreditOrderParams = (filters: POSCreditOrderFilters) => {
    const params: Record<string, string> = {};

    if (filters.search) params.search = filters.search;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;
    if (filters.selectedLocation !== 'all') {
        params.location_id = filters.selectedLocation;
    }
    if (filters.selectedStatus !== 'all') {
        params.status = filters.selectedStatus;
    }
    if (filters.selectedItemType !== 'all') {
        params.item_type = filters.selectedItemType;
    }
    if (filters.advancedFilter !== 'all') {
        params.advanced_filter = filters.advancedFilter;
    }

    return params;
};
