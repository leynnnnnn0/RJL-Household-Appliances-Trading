import { SalesCategory, SalesLocation } from './types';

export const toNumber = (value: number | string | null | undefined) => {
    const numberValue = Number(value ?? 0);

    return Number.isFinite(numberValue) ? numberValue : 0;
};

export const formatCurrency = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(toNumber(value));

export const toCategoryChartData = (
    categories: Record<string, SalesCategory>,
) =>
    Object.values(categories).map((category) => ({
        name: category.name,
        value: toNumber(category.percentage),
        color: category.color,
        sales: toNumber(category.sales),
    }));

export const toLocationChartData = (locations: Record<string, SalesLocation>) =>
    Object.values(locations).map((location) => ({
        id: location.id,
        location: location.name,
        revenue: toNumber(location.revenue),
    }));
