import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderWithrelations } from '@/types';
import { CreditCard, Home, MapPin, Phone, Receipt, User } from 'lucide-react';
import type { ReactNode } from 'react';

export function OrderInfoCard({
    transaction,
}: {
    transaction: OrderWithrelations;
}) {
    const customerName = transaction.customer
        ? `${transaction.customer.first_name} ${transaction.customer.last_name}`
        : 'N/A';

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
                    <div className="space-y-3">
                        <InfoRow
                            icon={<CreditCard />}
                            label="Payment Method"
                            value={formatPaymentMethod(transaction)}
                        />
                        <InfoRow
                            icon={<Receipt />}
                            label="Reference Number"
                            value={formatPaymentReferences(transaction)}
                            mono
                        />
                        <InfoRow
                            icon={<MapPin />}
                            label="Branch"
                            value={transaction.branch?.name || 'N/A'}
                        />
                        <InfoRow
                            icon={<User />}
                            label="Employee"
                            value={transaction.employee?.full_name || 'N/A'}
                        />
                    </div>

                    <div className="space-y-3">
                        <InfoRow
                            icon={<User />}
                            label="Customer Name"
                            value={customerName}
                        />
                        <InfoRow
                            icon={<Phone />}
                            label="Phone Number"
                            value={transaction.customer?.phone_number || 'N/A'}
                            mono
                        />
                        <InfoRow
                            icon={<Home />}
                            label="Address"
                            value={transaction.customer?.address || 'N/A'}
                            alignTop
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function formatPaymentMethod(transaction: OrderWithrelations): string {
    if (!transaction.payments?.length) {
        return transaction.payment_method || 'N/A';
    }

    if (transaction.payments.length === 1) {
        return transaction.payments[0].payment_method;
    }

    return transaction.payments
        .map(
            (payment) =>
                `${payment.payment_method} ${formatCurrency(payment.amount)}`,
        )
        .join(', ');
}

function formatPaymentReferences(transaction: OrderWithrelations): string {
    if (!transaction.payments?.length) {
        return transaction.reference_number || 'N/A';
    }

    const references = transaction.payments
        .map((payment) => payment.reference_number)
        .filter(Boolean);

    return references.length > 0 ? references.join(', ') : 'N/A';
}

function formatCurrency(value: number | string): string {
    return `₱${Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
    })}`;
}

function InfoRow({
    icon,
    label,
    value,
    mono = false,
    alignTop = false,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    mono?: boolean;
    alignTop?: boolean;
}) {
    return (
        <div
            className={`flex gap-2 ${alignTop ? 'items-start' : 'items-center'}`}
        >
            <span className="mt-0.5 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p
                    className={`text-sm font-medium break-words ${
                        mono ? 'font-mono' : ''
                    }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}
