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
import { Calendar, Filter, MapPin, Search, User, X } from 'lucide-react';
import { useState } from 'react';
import {
    POSCashOrderFilterActions,
    POSCashOrderFilterOptions,
    POSCashOrderFilters,
} from './types';

type Props = POSCashOrderFilterOptions &
    POSCashOrderFilterActions & {
        filters: POSCashOrderFilters;
        hasActiveFilters: boolean;
    };

export function CashOrderFilters({
    filters,
    locations,
    employees,
    hasActiveFilters,
    setSearch,
    setDateFrom,
    setDateTo,
    setSelectedLocation,
    setSelectedEmployee,
    setSelectedStatus,
    clearFilters,
}: Props) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filterFields = (
        <FilterFields
            filters={filters}
            locations={locations}
            employees={employees}
            hasActiveFilters={hasActiveFilters}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            setSelectedLocation={setSelectedLocation}
            setSelectedEmployee={setSelectedEmployee}
            setSelectedStatus={setSelectedStatus}
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
                        placeholder="Search by order number or employee ID..."
                    />
                    <div className="grid grid-cols-5 gap-4">{filterFields}</div>
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
    employees,
    hasActiveFilters,
    setDateFrom,
    setDateTo,
    setSelectedLocation,
    setSelectedEmployee,
    setSelectedStatus,
    clearFilters,
}: Omit<Props, 'setSearch'>) {
    return (
        <>
            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-4 w-4" /> Date From
                </label>
                <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-4 w-4" /> Date To
                </label>
                <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-4 w-4" /> Branch
                </label>
                <Select
                    value={filters.selectedLocation}
                    onValueChange={setSelectedLocation}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
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
            </div>

            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <User className="h-4 w-4" /> Employee
                </label>
                <Select
                    value={filters.selectedEmployee}
                    onValueChange={setSelectedEmployee}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {employees.map((employee) => (
                            <SelectItem
                                key={employee.id}
                                value={employee.id.toString()}
                            >
                                {employee.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <IconQuestionMark className="h-4 w-4" /> Status
                </label>
                <Select
                    value={filters.selectedStatus}
                    onValueChange={setSelectedStatus}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="0">Not Voided</SelectItem>
                        <SelectItem value="1">Voided</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full lg:col-span-5 lg:ml-auto lg:w-auto"
                >
                    <X className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
            )}
        </>
    );
}
