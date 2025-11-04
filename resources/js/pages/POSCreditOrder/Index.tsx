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
import { Search, Eye, Calendar, MapPin, User, Filter, X, Download, Clock, Package } from "lucide-react";
import { Paginated, InstallmentOrderWithRelations, Location, User as UserType } from "@/types";
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
  const [dateFrom, setDateFrom] = useState(query.get("date_from") || "");
  const [dateTo, setDateTo] = useState(query.get("date_to") || "");
  const [selectedLocation, setSelectedLocation] = useState(query.get("location_id") || "all");
  const [selectedEmployee, setSelectedEmployee] = useState(query.get("employee_id") || "all");
  const [selectedStatus, setSelectedStatus] = useState(query.get("status") || "all");
  const [selectedAging, setSelectedAging] = useState(query.get("aging") || "all");
  const [selectedItemType, setSelectedItemType] = useState(query.get("item_type") || "all");

  // Trigger server-side filter whenever filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      const params: Record<string, string> = {};

      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (selectedLocation !== "all") params.location_id = selectedLocation;
      if (selectedEmployee !== "all") params.employee_id = selectedEmployee;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedAging !== "all") params.aging = selectedAging;
      if (selectedItemType !== "all") params.item_type = selectedItemType;

      router.get("/pos-installment-orders", params, { preserveState: true, replace: true });
    }, 400);

    return () => clearTimeout(debounce);
  }, [search, dateFrom, dateTo, selectedLocation, selectedEmployee, selectedStatus, selectedAging, selectedItemType]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSelectedLocation("all");
    setSelectedEmployee("all");
    setSelectedStatus("all");
    setSelectedAging("all");
    setSelectedItemType("all");
  };

  const hasActiveFilters =
    search ||
    dateFrom ||
    dateTo ||
    selectedLocation !== "all" ||
    selectedEmployee !== "all" ||
    selectedStatus !== "all" ||
    selectedAging !== "all" ||
    selectedItemType !== "all";

  const handleViewDetails = (orderId: number) => {
    router.visit(`/pos-installment-orders/${orderId}`);
  };

  const getStatusBadge = (transaction: InstallmentOrderWithRelations) => {
    if (transaction.is_voided) {
      return <Badge className="bg-destructive">Voided</Badge>;
    }
    if (transaction.is_defaulted) {
      return <Badge className="bg-orange-500">Defaulted</Badge>;
    }
    if (transaction.is_completed) {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    return <Badge className="bg-blue-500">Active</Badge>;
  };

    

  return (
    <AppLayout>
      <Head title="POS Installment Orders" />
      <ModuleHeading title="POS Installment Orders" description="View and manage all installment order transactions">
     
      </ModuleHeading>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {/* <div className="space-y-2">
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
            </div> */}

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
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="voided">Voided</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aging */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Aging
              </label>
              <Select value={selectedAging} onValueChange={setSelectedAging}>
                <SelectTrigger>
                  <SelectValue placeholder="All Aging" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Aging</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="new_releases">New Releases</SelectItem>
                  <SelectItem value="1">30 Days</SelectItem>
                  <SelectItem value="2">60 Days</SelectItem>
                  <SelectItem value="3">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Item Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Package className="h-4 w-4" /> Item Type
              </label>
              <Select value={selectedItemType} onValueChange={setSelectedItemType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Item Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Item Types</SelectItem>
                  <SelectItem value="appliances">Appliances</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="gadgets">Gadgets</SelectItem>
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
             <TableHead>Customer</TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Transaction Date</TableHead>
              <TableHead>No. of Terms</TableHead>
              <TableHead>Total PNV</TableHead>
              <TableHead>Monthly</TableHead>
              <TableHead>Remaining Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
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
                  <TableCell>{transaction.customer.full_name}</TableCell>
                  <TableCell className="font-medium">{transaction.order_number}</TableCell>
                  <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                  <TableCell>{transaction.number_of_terms} months</TableCell>
                  <TableCell>₱{(transaction.promisory_note_value * transaction.promisory_note_value_interest + Number(transaction.promisory_note_value_interest_additional_charge)).toLocaleString()}</TableCell>
                  <TableCell>
                   ₱{((transaction.promisory_note_value * transaction.promisory_note_value_interest + Number(transaction.promisory_note_value_interest_additional_charge)) / transaction.number_of_terms).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(transaction.remaining_balance > 1 ? transaction.remaining_balance : 0)}
                </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction)}
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