import { CreditCard, Banknote, Receipt, Wallet } from 'lucide-react';

interface CollectionSummaryCardProps {
    expenses: number;
    netCollection: number;
    totalCashOnHand: number;
    totalOtherMop: number;
}

const currency = (value: number) => `₱${value.toLocaleString()}`;

export function CollectionSummaryCard({
    expenses,
    netCollection,
    totalCashOnHand,
    totalOtherMop,
}: CollectionSummaryCardProps) {
    const totals = [
        { label: 'Cash Payment', value: totalCashOnHand, icon: Banknote },
        { label: 'Other MOP', value: totalOtherMop, icon: CreditCard },
        { label: 'Total Collection', value: netCollection, icon: Receipt, emphasized: true },
    ];

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-xl sm:p-8">
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow">
                    <Wallet className="h-7 w-7 text-gray-700" />
                </div>
                <div>
                    <h2 className="text-xl font-bold sm:text-2xl">Total Collection Summary</h2>
                    <p className="text-sm text-gray-500">Comprehensive sales overview</p>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                {totals.map(({ label, value, icon: Icon, emphasized }) => (
                    <div
                        key={label}
                        className={`rounded-xl border border-gray-200 bg-white p-5 shadow transition-all hover:shadow-md sm:p-6 ${
                            emphasized ? 'md:shadow-lg' : ''
                        }`}
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-600">{label}</span>
                        </div>
                        <div className={`${emphasized ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-bold`}>
                            {currency(value)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-gray-600">Net Collection after Expenses</span>
                    <span className="text-lg font-semibold text-gray-800">{currency(netCollection - expenses)}</span>
                </div>
            </div>
        </section>
    );
}
