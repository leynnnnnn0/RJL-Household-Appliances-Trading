import ModuleHeading from "@/components/cards/module-heading";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { ExpenseRecord, Paginated, User } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Plus, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
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

  return (
    <AppLayout>
      <Head title="Expense Record" />
      <ModuleHeading title="Expense Record" description="Data of expenses">
        <Button>
          <Plus /> Add Expense Record
        </Button>
      </ModuleHeading>

      <div className="mt-6 space-y-4">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by reference number, remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expense_record.data.length > 0 ? (
                expense_record.data.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell>{record.user?.full_name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(record.category)}>
                        {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₱{Number(record.amount).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="capitalize">
                      {record.payment_method.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(record.created_at).toLocaleDateString("en-PH")}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {record.remarks || "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No expense records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination data={expense_record} />
      </div>
    </AppLayout>
  );
}