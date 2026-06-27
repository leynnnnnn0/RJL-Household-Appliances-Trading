import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Location } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { SalesFilters } from './types';

type Props = {
    filters: SalesFilters;
    locations: Location[];
};

export function SalesDashboardFilters({ filters, locations }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [selectedLocation, setSelectedLocation] = useState(
        filters.location_id || 'all',
    );

    const applyFilters = (
        nextDateFrom = dateFrom,
        nextDateTo = dateTo,
        nextLocation = selectedLocation,
    ) => {
        router.get(
            '/pos-cash-order-sales',
            {
                date_from: nextDateFrom,
                date_to: nextDateTo,
                location_id: nextLocation,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDateFromChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const nextDate = event.target.value;
        setDateFrom(nextDate);
        applyFilters(nextDate, dateTo, selectedLocation);
    };

    const handleDateToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextDate = event.target.value;
        setDateTo(nextDate);
        applyFilters(dateFrom, nextDate, selectedLocation);
    };

    const handleLocationChange = (value: string) => {
        setSelectedLocation(value);
        applyFilters(dateFrom, dateTo, value);
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Input
                    type="date"
                    value={dateFrom}
                    onChange={handleDateFromChange}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Input
                    type="date"
                    value={dateTo}
                    onChange={handleDateToChange}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select
                    value={selectedLocation}
                    onValueChange={handleLocationChange}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select location" />
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
            </div>
        </div>
    );
}
