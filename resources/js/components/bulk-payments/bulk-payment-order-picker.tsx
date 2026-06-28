import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, Search } from 'lucide-react';
import { BulkPaymentForm, BulkPaymentOrder } from './types';

export function BulkPaymentOrderPicker({
    payment,
    open,
    onOpenChange,
    searchQuery,
    onSearchChange,
    isSearching,
    searchResults,
    onSelectOrder,
}: {
    payment: BulkPaymentForm;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    isSearching: boolean;
    searchResults: BulkPaymentOrder[];
    onSelectOrder: (order: BulkPaymentOrder) => void;
}) {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="h-9 w-full justify-between text-xs font-normal"
                >
                    <span className="truncate">
                        {payment?.selected_order
                            ? `${payment.selected_order.item_model} - ${payment.selected_order.customer}`
                            : 'Search order...'}
                    </span>
                    <Search className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[min(320px,calc(100vw-2rem))] p-0"
                align="start"
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search by order # or name..."
                        value={searchQuery}
                        onValueChange={onSearchChange}
                        className="text-xs"
                    />
                    <CommandEmpty className="py-6 text-center text-xs">
                        {isSearching ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Searching...</span>
                            </div>
                        ) : searchQuery.length < 2 ? (
                            'Type at least 2 characters to search'
                        ) : (
                            'No orders found'
                        )}
                    </CommandEmpty>
                    <CommandGroup className="max-h-[220px] overflow-auto">
                        {searchResults.map((order) => (
                            <CommandItem
                                key={order.id}
                                value={`${order.id}-${order.order_number}`}
                                onSelect={() => onSelectOrder(order)}
                                className="text-xs"
                            >
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate font-medium">
                                        {order.item_model}
                                    </span>
                                    <span className="truncate text-muted-foreground">
                                        {order.customer}
                                    </span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
