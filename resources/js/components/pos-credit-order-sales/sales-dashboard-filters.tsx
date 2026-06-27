import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { CreditSalesFilters, LocationOption } from './types';

export function CreditSalesDashboardFilters({
    filters,
    locations,
}: {
    filters: CreditSalesFilters;
    locations: LocationOption[];
}) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [itemType, setItemType] = useState(filters.item_type);
    const [locationId, setLocationId] = useState(
        filters.location_id.toString(),
    );

    const handleFilter = () => {
        router.get(
            '/pos-installment-orders-sales',
            {
                date_from: dateFrom,
                date_to: dateTo,
                item_type: itemType,
                location_id: locationId,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <div className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Filters
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <FilterField label="Date From">
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => setDateFrom(event.target.value)}
                    />
                </FilterField>
                <FilterField label="Date To">
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(event) => setDateTo(event.target.value)}
                    />
                </FilterField>
                <FilterField label="Item Type">
                    <Select value={itemType} onValueChange={setItemType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="appliances">
                                Appliances
                            </SelectItem>
                            <SelectItem value="gadgets">Gadgets</SelectItem>
                        </SelectContent>
                    </Select>
                </FilterField>
                <FilterField label="Location">
                    <Select value={locationId} onValueChange={setLocationId}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {locations.map((location) => (
                                <SelectItem
                                    key={location.id}
                                    value={location.id.toString()}
                                >
                                    {location.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FilterField>
                <div className="flex items-end sm:col-span-2 xl:col-span-1">
                    <Button onClick={handleFilter} className="w-full">
                        Apply Filters
                    </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Expected</span> = dues scheduled
                within this period.{' '}
                <span className="font-semibold">Collected</span> = payments
                received within this period.
            </p>
        </div>
    );
}

function FilterField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            {children}
        </div>
    );
}
