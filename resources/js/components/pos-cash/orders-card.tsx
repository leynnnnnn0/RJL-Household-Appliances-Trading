import CheckoutDialog from '@/components/pos-cash/checkout-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    formatPOSCashCurrency,
    POSCashCartItem,
    posCashOrderTotal,
} from '@/lib/pos-cash';
import { Location, User } from '@/types';
import { ShoppingCart, Trash2 } from 'lucide-react';

interface OrdersCardProps {
    orders: POSCashCartItem[];
    onRemoveOrder: (orderId: string) => void;
    checkoutOpen: boolean;
    onCheckoutOpenChange: (open: boolean) => void;
    employees: User[];
    locations: Location[];
    selectedEmployee: string;
    onSelectedEmployeeChange: (value: string) => void;
    selectedLocation: string;
    onSelectedLocationChange: (value: string) => void;
    onOrderCreated: () => void;
}

export default function OrdersCard({
    orders,
    onRemoveOrder,
    checkoutOpen,
    onCheckoutOpenChange,
    employees,
    locations,
    selectedEmployee,
    onSelectedEmployeeChange,
    selectedLocation,
    onSelectedLocationChange,
    onOrderCreated,
}: OrdersCardProps) {
    const orderTotal = posCashOrderTotal(orders);

    return (
        <Card className="lg:sticky lg:top-6">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Orders</span>
                    <span className="text-sm font-normal text-muted-foreground">
                        {orders.length} {orders.length === 1 ? 'item' : 'items'}
                    </span>
                </CardTitle>
                <CardDescription>
                    Total: {formatPOSCashCurrency(orderTotal)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-h-[600px] space-y-3 overflow-auto">
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ShoppingCart className="mb-3 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                                No orders yet
                            </p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <CartItem
                                key={order.id}
                                order={order}
                                onRemoveOrder={onRemoveOrder}
                            />
                        ))
                    )}
                </div>

                <CheckoutDialog
                    open={checkoutOpen}
                    onOpenChange={onCheckoutOpenChange}
                    orders={orders}
                    orderTotal={orderTotal}
                    employees={employees}
                    locations={locations}
                    selectedEmployee={selectedEmployee}
                    onSelectedEmployeeChange={onSelectedEmployeeChange}
                    selectedLocation={selectedLocation}
                    onSelectedLocationChange={onSelectedLocationChange}
                    onOrderCreated={onOrderCreated}
                />
            </CardContent>
        </Card>
    );
}

function CartItem({
    order,
    onRemoveOrder,
}: {
    order: POSCashCartItem;
    onRemoveOrder: (orderId: string) => void;
}) {
    return (
        <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                        {order.product.description}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {order.product.serial}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveOrder(order.id)}
                    className="h-8 w-8 shrink-0"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            <Separator />
            <div className="space-y-1 text-xs">
                <CartAmount label="Amount" value={order.saleAmount} strong />
                <CartAmount label="SRP" value={order.product.srp} />
                <CartAmount
                    label="Discount"
                    value={order.product.srp - order.saleAmount}
                    className="font-medium text-green-600"
                />
            </div>
        </div>
    );
}

function CartAmount({
    label,
    value,
    strong = false,
    className,
}: {
    label: string;
    value: number;
    strong?: boolean;
    className?: string;
}) {
    return (
        <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{label}:</span>
            <span className={className || (strong ? 'font-semibold' : '')}>
                {formatPOSCashCurrency(value)}
            </span>
        </div>
    );
}
