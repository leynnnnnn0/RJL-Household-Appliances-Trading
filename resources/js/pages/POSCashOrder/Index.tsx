import ModuleHeading from '@/components/cards/module-heading';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    Location,
    OrderWithrelations,
    Paginated,
    User as UserType,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import { IconQuestionMark } from '@tabler/icons-react';
import {
    Calendar,
    Download,
    Eye,
    Filter,
    MapPin,
    Search,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    transactions: Paginated<OrderWithrelations>;
    locations: Location[];
    employees: UserType[];
}

export default function Index({ transactions, locations, employees }: Props) {
    const query = new URLSearchParams(window.location.search);
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const [search, setSearch] = useState(query.get('search') || '');
    const [dateFrom, setDateFrom] = useState(
        query.get('date_from') || getTodayDate(),
    );
    const [dateTo, setDateTo] = useState(
        query.get('date_to') || getTodayDate(),
    );
    const [selectedLocation, setSelectedLocation] = useState(
        query.get('location_id') || 'all',
    );
    const [selectedEmployee, setSelectedEmployee] = useState(
        query.get('employee_id') || 'all',
    );
    const [selectedStatus, setSelectedStatus] = useState(
        query.get('status') || 'all',
    );
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const debounce = setTimeout(() => {
            const params: Record<string, string> = {};

            if (search) params.search = search;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            if (selectedLocation !== 'all')
                params.location_id = selectedLocation;
            if (selectedEmployee !== 'all')
                params.employee_id = selectedEmployee;
            if (selectedStatus !== 'all') params.status = selectedStatus;

            router.get('/pos-cash-orders', params, {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(debounce);
    }, [
        search,
        dateFrom,
        dateTo,
        selectedLocation,
        selectedEmployee,
        selectedStatus,
    ]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    const clearFilters = () => {
        setDateFrom(getTodayDate());
        setDateTo(getTodayDate());
        setSelectedLocation('all');
        setSelectedEmployee('all');
        setSelectedStatus('all');
    };

    const hasActiveFilters =
        dateFrom !== getTodayDate() ||
        dateTo !== getTodayDate() ||
        selectedLocation !== 'all' ||
        selectedEmployee !== 'all' ||
        selectedStatus !== 'all';

    const downloadPDF = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        if (selectedLocation !== 'all')
            params.append('location_id', selectedLocation);
        if (selectedEmployee !== 'all')
            params.append('employee_id', selectedEmployee);
        if (selectedStatus !== 'all') params.append('status', selectedStatus);

        window.open(
            `/pos-cash-orders/download-pdf?${params.toString()}`,
            '_blank',
        );
    };

    const canViewDetails = window.can('can view cash order details');

    const FilterContent = () => (
        <div className="space-y-4">
            {/* Date From */}
            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-4 w-4" /> Date From
                </label>
                <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                />
            </div>

            {/* Date To */}
            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-4 w-4" /> Date To
                </label>
                <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                />
            </div>

            {/* Location */}
            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-4 w-4" /> Branch
                </label>
                <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                                {loc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Employee */}
            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <User className="h-4 w-4" /> Employee
                </label>
                <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                                {emp.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                    <IconQuestionMark className="h-4 w-4" /> Status
                </label>
                <Select
                    value={selectedStatus}
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
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                >
                    <X className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout>
            <Head title="POS Cash Orders" />

            <div className="space-y-4 md:space-y-6">
                <ModuleHeading
                    title="POS Cash Orders"
                    description="View and manage all cash order transactions"
                >
                    <Button onClick={downloadPDF}>
                        <Download className="mr-2 h-4 w-4" /> Export to PDF
                    </Button>
                </ModuleHeading>

                {/* Search & Filters */}
                <Card>
                    <CardContent className="pt-6">
                        {/* Mobile: Search + Filter Button */}
                        <div className="flex gap-2 lg:hidden">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search orders..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Popover
                                open={isFilterOpen}
                                onOpenChange={setIsFilterOpen}
                            >
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
                                        <div className="font-semibold">
                                            Filters
                                        </div>
                                        <FilterContent />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Desktop: All Filters Visible */}
                        <div className="hidden space-y-4 lg:block">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by order number or employee ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="grid grid-cols-5 gap-4">
                                {/* Date From */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-sm font-medium">
                                        <Calendar className="h-4 w-4" /> Date
                                        From
                                    </label>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) =>
                                            setDateFrom(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Date To */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-sm font-medium">
                                        <Calendar className="h-4 w-4" /> Date To
                                    </label>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) =>
                                            setDateTo(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Location */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-sm font-medium">
                                        <MapPin className="h-4 w-4" /> Branch
                                    </label>
                                    <Select
                                        value={selectedLocation}
                                        onValueChange={setSelectedLocation}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Locations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Branches
                                            </SelectItem>
                                            {locations.map((loc) => (
                                                <SelectItem
                                                    key={loc.id}
                                                    value={loc.id.toString()}
                                                >
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Employee */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-sm font-medium">
                                        <User className="h-4 w-4" /> Employee
                                    </label>
                                    <Select
                                        value={selectedEmployee}
                                        onValueChange={setSelectedEmployee}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Employees" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Employees
                                            </SelectItem>
                                            {employees.map((emp) => (
                                                <SelectItem
                                                    key={emp.id}
                                                    value={emp.id.toString()}
                                                >
                                                    {emp.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-sm font-medium">
                                        <IconQuestionMark className="h-4 w-4" />{' '}
                                        Status
                                    </label>
                                    <Select
                                        value={selectedStatus}
                                        onValueChange={setSelectedStatus}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
                                            <SelectItem value="0">
                                                Not Voided
                                            </SelectItem>
                                            <SelectItem value="1">
                                                Voided
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        <X className="mr-2 h-4 w-4" /> Clear
                                        Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table - Desktop */}
                <div className="hidden overflow-hidden rounded-lg border bg-card lg:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">
                                    Order Number
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Transaction Date
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Branch
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Employee
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Items
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Status
                                </TableHead>
                                <TableHead className="text-right font-semibold">
                                    Total Price
                                </TableHead>
                                {canViewDetails && (
                                    <TableHead className="text-center font-semibold">
                                        Actions
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="mb-2 h-12 w-12 opacity-20" />
                                            <p className="font-medium">
                                                No transactions found
                                            </p>
                                            <p className="text-sm">
                                                Try adjusting your search or
                                                filters
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.data.map((transaction) => (
                                    <TableRow
                                        key={transaction.order_number}
                                        className="transition-colors hover:bg-muted/50"
                                    >
                                        <TableCell className="font-medium">
                                            {transaction.order_number}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(
                                                transaction.transaction_date,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.branch.name}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.employee.full_name}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                {transaction.order_items
                                                    ?.length || 0}{' '}
                                                items
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    transaction.is_void
                                                        ? 'destructive'
                                                        : 'default'
                                                }
                                            >
                                                {transaction.is_void
                                                    ? 'Voided'
                                                    : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(
                                                transaction.total_price,
                                            )}
                                        </TableCell>
                                        {canViewDetails && (
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/pos-cash-orders/${transaction.order_number}`,
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Cards - Mobile/Tablet */}
                <div className="space-y-4 lg:hidden">
                    {transactions.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Search className="mb-2 h-12 w-12 opacity-20" />
                                    <p className="font-medium">
                                        No transactions found
                                    </p>
                                    <p className="text-sm">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        transactions.data.map((transaction) => (
                            <Card
                                key={transaction.order_number}
                                className="transition-shadow hover:shadow-md"
                            >
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-semibold">
                                                    Order #
                                                    {transaction.order_number}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        transaction.transaction_date,
                                                    )}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    transaction.is_void
                                                        ? 'destructive'
                                                        : 'default'
                                                }
                                            >
                                                {transaction.is_void
                                                    ? 'Voided'
                                                    : 'Active'}
                                            </Badge>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Branch
                                                </p>
                                                <p className="font-medium">
                                                    {transaction.branch.name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Employee
                                                </p>
                                                <p className="font-medium">
                                                    {
                                                        transaction.employee
                                                            .full_name
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Items
                                                </p>
                                                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                    {transaction.order_items
                                                        ?.length || 0}{' '}
                                                    items
                                                </span>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Total Price
                                                </p>
                                                <p className="font-semibold">
                                                    {formatCurrency(
                                                        transaction.total_price,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {canViewDetails && (
                                            <div className="flex items-center gap-2 border-t pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/pos-cash-orders/${transaction.order_number}`,
                                                        )
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <Pagination data={transactions} />
            </div>
        </AppLayout>
    );
}
