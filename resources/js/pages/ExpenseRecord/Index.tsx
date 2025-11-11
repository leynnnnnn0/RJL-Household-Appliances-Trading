import ModuleHeading from "@/components/cards/module-heading";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { ExpenseRecord, Paginated } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Plus, Search, Eye, Edit, Trash2, Filter, X, Calendar, User, Tag, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Pagination from "@/components/pagination";

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
  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "");
  const [userId, setUserId] = useState(filters.user_id || "");
  const [date, setDate] = useState(filters.date || "");
  const [category, setCategory] = useState(filters.category || "");
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
    if (status && status !== "all") params.status = status;
    if (userId && userId !== "all") params.user_id = userId;
    if (date) params.date = date;
    if (category && category !== "all") params.category = category;

    router.get(route("expense-record.index"), params, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    setStatus("");
    setUserId("");
    setDate("");
    setCategory("");
  };

  const hasActiveFilters = status || userId || date || category;

  const handleDelete = () => {
    if (deleteId) {
      router.delete(route("expense-record.destroy", deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fuel":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "repair":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "supplies":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "meal":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "emergency":
        return "bg-rose-100 text-rose-800 hover:bg-rose-100";
      case "other":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const canAdd = window.can("can add expense record");
  const canView = window.can("can view expense record details");
  const canEdit = window.can("can edit expense record");
  const canDelete = window.can("can delete expense record");

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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="fuel">Fuel</SelectItem>
            <SelectItem value="repair">Repair</SelectItem>
            <SelectItem value="supplies">Supplies</SelectItem>
            <SelectItem value="meal">Meal</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout>
      <Head title="Expense Record" />

      <div className="space-y-4 md:space-y-6">
        <ModuleHeading title="Expense Record" description="Data of expenses">
          {canAdd && (
            <Button onClick={() => router.visit(route("expense-record.create"))}>
              <Plus className="mr-2 h-4 w-4" /> Add Expense Record
            </Button>
          )}
        </ModuleHeading>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            {/* Mobile: Search + Filter Button */}
            <div className="flex gap-2 lg:hidden">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 relative">
                    <Filter className="h-4 w-4" />
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="font-semibold">Filters</div>
                    <FilterContent />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Desktop: All Filters Visible */}
            <div className="hidden lg:block space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference number, remarks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
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
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="fuel">Fuel</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="meal">Meal</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" /> Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table - Desktop */}
        <div className="hidden lg:block rounded-lg overflow-hidden border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Payment Method</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expense_record.data.length > 0 ? (
                expense_record.data.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell>{record.user?.full_name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(record.category)}>
                        {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(Number(record.amount))}</TableCell>
                    <TableCell className="capitalize">{record.payment_method.replace("_", " ")}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(record.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        {canView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.visit(route("expense-record.show", record.id))}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {canEdit && record.status !== "approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.visit(route("expense-record.edit", record.id))}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && record.status !== "approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteId(record.id)}
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
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-12 w-12 mb-2 opacity-20" />
                      <p className="font-medium">No expense records found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {expense_record.data.length > 0 ? (
            expense_record.data.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">ID: {record.id}</h3>
                        <p className="text-sm text-muted-foreground">{record.user?.full_name || "N/A"}</p>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Category</p>
                        <Badge className={getCategoryColor(record.category)}>
                          {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Amount</p>
                        <p className="font-semibold">{formatCurrency(Number(record.amount))}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Payment Method</p>
                        <p className="capitalize">{record.payment_method.replace("_", " ")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Date</p>
                        <p>{formatDate(record.created_at)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {canView && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.visit(route("expense-record.show", record.id))}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                      {canEdit && record.status !== "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.visit(route("expense-record.edit", record.id))}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {canDelete && record.status !== "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(record.id)}
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
                  <Search className="h-12 w-12 mb-2 opacity-20" />
                  <p className="font-medium">No expense records found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Pagination data={expense_record} />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}