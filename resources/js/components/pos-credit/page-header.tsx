import type { TransactionSummary } from '@/components/pos-credit/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { CreditCard, Menu, Settings } from 'lucide-react';

interface POSCreditPageHeaderProps {
    sheetOpen: boolean;
    onSheetOpenChange: (open: boolean) => void;
    onOpenSettings: () => void;
    transactions: TransactionSummary[];
}

export function POSCreditPageHeader({
    sheetOpen,
    onSheetOpenChange,
    onOpenSettings,
    transactions,
}: POSCreditPageHeaderProps) {
    return (
        <div className="border-b">
            <div className="container mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <a
                    href="/"
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <CreditCard className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            Credit Approval System
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Installment Setup
                        </p>
                    </div>
                </a>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onOpenSettings}
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                            <SheetHeader>
                                <SheetTitle>Quick Actions</SheetTitle>
                                <SheetDescription>
                                    View transactions history
                                </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-4 p-5 pt-0">
                                <Separator />
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold">
                                        Today's Applications
                                    </h3>
                                    <div className="space-y-2">
                                        {transactions?.map((transaction) => (
                                            <Card
                                                key={transaction.order_number}
                                                className="p-3"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                transaction.customer
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {transaction.term}{' '}
                                                            months
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={`/pos-installment-orders/${transaction.order_number}`}
                                                        className="cursor-pointer rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800"
                                                    >
                                                        {
                                                            transaction.order_number
                                                        }
                                                    </a>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    );
}
