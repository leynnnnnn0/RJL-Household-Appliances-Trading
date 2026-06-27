import { POSCashOrderFilters } from './types';

export const getTodayDate = () => new Date().toISOString().split('T')[0];

export const toNumber = (value: number | string | null | undefined) => {
    const numberValue = Number(value ?? 0);

    return Number.isFinite(numberValue) ? numberValue : 0;
};

export const formatCurrency = (amount: number | string | null | undefined) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(toNumber(amount));

export const formatShortDate = (date: string) =>
    new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

export const formatLongDate = (date: string) =>
    new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const buildCashOrderParams = (filters: POSCashOrderFilters) => {
    const params: Record<string, string> = {};

    if (filters.search) params.search = filters.search;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;
    if (filters.selectedLocation !== 'all') {
        params.location_id = filters.selectedLocation;
    }
    if (filters.selectedEmployee !== 'all') {
        params.employee_id = filters.selectedEmployee;
    }
    if (filters.selectedStatus !== 'all') {
        params.status = filters.selectedStatus;
    }

    return params;
};

export const buildCashOrderSearchParams = (filters: POSCashOrderFilters) =>
    new URLSearchParams(buildCashOrderParams(filters));
