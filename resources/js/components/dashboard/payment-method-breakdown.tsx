import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentMethodBreakdownProps {
    methods: Record<string, number>;
}

export function PaymentMethodBreakdown({ methods }: PaymentMethodBreakdownProps) {
    const entries = Object.entries(methods);

    return (
        <Card className="rounded-2xl border-slate-200 shadow-lg">
            <CardHeader className="rounded-t-2xl">
                <CardTitle className="text-lg font-bold text-slate-900">Payment Method Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {entries.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {entries.map(([method, amount]) => (
                            <div
                                key={method}
                                className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 transition-all duration-200 hover:shadow-md"
                            >
                                <Badge variant="outline" className="mb-3 border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700">
                                    {method}
                                </Badge>
                                <div className="text-2xl font-bold text-slate-900">₱{amount.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-8 text-center text-sm text-slate-500">No payment methods found for the selected filters.</p>
                )}
            </CardContent>
        </Card>
    );
}
