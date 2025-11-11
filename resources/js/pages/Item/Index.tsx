import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ModuleHeading from "@/components/cards/module-heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Pencil, Plus, Filter, X, Download } from 'lucide-react';
import { Supplier, ItemWithRelations, Location, Paginated } from '@/types';
import Pagination from '@/components/pagination';

interface PageProps {
  suppliers: Supplier[];
  items: Paginated<ItemWithRelations>;
  locations: Location[];
}

export default function Index({ items, suppliers, locations }: PageProps) {
  const { auth } = usePage().props as any;
  const query = new URLSearchParams(window.location.search);

  const [searchQuery, setSearchQuery] = useState(query.get('search') || '');
  const [availabilityFilter, setAvailabilityFilter] = useState(query.get('availability') || 'all');
  const [supplierFilter, setSupplierFilter] = useState(query.get('supplier') || 'all');
  const [itemTypeFilter, setItemTypeFilter] = useState(query.get('item_type') || 'all');
  const [locationFilter, setLocationFilter] = useState(query.get('location') || 'all');

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const params: Record<string, string> = {};

      if (searchQuery) params.search = searchQuery;
      if (availabilityFilter !== 'all') params.availability = availabilityFilter;
      if (supplierFilter !== 'all') params.supplier = supplierFilter;
      if (itemTypeFilter !== 'all') params.item_type = itemTypeFilter;
      if (locationFilter !== 'all') params.location = locationFilter;

      router.get('/items', params, {
        preserveState: true,
        replace: true,
      });
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, availabilityFilter, supplierFilter, itemTypeFilter, locationFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setAvailabilityFilter('all');
    setSupplierFilter('all');
    setItemTypeFilter('all');
    setLocationFilter('all');
  };

  const hasActiveFilters =
    searchQuery ||
    availabilityFilter !== 'all' ||
    supplierFilter !== 'all' ||
    itemTypeFilter !== 'all' ||
    locationFilter !== 'all';

  const handleExport = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.append('search', searchQuery);
    if (availabilityFilter !== 'all') params.append('availability', availabilityFilter);
    if (supplierFilter !== 'all') params.append('supplier', supplierFilter);
    if (itemTypeFilter !== 'all') params.append('item_type', itemTypeFilter);
    if (locationFilter !== 'all') params.append('location', locationFilter);

    window.location.href = `/items/export?${params.toString()}`;
  };

  return (
    <AppLayout>
      <Head title="Items" />

      <div className="space-y-4 md:space-y-6">
        <ModuleHeading title="Items" description="Manage your inventory items">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button className="w-full sm:w-auto" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>

            {auth.permissions?.includes('can add item') && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex gap-2 items-center justify-center bg-primary text-white text-sm px-4 py-2 rounded-lg w-full sm:w-auto hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select from options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.visit('/items/create')}>
                    Create Manually
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.visit('/items/create-from-import')}>
                    Create from Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </ModuleHeading>

        {/* Filters */}
        <Card className="border-muted">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items by brand, description, or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* Filter Row */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filters:</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {/* Item Type */}
                  <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Item Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="appliances">Appliances</SelectItem>
                      <SelectItem value="gadgets">Gadgets</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Availability */}
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Location */}
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id.toString()}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Supplier */}
                  <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.slug} value={supplier.slug}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters} 
                      className="h-9 col-span-2 md:col-span-1"
                    >
                      <X className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table - Desktop */}
        <div className="hidden lg:block rounded-lg overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Model & Description</TableHead>
                <TableHead className="font-semibold">Serial</TableHead>
                <TableHead className="font-semibold">Unit Cost</TableHead>
                <TableHead className="font-semibold text-center">Quantity</TableHead>
                <TableHead className="font-semibold">Purchase Date</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-8 w-8 mb-2" />
                      <p className="font-medium">No items found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.model}</span>
                        <span className="text-sm text-muted-foreground">{item.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.serial}</TableCell>
                    <TableCell className="font-mono text-sm">{formatCurrency(item.unit_cost)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={item.quantity > 5 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}
                        className="min-w-[3rem] justify-center"
                      >
                        {item.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(item.date_of_purchase)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={item.date_out ? "secondary" : "default"}
                        className="min-w-[5rem] justify-center"
                      >
                        {item.date_out ? 'Unavailable' : 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        {auth.permissions?.includes('can view item details') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.visit(`/items/${item.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {auth.permissions?.includes('can edit item') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={item.date_out != null}
                            onClick={() => router.visit(`/items/${item.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {items.data.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2" />
                  <p className="font-medium">No items found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            items.data.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{item.model}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                      <Badge
                        variant={item.date_out ? "secondary" : "default"}
                        className="shrink-0"
                      >
                        {item.date_out ? 'Unavailable' : 'Available'}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Serial</p>
                        <p className="font-medium">{item.serial}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Unit Cost</p>
                        <p className="font-mono">{formatCurrency(item.unit_cost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Quantity</p>
                        <Badge
                          variant={item.quantity > 5 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}
                          className="w-fit"
                        >
                          {item.quantity}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Purchase Date</p>
                        <p>{formatDate(item.date_of_purchase)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {auth.permissions?.includes('can view item details') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.visit(`/items/${item.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                      {auth.permissions?.includes('can edit item') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={item.date_out != null}
                          onClick={() => router.visit(`/items/${item.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Pagination data={items} />
      </div>
    </AppLayout>
  );
}