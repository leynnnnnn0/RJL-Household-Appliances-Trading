import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
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
import { Search, Eye, Calendar, MapPin, User, Filter, X, DownloadIcon } from "lucide-react";
import { Paginated, OrderWithrelations, Location, User as UserType } from "@/types";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ModuleHeading from "@/components/cards/module-heading";

interface Props {
  transactions: Paginated<OrderWithrelations>;
  locations: Location[];
  employees: UserType[];
}

export default function Index({ transactions, locations, employees }: Props) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = transactions.data.filter((transaction) => {
    const matchesSearch =
      transaction.order_number.toLowerCase().includes(search.toLowerCase()) ||
      transaction.employee_id.toString().includes(search);
    
    const transactionDate = new Date(transaction.transaction_date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const matchesDateRange =
      (!fromDate || transactionDate >= fromDate) &&
      (!toDate || transactionDate <= toDate);

    const matchesLocation = !selectedLocation || transaction.location_id.toString() === selectedLocation;
    const matchesEmployee = !selectedEmployee || transaction.employee_id.toString() === selectedEmployee;

    return matchesSearch && matchesDateRange && matchesLocation && matchesEmployee;
  });

  const handleViewDetails = (orderId: number) => {
    router.visit(`/pos-cash-orders/${orderId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSelectedLocation("");
    setSelectedEmployee("");
  };

  const hasActiveFilters = search || dateFrom || dateTo || selectedLocation || selectedEmployee;

  const downloadPDF = () => {
  const params = new URLSearchParams();
  
  if (search) params.append('search', search);
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  if (selectedLocation) params.append('location_id', selectedLocation);
  if (selectedEmployee) params.append('employee_id', selectedEmployee);
  
  // If no date filters, default to today
  if (!dateFrom && !dateTo) {
    const today = new Date().toISOString().split('T')[0];
    params.append('date_from', today);
    params.append('date_to', today);
  }
  
  // Create download URL
  const url = `/pos-cash-orders/download-pdf?${params.toString()}`;
  
  // Trigger download
  window.open(url, '_blank');
  };
  return (
    <AppLayout>
      <Head title="POS Cash Orders" />
      <ModuleHeading title="POS Cash Orders" description="View and manage all cash order transactions">
        <Button onClick={() => downloadPDF()} className="cursor-pointer"><DownloadIcon/> Export to PDF</Button>
      </ModuleHeading>
     
        {/* Filters Card */}
        <Card>


          <CardContent className={`space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number or employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Date From
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Date To
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Employee
                </label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.full_name}
                      </SelectItem>
                    ))}
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
                <TableHead className="font-semibold">Order Number</TableHead>
                <TableHead className="font-semibold">Transaction Date</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Items</TableHead>
                <TableHead className="font-semibold text-right">Total Price</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-12 w-12 mb-2 opacity-20" />
                      <p className="font-medium text-foreground">No transactions found</p>
                      <p className="text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.order_number}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {transaction.order_number}
                    </TableCell>
                    <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                    <TableCell>{transaction.location.name}</TableCell>
                    <TableCell>{transaction.employee.full_name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                        {transaction.order_items?.length || 0} items
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(transaction.total_price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleViewDetails(transaction.order_number as any)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination data={transactions} />

    </AppLayout>
  );
}