import { OrderDetailHeader } from '@/components/pos-cash-orders/order-detail-header';
import { OrderInfoCard } from '@/components/pos-cash-orders/order-info-card';
import { OrderItemsCard } from '@/components/pos-cash-orders/order-items-card';
import { OrderSummaryCard } from '@/components/pos-cash-orders/order-summary-card';
import { OrderVoidAlert } from '@/components/pos-cash-orders/order-void-alert';
import AppLayout from '@/layouts/app-layout';
import { OrderWithrelations } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface ShowProps {
    transaction: OrderWithrelations;
}

export default function Show({ transaction }: ShowProps) {
    const { previousUrl } = usePage().props as { previousUrl: string };
    const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);

    return (
        <AppLayout>
            <Head title={`Order ${transaction.order_number}`} />

            <div className="space-y-4">
                <OrderDetailHeader
                    transaction={transaction}
                    previousUrl={previousUrl}
                    isVoidDialogOpen={isVoidDialogOpen}
                    onVoidDialogOpenChange={setIsVoidDialogOpen}
                />

                <OrderVoidAlert transaction={transaction} />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <OrderInfoCard transaction={transaction} />
                        <OrderItemsCard transaction={transaction} />
                    </div>

                    <OrderSummaryCard transaction={transaction} />
                </div>
            </div>
        </AppLayout>
    );
}
