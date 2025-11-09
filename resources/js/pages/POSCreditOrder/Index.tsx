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
import { Search, Eye, Calendar, MapPin, Filter, X, Clock, Package, Settings2 } from "lucide-react";
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

  // Filter mode state
  const [filterMode, setFilterMode] = useState<"simple" | "advanced">(query.get("filter_mode") as any || "simple");

  // Common filters
  const [search, setSearch] = useState(query.get("search") || "");
  const [dateFrom, setDateFrom] = useState(query.get("date_from") || "");
  const [dateTo, setDateTo] = useState(query.get("date_to") || "");
  const [selectedLocation, setSelectedLocation] = useState(query.get("location_id") || "all");
  const [selectedStatus, setSelectedStatus] = useState(query.get("status") || "all");
  const [selectedItemType, setSelectedItemType] = useState(query.get("item_type") || "all");

  // Advanced filter - single select for all options
  const [advancedFilter, setAdvancedFilter] = useState(query.get("advanced_filter") || "all");

  // Trigger server-side filter whenever filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      const params: Record<string, string> = {};

      // Common filters
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (selectedLocation !== "all") params.location_id = selectedLocation;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedItemType !== "all") params.item_type = selectedItemType;

       params.advanced_filter = advancedFilter;

      router.get("/pos-installment-orders", params, { preserveState: true, replace: true });
    }, 400);

    return () => clearTimeout(debounce);
  }, [search, dateFrom, dateTo, selectedLocation, selectedStatus, selectedItemType, filterMode, advancedFilter]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSelectedLocation("all");
    setSelectedStatus("all");
    setSelectedItemType("all");
    setAdvancedFilter("all");
  };

  const hasActiveFilters =
    search ||
    dateFrom ||
    dateTo ||
    selectedLocation !== "all" ||
    selectedStatus !== "all" ||
    selectedItemType !== "all" ||
    advancedFilter !== "all";

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
      <ModuleHeading title="POS Installment Orders" description="View and manage all installment order transactions" />

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
             
               
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Date From */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date From
              </label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 text-sm" />
            </div>

            {/* Date To */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date To
              </label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 text-sm" />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-9 text-sm">
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

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1">
                <IconQuestionMark className="h-3 w-3" /> Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
            </div>

            {/* Item Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1">
                <Package className="h-3 w-3" /> Item Type
              </label>
              <Select value={selectedItemType} onValueChange={setSelectedItemType}>
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
            </div>

            {/* Advanced Filter - Only show when advanced mode */}
             <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Loan Analytics
                </label>
                <Select value={advancedFilter} onValueChange={setAdvancedFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Loans</SelectItem>
                    <SelectItem value="30_days_aging">30 Days Aging</SelectItem>
                    <SelectItem value="60_days_aging">60 Days Aging</SelectItem>
                    <SelectItem value="90_days_aging">90 Days Aging</SelectItem>
                    <SelectItem value="due_loans">Due Loans</SelectItem>
                    <SelectItem value="missed_repayments">Missed Repayments</SelectItem>
                    <SelectItem value="loans_in_arrears">Loans in Arrears</SelectItem>
                    <SelectItem value="no_repayments">No Repayments</SelectItem>
                    <SelectItem value="past_maturity">Past Maturity Dates</SelectItem>
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
                <TableCell colSpan={9} className="text-center py-12">
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
                    {formatCurrency(transaction.remaining_balance - transaction.total_rebate_amount > 1 ? transaction.remaining_balance - transaction.total_rebate_amount : 0)}
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