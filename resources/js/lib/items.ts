export const itemTypeOptions = [
    { value: 'appliances', label: 'Appliances' },
    { value: 'gadgets', label: 'Gadgets' },
    { value: 'furniture', label: 'Furniture' },
];

export function formatItemCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

export function formatItemDate(dateString?: string | null): string {
    if (!dateString) {
        return 'N/A';
    }

    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatLongItemDate(dateString?: string | null): string {
    if (!dateString) {
        return 'N/A';
    }

    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
