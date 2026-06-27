export const formatPeso = (amount: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    }).format(amount);

export const formatPercent = (amount: number) => `${amount.toFixed(1)}%`;

export const compactPeso = (amount: number) =>
    `₱${(amount / 1000).toFixed(0)}k`;

export const chartColors = {
    active: '#111827',
    completed: '#16a34a',
    defaulted: '#dc2626',
    expected: '#6b7280',
    collected: '#111827',
    furniture: '#7c3aed',
    appliances: '#0891b2',
    gadgets: '#d97706',
    aging: ['#111827', '#f59e0b', '#dc2626', '#b91c1c', '#7f1d1d'],
};
