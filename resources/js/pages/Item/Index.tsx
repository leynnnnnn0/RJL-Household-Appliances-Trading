import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
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
} from "@/components/ui/dropdown-menu"
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
import { Supplier, ItemWithRelations, Location } from '@/types';
interface PageProps {
  suppliers: Supplier[];
  items: ItemWithRelations[];
  locations: Location[];
}
export default function Index({ items, suppliers, locations } : PageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [itemTypeFilter, setitemTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const filteredItems = useMemo(() => {
  return items.filter(item => {
    const matchesSearch = 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAvailability = 
      availabilityFilter === 'all' || 
      (availabilityFilter === 'unavailable' ? item.date_out !== null : item.date_out === null);

    const matchesCategory = 
      categoryFilter === 'all' || 
      item.supplier.slug === categoryFilter;

    const matchesType = 
      itemTypeFilter === 'all' || 
      item.item_type === itemTypeFilter;

    const matchesLocation = 
      locationFilter === 'all' ||
      item.location?.id.toString() === locationFilter;

    return matchesSearch && matchesAvailability && matchesCategory && matchesType && matchesLocation;
  });
}, [items, searchQuery, availabilityFilter, categoryFilter, itemTypeFilter, locationFilter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const hasActiveFilters = searchQuery || availabilityFilter !== 'all' || categoryFilter !== 'all' || itemTypeFilter !== 'all' || locationFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setAvailabilityFilter('all');
    setCategoryFilter('all');
    setitemTypeFilter('all');
    setLocationFilter('all');
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.append('search', searchQuery);
    if (availabilityFilter !== 'all') params.append('availability', availabilityFilter);
    if (categoryFilter !== 'all') params.append('supplier', categoryFilter);
    if (itemTypeFilter !== 'all') params.append('item_type', itemTypeFilter);
    if (locationFilter !== 'all') params.append('location', locationFilter);
    
    window.location.href = `/items/export?${params.toString()}`;
  };


  return (
    <AppLayout>
      <Head title="Items" />
      
      <div className="p-6 space-y-6">
        <ModuleHeading title="Items" description="Manage your inventory items">
            <div className="flex items-center gap-3">
              <Button className='cursor-pointer' onClick={() => handleExport()}><Download/> Export</Button>
               <DropdownMenu>
  <DropdownMenuTrigger className='cursor-pointer flex gap-2 items-center bg-primary text-white text-sm px-4 py-2 rounded-lg'>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Select from options</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem className='cursor-pointer' onClick={() => router.visit('/items/create')}>

        Create Manually

    </DropdownMenuItem>
    <DropdownMenuItem className='cursor-pointer' onClick={() => router.visit('/items/create-from-import')}>
        Create from Excel
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
            </div>
          </ModuleHeading>



        {/* Modern Filters */}
        <Card className="border-muted">
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Search Bar - Full Width */}
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filters:</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 flex-1">
                    {/* Item Type */}
                  <Select value={itemTypeFilter} onValueChange={setitemTypeFilter}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="appliances">Appliances</SelectItem>
                      <SelectItem value="gadgets">Gadgets</SelectItem>
                       <SelectItem value="furniture">Furniture</SelectItem>
                    </SelectContent>
                  </Select>


                  {/* Availability Filter */}
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>

                      {/* Location Filter */}
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Location</SelectItem>
                         {locations.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Supplier Filter */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Suppliers</SelectItem>
                      {suppliers.map(supplier => (
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
                      className="h-9"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Results Count */}
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {filteredItems.length} of {items.length} items
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
          <div className="rounded-lg overflow-hidden border">
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
                  {filteredItems.length === 0 ? (
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
                    filteredItems.map((item) => (
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
                            {item.date_out ? 'Unavailable' : 'Available' }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => router.visit(`/items/${item.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => router.visit(`/items/${item.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
      </div>
    </AppLayout>
  );
}