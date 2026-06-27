export const expenseCategoryOptions = [
    { value: 'fuel', label: 'Fuel' },
    { value: 'repair', label: 'Repair' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'meal', label: 'Meal' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' },
];

export const expenseStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

export const expensePaymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'e_wallet', label: 'E-Wallet' },
];

export function expenseStatusColor(status: string): string {
    return (
        {
            approved: 'bg-green-100 text-green-800 hover:bg-green-100',
            rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
            pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        }[status] ?? 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    );
}

export function expenseCategoryColor(category: string): string {
    return (
        {
            fuel: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            repair: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
            supplies: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
            meal: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
            emergency: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
            other: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
        }[category] ?? 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    );
}

export function formatExpenseCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

export function formatExpenseDate(date: string): string {
    return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatExpenseLabel(value: string): string {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}
