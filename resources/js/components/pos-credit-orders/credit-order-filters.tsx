import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { IconQuestionMark } from '@tabler/icons-react';
import {
    Calendar,
    Clock,
    Filter,
    MapPin,
    Package,
    Search,
    X,
} from 'lucide-react';
import { useState } from 'react';
import {
    POSCreditOrderFilterActions,
    POSCreditOrderFilterOptions,
    POSCreditOrderFilters,
} from './types';

type Props = POSCreditOrderFilterOptions &
    POSCreditOrderFilterActions & {
        filters: POSCreditOrderFilters;
        hasActiveFilters: boolean;
    };

export function CreditOrderFilters({
    filters,
    locations,
    hasActiveFilters,
    setSearch,
    setDateFrom,
    setDateTo,
    setSelectedLocation,
    setSelectedStatus,
    setSelectedItemType,
    setAdvancedFilter,
    clearFilters,
}: Props) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterFields = (
        <FilterFields
            filters={filters}
            locations={locations}
            hasActiveFilters={hasActiveFilters}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            setSelectedLocation={setSelectedLocation}
            setSelectedStatus={setSelectedStatus}
            setSelectedItemType={setSelectedItemType}
            setAdvancedFilter={setAdvancedFilter}
            clearFilters={clearFilters}
        />
    );

    return (
        <Card>
            <CardContent className="pt-4 sm:pt-6">
                <div className="flex gap-2 lg:hidden">
                    <SearchInput
                        value={filters.search}
                        onChange={setSearch}
                        placeholder="Search orders..."
                    />
                    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="relative shrink-0"
                            >
                                <Filter className="h-4 w-4" />
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="space-y-4">
                                <div className="font-semibold">Filters</div>
                                {filterFields}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="hidden space-y-4 lg:block">
                    <SearchInput
                        value={filters.search}
                        onChange={setSearch}
                        placeholder="Search by order number or customer name..."
                    />
                    <div className="grid grid-cols-6 gap-3">{filterFields}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function SearchInput({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    return (
        <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="pl-9"
            />
        </div>
    );
}

function FilterFields({
    filters,
    locations,
    hasActiveFilters,
    setDateFrom,
    setDateTo,
    setSelectedLocation,
    setSelectedStatus,
    setSelectedItemType,
    setAdvancedFilter,
    clearFilters,
}: Omit<Props, 'setSearch' | 'employees'>) {
    return (
        <>
            <FilterField icon={<Calendar />} label="Date From">
                <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="h-9 text-sm"
                />
            </FilterField>

            <FilterField icon={<Calendar />} label="Date To">
                <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    className="h-9 text-sm"
                />
            </FilterField>

            <FilterField icon={<MapPin />} label="Branch">
                <Select
                    value={filters.selectedLocation}
                    onValueChange={setSelectedLocation}
                >
                    <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
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

            <FilterField icon={<IconQuestionMark />} label="Status">
                <Select
                    value={filters.selectedStatus}
                    onValueChange={setSelectedStatus}
                >
                    <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="voided">Voided</SelectItem>
                        <SelectItem value="defaulted">Defaulted</SelectItem>
                    </SelectContent>
                </Select>
            </FilterField>

            <FilterField icon={<Package />} label="Item Type">
                <Select
                    value={filters.selectedItemType}
                    onValueChange={setSelectedItemType}
                >
                    <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="All Items" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Item Types</SelectItem>
                        <SelectItem value="appliances">Appliances</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="gadgets">Gadgets</SelectItem>
                    </SelectContent>
                </Select>
            </FilterField>

            <FilterField icon={<Clock />} label="Loan Analytics">
                <Select
                    value={filters.advancedFilter}
                    onValueChange={setAdvancedFilter}
                >
                    <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Loans</SelectItem>
                        <SelectItem value="due_loans">Due Today</SelectItem>
                        <SelectItem value="1_30_days_aging">
                            1-30 Days Aging
                        </SelectItem>
                        <SelectItem value="31_60_days_aging">
                            31-60 Days Aging
                        </SelectItem>
                        <SelectItem value="61_90_days_aging">
                            61-90 Days Aging
                        </SelectItem>
                        <SelectItem value="90+_days_aging">
                            90+ Days Aging
                        </SelectItem>
                    </SelectContent>
                </Select>
            </FilterField>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full lg:col-span-6 lg:ml-auto lg:w-auto"
                >
                    <X className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
            )}
        </>
    );
}

function FilterField({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium [&>svg]:h-3 [&>svg]:w-3">
                {icon} {label}
            </label>
            {children}
        </div>
    );
}
