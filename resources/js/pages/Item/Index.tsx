import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ModuleHeading from "@/components/cards/module-heading";
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Search, Eye, Pencil, Plus, Filter, X, Download, MoveDiagonal } from 'lucide-react';
import { Supplier, ItemWithRelations, Location, Paginated } from '@/types';
import Pagination from '@/components/pagination';
import { toast } from 'sonner';

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

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemWithRelations | null>(
      null,
  );

  const moveForm = useForm({
      location_id: '',
      remarks: '',
  });

  const handleMoveSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedItem) return;

      moveForm.put(`/items/${selectedItem.id}/move`, {
          onSuccess: () => {
              setMoveDialogOpen(false);
              moveForm.reset();
              setSelectedItem(null);
              toast.success('Item moved successfully.');
          },
          onError: (e) => {
              toast.error('Failed to move item. Please check the form for errors.');
              console.log(e);
          }
      });
  };

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
              <ModuleHeading
                  title="Items"
                  description="Manage your inventory items"
              >
                  <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                      <Button
                          className="w-full sm:w-auto"
                          onClick={handleExport}
                      >
                          <Download className="mr-2 h-4 w-4" /> Export
                      </Button>

                      {auth.permissions?.includes('can add item') && (
                          <DropdownMenu>
                              <DropdownMenuTrigger className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary/90 sm:w-auto">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Item
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                  <DropdownMenuLabel>
                                      Select from options
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                      onClick={() =>
                                          router.visit('/items/create')
                                      }
                                  >
                                      Create Manually
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                      onClick={() =>
                                          router.visit(
                                              '/items/create-from-import',
                                          )
                                      }
                                  >
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
                              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                  placeholder="Search items by brand, description, or model..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                      setSearchQuery(e.target.value)
                                  }
                                  className="h-11 pl-10"
                              />
                          </div>

                          {/* Filter Row */}
                          <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                  <Filter className="h-4 w-4" />
                                  <span>Filters:</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
                                  {/* Item Type */}
                                  <Select
                                      value={itemTypeFilter}
                                      onValueChange={setItemTypeFilter}
                                  >
                                      <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Item Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="all">
                                              All Types
                                          </SelectItem>
                                          <SelectItem value="appliances">
                                              Appliances
                                          </SelectItem>
                                          <SelectItem value="gadgets">
                                              Gadgets
                                          </SelectItem>
                                          <SelectItem value="furniture">
                                              Furniture
                                          </SelectItem>
                                      </SelectContent>
                                  </Select>

                                  {/* Availability */}
                                  <Select
                                      value={availabilityFilter}
                                      onValueChange={setAvailabilityFilter}
                                  >
                                      <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Availability" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="all">
                                              All Status
                                          </SelectItem>
                                          <SelectItem value="available">
                                              Available
                                          </SelectItem>
                                          <SelectItem value="unavailable">
                                              Unavailable
                                          </SelectItem>
                                      </SelectContent>
                                  </Select>

                                  {/* Location */}
                                  <Select
                                      value={locationFilter}
                                      onValueChange={setLocationFilter}
                                  >
                                      <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Location" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="all">
                                              All Locations
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

                                  {/* Supplier */}
                                  <Select
                                      value={supplierFilter}
                                      onValueChange={setSupplierFilter}
                                  >
                                      <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Supplier" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="all">
                                              All Suppliers
                                          </SelectItem>
                                          {suppliers.map((supplier) => (
                                              <SelectItem
                                                  key={supplier.slug}
                                                  value={supplier.slug}
                                              >
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
                                          className="col-span-2 h-9 md:col-span-1"
                                      >
                                          <X className="mr-1 h-4 w-4" /> Clear
                                      </Button>
                                  )}
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              {/* Table - Desktop */}
              <div className="hidden overflow-hidden rounded-lg border lg:block">
                  <Table>
                      <TableHeader>
                          <TableRow className="bg-muted/50">
                              <TableHead className="font-semibold">
                                  Model & Description
                              </TableHead>
                              <TableHead className="font-semibold">
                                  Serial
                              </TableHead>
                              <TableHead className="font-semibold">
                                  Unit Cost
                              </TableHead>
                              <TableHead className="text-center font-semibold">
                                  Quantity
                              </TableHead>
                              <TableHead className="font-semibold">
                                  Purchase Date
                              </TableHead>
                              <TableHead className="text-center font-semibold">
                                  Status
                              </TableHead>
                              <TableHead className="text-center font-semibold">
                                  Actions
                              </TableHead>
                          </TableRow>
                      </TableHeader>

                      <TableBody>
                          {items.data.length === 0 ? (
                              <TableRow>
                                  <TableCell
                                      colSpan={7}
                                      className="py-12 text-center"
                                  >
                                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                          <Search className="mb-2 h-8 w-8" />
                                          <p className="font-medium">
                                              No items found
                                          </p>
                                          <p className="text-sm">
                                              Try adjusting your search or
                                              filters
                                          </p>
                                      </div>
                                  </TableCell>
                              </TableRow>
                          ) : (
                              items.data.map((item) => (
                                  <TableRow
                                      key={item.id}
                                      className="transition-colors hover:bg-muted/50"
                                  >
                                      <TableCell>
                                          <div className="flex flex-col">
                                              <span className="font-medium">
                                                  {item.model}
                                              </span>
                                              <span className="text-sm text-muted-foreground">
                                                  {item.description}
                                              </span>
                                          </div>
                                      </TableCell>
                                      <TableCell className="font-medium">
                                          {item.serial}
                                      </TableCell>
                                      <TableCell className="font-mono text-sm">
                                          {formatCurrency(item.unit_cost)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                          <Badge
                                              variant={
                                                  item.quantity > 5
                                                      ? 'default'
                                                      : item.quantity > 0
                                                        ? 'secondary'
                                                        : 'destructive'
                                              }
                                              className="min-w-[3rem] justify-center"
                                          >
                                              {item.quantity}
                                          </Badge>
                                      </TableCell>
                                      <TableCell className="text-sm">
                                          {formatDate(item.date_of_purchase)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                          <Badge
                                              variant={
                                                  item.date_out
                                                      ? 'secondary'
                                                      : 'default'
                                              }
                                              className="min-w-[5rem] justify-center"
                                          >
                                              {item.date_out
                                                  ? 'Unavailable'
                                                  : 'Available'}
                                          </Badge>
                                      </TableCell>
                                      <TableCell>
                                          <div className="flex items-center justify-center gap-1">
                                              {auth.permissions?.includes(
                                                  'can view item details',
                                              ) && (
                                                  <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-8 w-8"
                                                      onClick={() =>
                                                          router.visit(
                                                              `/items/${item.id}`,
                                                          )
                                                      }
                                                  >
                                                      <Eye className="h-4 w-4" />
                                                  </Button>
                                              )}
                                              {auth.permissions?.includes(
                                                  'can edit item',
                                              ) && (
                                                  <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-8 w-8"
                                                      disabled={
                                                          item.date_out != null
                                                      }
                                                      onClick={() =>
                                                          router.visit(
                                                              `/items/${item.id}/edit`,
                                                          )
                                                      }
                                                  >
                                                      <Pencil className="h-4 w-4" />
                                                  </Button>
                                              )}
                                              <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => {
                                                      setSelectedItem(item);
                                                      setMoveDialogOpen(true);
                                                  }}
                                              >
                                                  <MoveDiagonal className="h-4 w-4" />
                                              </Button>
                                          </div>
                                      </TableCell>
                                  </TableRow>
                              ))
                          )}
                      </TableBody>
                  </Table>
              </div>

              {/* Cards - Mobile/Tablet */}
              <div className="space-y-4 lg:hidden">
                  {items.data.length === 0 ? (
                      <Card>
                          <CardContent className="py-12">
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                  <Search className="mb-2 h-8 w-8" />
                                  <p className="font-medium">No items found</p>
                                  <p className="text-sm">
                                      Try adjusting your search or filters
                                  </p>
                              </div>
                          </CardContent>
                      </Card>
                  ) : (
                      items.data.map((item) => (
                          <Card
                              key={item.id}
                              className="transition-shadow hover:shadow-md"
                          >
                              <CardContent className="pt-6">
                                  <div className="space-y-4">
                                      {/* Header */}
                                      <div className="flex items-start justify-between gap-4">
                                          <div className="min-w-0 flex-1">
                                              <h3 className="truncate text-base font-semibold">
                                                  {item.model}
                                              </h3>
                                              <p className="line-clamp-2 text-sm text-muted-foreground">
                                                  {item.description}
                                              </p>
                                          </div>
                                          <Badge
                                              variant={
                                                  item.date_out
                                                      ? 'secondary'
                                                      : 'default'
                                              }
                                              className="shrink-0"
                                          >
                                              {item.date_out
                                                  ? 'Unavailable'
                                                  : 'Available'}
                                          </Badge>
                                      </div>

                                      {/* Details Grid */}
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div>
                                              <p className="mb-1 text-xs text-muted-foreground">
                                                  Serial
                                              </p>
                                              <p className="font-medium">
                                                  {item.serial}
                                              </p>
                                          </div>
                                          <div>
                                              <p className="mb-1 text-xs text-muted-foreground">
                                                  Unit Cost
                                              </p>
                                              <p className="font-mono">
                                                  {formatCurrency(
                                                      item.unit_cost,
                                                  )}
                                              </p>
                                          </div>
                                          <div>
                                              <p className="mb-1 text-xs text-muted-foreground">
                                                  Quantity
                                              </p>
                                              <Badge
                                                  variant={
                                                      item.quantity > 5
                                                          ? 'default'
                                                          : item.quantity > 0
                                                            ? 'secondary'
                                                            : 'destructive'
                                                  }
                                                  className="w-fit"
                                              >
                                                  {item.quantity}
                                              </Badge>
                                          </div>
                                          <div>
                                              <p className="mb-1 text-xs text-muted-foreground">
                                                  Purchase Date
                                              </p>
                                              <p>
                                                  {formatDate(
                                                      item.date_of_purchase,
                                                  )}
                                              </p>
                                          </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-2 border-t pt-2">
                                          {auth.permissions?.includes(
                                              'can view item details',
                                          ) && (
                                              <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="flex-1"
                                                  onClick={() =>
                                                      router.visit(
                                                          `/items/${item.id}`,
                                                      )
                                                  }
                                              >
                                                  <Eye className="mr-2 h-4 w-4" />
                                                  View
                                              </Button>
                                          )}
                                          {auth.permissions?.includes(
                                              'can edit item',
                                          ) && (
                                              <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="flex-1"
                                                  disabled={
                                                      item.date_out != null
                                                  }
                                                  onClick={() =>
                                                      router.visit(
                                                          `/items/${item.id}/edit`,
                                                      )
                                                  }
                                              >
                                                  <Pencil className="mr-2 h-4 w-4" />
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

          <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Move Item</DialogTitle>
                      <DialogDescription>
                          Select a new location and add remarks for moving this
                          item.
                      </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleMoveSubmit}>
                      <div className="space-y-4 py-4">
                          <div className="space-y-2">
                              <Label htmlFor="location">Location *</Label>
                              <Select
                                  value={moveForm.data.location_id}
                                  onValueChange={(value) =>
                                      moveForm.setData('location_id', value)
                                  }
                              >
                                  <SelectTrigger id="location">
                                      <SelectValue placeholder="Select location" />
                                  </SelectTrigger>
                                  <SelectContent>
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
                              {moveForm.errors.location_id && (
                                  <p className="text-sm text-destructive">
                                      {moveForm.errors.location_id}
                                  </p>
                              )}
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="remarks">Remarks</Label>
                              <Textarea
                                  id="remarks"
                                  placeholder="Add any remarks about this move..."
                                  value={moveForm.data.remarks}
                                  onChange={(e) =>
                                      moveForm.setData(
                                          'remarks',
                                          e.target.value,
                                      )
                                  }
                                  rows={3}
                              />
                              {moveForm.errors.remarks && (
                                  <p className="text-sm text-destructive">
                                      {moveForm.errors.remarks}
                                  </p>
                              )}
                          </div>
                      </div>

                      <DialogFooter>
                          <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                  setMoveDialogOpen(false);
                                  moveForm.reset();
                                  setSelectedItem(null);
                              }}
                          >
                              Cancel
                          </Button>
                          <Button type="submit" disabled={moveForm.processing}>
                              {moveForm.processing ? 'Moving...' : 'Move Item'}
                          </Button>
                      </DialogFooter>
                  </form>
              </DialogContent>
          </Dialog>
      </AppLayout>
  );
}