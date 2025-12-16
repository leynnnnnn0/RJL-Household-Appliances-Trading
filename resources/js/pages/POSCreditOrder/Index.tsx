import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
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
import { Search, Eye, Calendar, MapPin, Filter, X, Clock, Package } from "lucide-react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
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

  const [search, setSearch] = useState(query.get("search") || "");
  const [dateFrom, setDateFrom] = useState(query.get("date_from") || "");
  const [dateTo, setDateTo] = useState(query.get("date_to") || "");
  const [selectedLocation, setSelectedLocation] = useState(query.get("location_id") || "all");
  const [selectedStatus, setSelectedStatus] = useState(query.get("status") || "all");
  const [selectedItemType, setSelectedItemType] = useState(query.get("item_type") || "all");
  const [advancedFilter, setAdvancedFilter] = useState(query.get("advanced_filter") || "all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const debounce = setTimeout(() => {
      const params: Record<string, string> = {};

      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (selectedLocation !== "all") params.location_id = selectedLocation;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedItemType !== "all") params.item_type = selectedItemType;
      if(advancedFilter !== "all") params.advanced_filter = advancedFilter;

      router.get("/pos-installment-orders", params, { preserveState: true, replace: true });
    }, 400);

    return () => clearTimeout(debounce);
  }, [search, dateFrom, dateTo, selectedLocation, selectedStatus, selectedItemType, advancedFilter]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedLocation("all");
    setSelectedStatus("all");
    setSelectedItemType("all");
    setAdvancedFilter("all");
  };

  const hasActiveFilters =
    dateFrom ||
    dateTo ||
    selectedLocation !== "all" ||
    selectedStatus !== "all" ||
    selectedItemType !== "all" ||
    advancedFilter !== "all";

  const getStatusBadge = (transaction: InstallmentOrderWithRelations) => {
    if (transaction.is_voided) {
      return <Badge variant="destructive">Voided</Badge>;
    }
    if (transaction.is_defaulted) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Defaulted</Badge>;
    }
    if (transaction.is_completed) {
      return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
    }
    return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
  };

  const calculatePNV = (transaction: InstallmentOrderWithRelations) => {
    return transaction.promisory_note_value * transaction.promisory_note_value_interest + 
           Number(transaction.promisory_note_value_interest_additional_charge);
  };

  const calculateMonthly = (transaction: InstallmentOrderWithRelations) => {
    const pnv = calculatePNV(transaction);
    return pnv / transaction.number_of_terms;
  };

  const calculateRemainingBalance = (transaction: InstallmentOrderWithRelations) => {
    const balance = transaction.remaining_balance - transaction.total_rebate_amount;
    return balance > 1 ? balance : 0;
  };

  const canViewDetails = window.can('can view installment order details');

  const FilterContent = () => (
    <div className="space-y-4">
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

      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <IconQuestionMark className="h-4 w-4" /> Status
        </label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
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
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Package className="h-4 w-4" /> Item Type
        </label>
        <Select value={selectedItemType} onValueChange={setSelectedItemType}>
          <SelectTrigger>
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

      {/* Loan Analytics */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> Loan Analytics
        </label>
        <Select value={advancedFilter} onValueChange={setAdvancedFilter}>
          <SelectTrigger>
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

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout>
      <Head title="POS Installment Orders" />

      <div className="space-y-4 md:space-y-6">
        <ModuleHeading title="POS Installment Orders" description="View and manage all installment order transactions" />

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            {/* Mobile: Search + Filter Button */}
            <div className="flex gap-2 lg:hidden">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
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
                  placeholder="Search by order number or customer name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-6 gap-3">
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

                {/* Loan Analytics */}
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
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Order Number</TableHead>
                <TableHead className="font-semibold">Transaction Date</TableHead>
                <TableHead className="font-semibold">No. of Terms</TableHead>
                <TableHead className="font-semibold">Total PNV</TableHead>
                <TableHead className="font-semibold">Monthly</TableHead>
                <TableHead className="font-semibold">Remaining Balance</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                {canViewDetails && <TableHead className="font-semibold text-center">Actions</TableHead>}
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
                    <TableCell>₱{calculatePNV(transaction).toLocaleString()}</TableCell>
                    <TableCell>₱{calculateMonthly(transaction).toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(calculateRemainingBalance(transaction))}</TableCell>
                    <TableCell>{getStatusBadge(transaction)}</TableCell>
                    {canViewDetails && (
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={() => router.visit(`/pos-installment-orders/${transaction.order_number}`)}
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
        <div className="lg:hidden space-y-4">
          {transactions.data.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Search className="h-12 w-12 mb-2 opacity-20" />
                  <p className="font-medium">No transactions found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            transactions.data.map((transaction) => (
              <Card key={transaction.order_number} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{transaction.customer.full_name}</h3>
                        <p className="text-sm text-muted-foreground">Order #{transaction.order_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.transaction_date)}</p>
                      </div>
                      {getStatusBadge(transaction)}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">No. of Terms</p>
                        <p className="font-medium">{transaction.number_of_terms} months</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Total PNV</p>
                        <p className="font-medium">₱{calculatePNV(transaction).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Monthly</p>
                        <p className="font-medium">₱{calculateMonthly(transaction).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Remaining Balance</p>
                        <p className="font-semibold">{formatCurrency(calculateRemainingBalance(transaction))}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {canViewDetails && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.visit(`/pos-installment-orders/${transaction.order_number}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
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