import type { SalesFilters } from './types';

export const formatPeso = (value: number | string | null | undefined) =>
    `₱${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const compactPeso = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `₱${(value / 1_000).toFixed(0)}k`;

    return `₱${value}`;
};

export const salesQueryString = (filters: SalesFilters, extra: Record<string, string> = {}) => {
    const params = new URLSearchParams({
        month: filters.month,
        as_of_date: filters.as_of_date,
        branch_id: filters.branch_id,
        item_type: filters.item_type,
        search: filters.search || '',
        ...extra,
    });

    return params.toString();
};
