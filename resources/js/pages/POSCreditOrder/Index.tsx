import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Calendar, MapPin, User, Filter, X, Download } from "lucide-react";
import { Paginated, OrderWithrelations, Location, User as UserType, InstallmentOrderWithRelations } from "@/types";
import Pagination from "@/components/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import ModuleHeading from "@/components/cards/module-heading";
import { IconQuestionMark } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  transactions: Paginated<InstallmentOrderWithRelations>;
  locations: Location[];
  employees: UserType[];
}

export default function Index({ transactions, locations, employees }: Props) {
  const query = new URLSearchParams(window.location.search);

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [search, setSearch] = useState(query.get("search") || "");
  const [dateFrom, setDateFrom] = useState(query.get("date_from") || getTodayDate());
  const [dateTo, setDateTo] = useState(query.get("date_to") || getTodayDate());
  const [selectedLocation, setSelectedLocation] = useState(query.get("location_id") || "all");
  const [selectedEmployee, setSelectedEmployee] = useState(query.get("employee_id") || "all");
  const [selectedStatus, setSelectedStatus] = useState(query.get("status") || "all");

  // 🧠 Trigger server-side filter whenever filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      const params: Record<string, string> = {};

      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (selectedLocation !== "all") params.location_id = selectedLocation;
      if (selectedEmployee !== "all") params.employee_id = selectedEmployee;
      if (selectedStatus !== "all") params.status = selectedStatus;

      router.get("/pos-installment-orders", params, { preserveState: true, replace: true });
    }, 400);

    return () => clearTimeout(debounce);
  }, [search, dateFrom, dateTo, selectedLocation, selectedEmployee, selectedStatus]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

  const clearFilters = () => {
    setSearch("");
    setDateFrom(getTodayDate());
    setDateTo(getTodayDate());
    setSelectedLocation("all");
    setSelectedEmployee("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters =
    search ||
    dateFrom ||
    dateTo ||
    selectedLocation !== "all" ||
    selectedEmployee !== "all" ||
    selectedStatus !== "all";

  const handleViewDetails = (orderId: number) => {
    router.visit(`/pos-installment-orders/${orderId}`);
  };

  const downloadPDF = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);
    if (selectedLocation !== "all") params.append("location_id", selectedLocation);
    if (selectedEmployee !== "all") params.append("employee_id", selectedEmployee);
    if (selectedStatus !== "all") params.append("status", selectedStatus);

    window.open(`/pos-cash-orders/download-pdf?${params.toString()}`, "_blank");
  };

  return (
    <AppLayout>
      <Head title="POS Installment Orders" />
      <ModuleHeading title="POS Installment Orders" description="View and manage all installment order transactions">
        {/* <Button onClick={downloadPDF} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" /> Export to PDF
        </Button> */}
      </ModuleHeading>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4 lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Date From
              </label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Date To
              </label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Location
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employee */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-4 w-4" /> Employee
              </label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <IconQuestionMark className="h-4 w-4" /> Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-lg overflow-hidden border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Order Number</TableHead>
              <TableHead>Transaction Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="h-12 w-12 mb-2 opacity-20" />
                    <p className="font-medium">No transactions found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.data.map((transaction) => (
                <TableRow key={transaction.order_number} className="hover:bg-muted/50 transition-colors">
                  <TableCell>{transaction.order_number}</TableCell>
                  <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                  <TableCell>{transaction.location.name}</TableCell>
                  <TableCell>{transaction.user.full_name}</TableCell>
                  <TableCell>
                    <Badge className={`${transaction.is_void && "bg-destructive"}`}>
                      {transaction.is_void ? "Voided" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewDetails(transaction.order_number as any)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination data={transactions} />
    </AppLayout>
  );
}
