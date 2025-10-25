import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
import { Search, Eye, Pencil, Plus, Filter, X } from 'lucide-react';
import { Category, Item } from '@/types';
interface PageProps {
  categories: Category[];
  items: Item[];
}
export default function Index({ items, categories } : PageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesAvailability = 
        availabilityFilter === 'all'

      const matchesCategory = 
        categoryFilter === 'All' || 
        item.category === categoryFilter;

      return matchesSearch && matchesAvailability && matchesCategory;
    });
  }, [items, searchQuery, availabilityFilter, categoryFilter]);

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

  const hasActiveFilters = searchQuery || availabilityFilter !== 'all' || categoryFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setAvailabilityFilter('all');
    setCategoryFilter('All');
  };

  return (
    <AppLayout>
      <Head title="Items" />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Items</h1>
            <p className="text-muted-foreground mt-1">
              Manage your inventory items
            </p>
          </div>
          <Button onClick={() => router.visit("/items/create")} size="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

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

                  {/* Category Filter */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
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
                    <TableHead className="font-semibold">Model</TableHead>
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
                        <TableCell className="font-medium">{item.model}</TableCell>
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