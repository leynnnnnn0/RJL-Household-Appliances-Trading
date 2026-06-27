import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { formatPOSCashCurrency } from '@/lib/pos-cash';
import { OrderWithrelations } from '@/types';
import { History, Menu, TrendingUp } from 'lucide-react';

interface TransactionHistorySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactions: OrderWithrelations[];
}

export default function TransactionHistorySheet({
    open,
    onOpenChange,
    transactions,
}: TransactionHistorySheetProps) {
    const totalSales = transactions
        .filter((order) => !order.is_void)
        .reduce((sum, order) => sum + Number(order.total_price), 0);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Transaction History</SheetTitle>
                    <SheetDescription>
                        View sales summary and transaction details
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 p-5">
                    <div className="space-y-2">
                        <Label>Filter by Date</Label>
                        <Select value="today">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>
                                    Total Transactions
                                </CardDescription>
                                <CardTitle className="text-3xl">
                                    {transactions.length}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <History className="h-3 w-3" />
                                    <span>Today</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Total Sales</CardDescription>
                                <CardTitle className="text-3xl">
                                    {formatPOSCashCurrency(totalSales)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>Revenue generated</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <h3 className="font-semibold">Recent Transactions</h3>
                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <History className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    No transactions found
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transactions.map((transaction) => (
                                    <TransactionAccordion
                                        key={transaction.order_number}
                                        transaction={transaction}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function TransactionAccordion({
    transaction,
}: {
    transaction: OrderWithrelations;
}) {
    return (
        <Accordion type="single" collapsible>
            <AccordionItem
                value={transaction.order_number}
                className="overflow-hidden rounded-lg border"
            >
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex w-full flex-col gap-1 pr-4 text-left sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-semibold text-gray-900">
                            {transaction.order_number}{' '}
                            {transaction.is_void && <Badge>Voided</Badge>}
                        </span>
                        <span className="text-sm text-gray-600">
                            {transaction.transaction_date}
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="bg-gray-50 px-4 py-4">
                    <div className="space-y-4">
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <h3 className="mb-3 font-semibold text-gray-900">
                                Order Details
                            </h3>
                            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                <Info
                                    label="Order Number"
                                    value={transaction.order_number}
                                />
                                <Info
                                    label="Transaction Date"
                                    value={transaction.transaction_date}
                                />
                                <Info
                                    label="Total Price"
                                    value={formatPOSCashCurrency(
                                        transaction.total_price,
                                    )}
                                />
                                <Info
                                    label="Branch"
                                    value={transaction.branch?.name || 'N/A'}
                                />
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <h3 className="mb-3 font-semibold text-gray-900">
                                Order Items
                            </h3>
                            <div className="space-y-3">
                                {transaction.order_items.map((orderItem) => (
                                    <div
                                        key={`${transaction.order_number}-${orderItem.serial}`}
                                        className="rounded border-l-4 border-blue-500 bg-gray-50 py-2 pl-4"
                                    >
                                        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                            <Info
                                                label="Description"
                                                value={
                                                    orderItem.item.description
                                                }
                                            />
                                            <Info
                                                label="Model"
                                                value={
                                                    orderItem.item.model ||
                                                    'N/A'
                                                }
                                            />
                                            <Info
                                                label="Serial"
                                                value={orderItem.serial}
                                            />
                                            <Info
                                                label="Sale Amount"
                                                value={formatPOSCashCurrency(
                                                    orderItem.sale_amount,
                                                )}
                                                valueClassName="text-green-600"
                                            />
                                            <Info
                                                label="Item Type"
                                                value={orderItem.item.item_type}
                                            />
                                            <Info
                                                label="Supplier"
                                                value={orderItem.item.supplier}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

function Info({
    label,
    value,
    valueClassName = 'text-gray-900',
}: {
    label: string;
    value: React.ReactNode;
    valueClassName?: string;
}) {
    return (
        <div>
            <span className="text-gray-600">{label}:</span>
            <p className={`font-medium break-words ${valueClassName}`}>
                {value}
            </p>
        </div>
    );
}
