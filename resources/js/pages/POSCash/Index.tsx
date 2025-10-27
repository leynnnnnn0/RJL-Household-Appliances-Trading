import { useCallback, useState } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Menu, History, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { debounce } from 'lodash';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { router } from '@inertiajs/react';
import axios from 'axios';

interface Product {
  supplier: string;
  description: string;
  serial: string;
  model: string;
  srp: number;
  unit_cost: string;
}

interface Employee {
  id: number;
  name: string;
}

interface Order {
  id: number;
  product: Product;
  employee: Employee;
  saleAmount: number;
  timestamp: string;
  date: string;
}

const employees: Employee[] = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Mike Johnson" },
  { id: 4, name: "Sarah Williams" }
];

export default function Index() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [saleAmount, setSaleAmount] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [allTransactions, setAllTransactions] = useState<Order[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

  const peformSearch = async (value: string) => {
    axios.get('/api/items', { params: { search: value } })
        .then(response => {
           console.log(response.data.data);
           const items = response.data?.data || [];
            if(items.length > 0){
              setFilteredProducts(items);
              setShowDropdown(true);
            }
        })
        .catch(error => {
          console.error("Error fetching products:", error);
        });
  }

  const debouncedSearch = useCallback(debounce((value: string) => {
    peformSearch(value);
  }, 500), []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if(value.trim().length === 0) {
          setFilteredProducts([]);
          setShowDropdown(false);
          return;
    };
    debouncedSearch(value);   
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.description);
    setSaleAmount(product.srp.toString());
    setShowDropdown(false);
  };

  const handleAddOrder = () => {
    if (selectedProduct && selectedEmployee && saleAmount) {
      const now = new Date();
      const newOrder: Order = {
        id: Date.now(),
        product: selectedProduct,
        employee: employees.find(e => e.id === parseInt(selectedEmployee))!,
        saleAmount: parseFloat(saleAmount),
        timestamp: now.toLocaleString(),
        date: now.toISOString().split('T')[0]
      };
      setOrders([newOrder, ...orders]);
      setAllTransactions([newOrder, ...allTransactions]);
      
      setSelectedProduct(null);
      setSearchTerm("");
      setSelectedEmployee("");
      setSaleAmount("");
    }
  };

  const handleRemoveOrder = (orderId: number) => {
    setOrders(orders.filter(order => order.id !== orderId));
  };

  const totalSales = orders.reduce((sum, order) => sum + order.saleAmount, 0);

  const getFilteredTransactions = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    switch (dateFilter) {
      case 'today':
        return allTransactions.filter(t => t.date === today);
      case 'yesterday':
        return allTransactions.filter(t => t.date === yesterday);
      case 'week':
        return allTransactions.filter(t => t.date >= weekAgo);
      case 'all':
        return allTransactions;
      default:
        return allTransactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();
  const filteredTotal = filteredTransactions.reduce((sum, t) => sum + t.saleAmount, 0);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
            <p className="text-muted-foreground text-sm">Search products and process sales</p>
          </div>
        </a>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Transaction History</SheetTitle>
              <SheetDescription>View sales summary and transaction details</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 p-5">
              {/* Filter */}
              <div className="space-y-2">
                <Label>Filter by Date</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Transactions</CardDescription>
                    <CardTitle className="text-3xl">{filteredTransactions.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <History className="h-3 w-3" />
                      <span>{dateFilter === 'today' ? 'Today' : dateFilter === 'yesterday' ? 'Yesterday' : dateFilter === 'week' ? 'Last 7 days' : 'All time'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Sales</CardDescription>
                    <CardTitle className="text-3xl">₱{filteredTotal.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>Revenue generated</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Transaction List */}
              <div className="space-y-3">
                <h3 className="font-semibold">Recent Transactions</h3>
                {filteredTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map(transaction => (
                      <Card key={transaction.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{transaction.product.description}</p>
                                <p className="text-sm text-muted-foreground truncate">{transaction.product.serial}</p>
                              </div>
                              <p className="font-semibold ml-2">₱{transaction.saleAmount.toLocaleString()}</p>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Sold by</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {transaction.employee.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date & Time</p>
                                <p className="font-medium text-xs">{transaction.timestamp}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle>Product Search</CardTitle>
              <CardDescription>Search by description or serial number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
                {showDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                    {filteredProducts.map(product => (
                      <div
                        key={product.serial}
                        onClick={() => handleProductSelect(product)}
                        className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium">{product.description}</div>
                        <div className="text-sm text-muted-foreground">{product.serial}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Supplier</Label>
                      <p className="font-medium">{selectedProduct.supplier}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Serial Number</Label>
                      <p className="font-medium">{selectedProduct.serial}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <p className="font-medium">{selectedProduct.description}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Model</Label>
                      <p className="font-medium">{selectedProduct.model}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Unit Cost</Label>
                      <p className="font-semibold">₱{selectedProduct.unit_cost.toLocaleString()}</p>
                    </div>
                      <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">SRP</Label>
                      <p className="font-semibold">₱{selectedProduct.srp.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sale Details */}
          <Card>
            <CardHeader>
              <CardTitle>Sale Details</CardTitle>
              <CardDescription>Select employee and enter sale amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Sale Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleAddOrder}
                disabled={!selectedProduct || !selectedEmployee || !saleAmount}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Orders
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Orders</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {orders.length} {orders.length === 1 ? 'item' : 'items'}
                </span>
              </CardTitle>
              <CardDescription>
                Total: ₱{totalSales.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-auto">
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{order.product.description}</p>
                          <p className="text-xs text-muted-foreground truncate">{order.product.serial}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOrder(order.id)}
                          className="h-8 w-8 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Separator />
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sold by:</span>
                          <span className="font-medium">{order.employee.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold">₱{order.saleAmount.toLocaleString()}</span>
                        </div>
                        <div className="text-muted-foreground">{order.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}