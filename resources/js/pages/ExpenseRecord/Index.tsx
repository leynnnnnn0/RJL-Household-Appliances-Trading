import ModuleHeading from '@/components/cards/module-heading';
import Pagination from '@/components/pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
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
import { SearchInput } from '@/components/ui/search-input';
import AppLayout from '@/layouts/app-layout';
import {
    expenseCategoryColor,
    expenseCategoryOptions,
    expenseStatusColor,
    expenseStatusOptions,
    formatExpenseCurrency,
    formatExpenseDate,
    formatExpenseLabel,
} from '@/lib/expense-records';
import { ExpenseRecord, Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Eye, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageProps {
    expense_record: Paginated<ExpenseRecord>;
    users: Array<{ id: number; full_name: string }>;
    filters: {
        status?: string;
        user_id?: string;
        date?: string;
        category?: string;
        search?: string;
    };
}

export default function Index({ expense_record, users, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [userId, setUserId] = useState(filters.user_id || '');
    const [date, setDate] = useState(filters.date || '');
    const [category, setCategory] = useState(filters.category || '');
    const [deleteId, setDeleteId] = useState<number | string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timer);
    }, [search, status, userId, date, category]);

    const applyFilters = () => {
        const params: any = {};
        if (search) params.search = search;
        if (status && status !== 'all') params.status = status;
        if (userId && userId !== 'all') params.user_id = userId;
        if (date) params.date = date;
        if (category && category !== 'all') params.category = category;

        router.get('/expense-record', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setStatus('');
        setUserId('');
        setDate('');
        setCategory('');
    };

    const hasActiveFilters = status || userId || date || category;

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/expense-record/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const canAdd = window.can('can add expense record');
    const canView = window.can('can view expense record details');
    const canEdit = window.can('can edit expense record');
    const canDelete = window.can('can delete expense record');

    const FilterContent = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {expenseStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                <Select value={userId} onValueChange={setUserId}>
                    <SelectTrigger>
                        <SelectValue placeholder="All employees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All employees</SelectItem>
                        {users.map((user) => (
                            <SelectItem
                                key={user.id}
                                value={user.id.toString()}
                            >
                                {user.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <DatePicker value={date} onChange={setDate} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {expenseCategoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
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
            <Head title="Expense Record" />

            <div className="space-y-4 md:space-y-6">
                <ModuleHeading
                    title="Expense Record"
                    description="Data of expenses"
                >
                    {canAdd && (
                        <Button
                            onClick={() =>
                                router.visit('/expense-record/create')
                            }
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Expense Record
                        </Button>
                    )}
                </ModuleHeading>

                {/* Search & Filters */}
                <Card>
                    <CardContent className="pt-6">
                        {/* Mobile: Search + Filter Button */}
                        <div className="flex gap-2 lg:hidden">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder="Search expenses..."
                                className="flex-1"
                            />
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
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder="Search by reference number, remarks..."
                            />

                            <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Status
                                    </label>
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All statuses
                                            </SelectItem>
                                            {expenseStatusOptions.map(
                                                (option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Employee
                                    </label>
                                    <Select
                                        value={userId}
                                        onValueChange={setUserId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All employees" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All employees
                                            </SelectItem>
                                            {users.map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                >
                                                    {user.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Date
                                    </label>
                                    <DatePicker
                                        value={date}
                                        onChange={setDate}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Category
                                    </label>
                                    <Select
                                        value={category}
                                        onValueChange={setCategory}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All categories
                                            </SelectItem>
                                            {expenseCategoryOptions.map(
                                                (option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ),
                                            )}
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
                                    ID
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Employee
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Category
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Amount
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Payment Method
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Status
                                </TableHead>
                                <TableHead className="font-semibold">
                                    Date
                                </TableHead>
                                <TableHead className="text-center font-semibold">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expense_record.data.length > 0 ? (
                                expense_record.data.map((record) => (
                                    <TableRow
                                        key={record.id}
                                        className="transition-colors hover:bg-muted/50"
                                    >
                                        <TableCell className="font-medium">
                                            {record.id}
                                        </TableCell>
                                        <TableCell>
                                            {record.user?.full_name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={expenseCategoryColor(
                                                    record.category,
                                                )}
                                            >
                                                {formatExpenseLabel(
                                                    record.category,
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatExpenseCurrency(
                                                Number(record.amount),
                                            )}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {formatExpenseLabel(
                                                record.payment_method,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={expenseStatusColor(
                                                    record.status,
                                                )}
                                            >
                                                {formatExpenseLabel(
                                                    record.status,
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatExpenseDate(
                                                record.expense_date,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1">
                                                {canView && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/expense-record/${record.id}`,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/expense-record/${record.id}/edit`,
                                                        )
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {canDelete &&
                                                    record.status !==
                                                        'approved' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                setDeleteId(
                                                                    record.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="mb-2 h-12 w-12 opacity-20" />
                                            <p className="font-medium">
                                                No expense records found
                                            </p>
                                            <p className="text-sm">
                                                Try adjusting your search or
                                                filters
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Cards - Mobile/Tablet */}
                <div className="space-y-4 lg:hidden">
                    {expense_record.data.length > 0 ? (
                        expense_record.data.map((record) => (
                            <Card
                                key={record.id}
                                className="transition-shadow hover:shadow-md"
                            >
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-semibold">
                                                    ID: {record.id}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.user?.full_name ||
                                                        'N/A'}
                                                </p>
                                            </div>
                                            <Badge
                                                className={expenseStatusColor(
                                                    record.status,
                                                )}
                                            >
                                                {formatExpenseLabel(
                                                    record.status,
                                                )}
                                            </Badge>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Category
                                                </p>
                                                <Badge
                                                    className={expenseCategoryColor(
                                                        record.category,
                                                    )}
                                                >
                                                    {formatExpenseLabel(
                                                        record.category,
                                                    )}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Amount
                                                </p>
                                                <p className="font-semibold">
                                                    {formatExpenseCurrency(
                                                        Number(record.amount),
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Payment Method
                                                </p>
                                                <p className="capitalize">
                                                    {formatExpenseLabel(
                                                        record.payment_method,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Date
                                                </p>
                                                <p>
                                                    {formatExpenseDate(
                                                        record.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 border-t pt-2">
                                            {canView && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/expense-record/${record.id}`,
                                                        )
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Button>
                                            )}
                                            {canEdit &&
                                                record.status !==
                                                    'approved' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/expense-record/${record.id}/edit`,
                                                            )
                                                        }
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                )}
                                            {canDelete &&
                                                record.status !==
                                                    'approved' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setDeleteId(
                                                                record.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Search className="mb-2 h-12 w-12 opacity-20" />
                                    <p className="font-medium">
                                        No expense records found
                                    </p>
                                    <p className="text-sm">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Pagination data={expense_record} />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the expense record from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
