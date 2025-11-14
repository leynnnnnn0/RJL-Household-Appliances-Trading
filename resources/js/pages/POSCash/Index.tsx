import { useCallback, useEffect, useState } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Menu, History, TrendingUp, Users, X, Loader2 } from 'lucide-react';
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
import { router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Location, User, OrderWithrelations, Customer } from '@/types';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Product {
  id: string;
  supplier: string;
  description: string;
  serial: string;
  model: string;
  srp: number;
  unit_cost: string;
}


interface Order {
  id: string;
  product: Product;
  employee: User;
  saleAmount: number;
  timestamp: string;
  date: string;
}

interface PageProps {
  employees: User[];
  locations: Location[];
  transactions: OrderWithrelations[]
}

export default function Index({locations, employees, transactions} : PageProps) {
  const {auth} = usePage().props as any;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(auth.user.id.toString());
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0].id.toString());
  const [saleAmount, setSaleAmount] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [allTransactions, setAllTransactions] = useState<Order[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [salesAmountError, setSalesAmountError] = useState<string>("");
  const [customerLastName, setCustomerLastName] = useState<string>("");
  const [customerFirstName, setCustomerFirstName] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [receiptNumber, setReceiptNumber] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFree, setIsFree] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState<boolean>(false);
  const [existingCustomerId, setExistingCustomerId] = useState<null | string |number>();
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState<boolean>(false);

  const peformSearch = async (value: string, locationId: string) => {
    if(value.trim().length === 0) {
      setFilteredProducts([]);
      setShowDropdown(false);
      setIsLoadingProducts(false);
      return;
    };
    setIsLoadingProducts(true);
    axios.get('/api/items', { params: { search: value, location: locationId } })
      .then(response => {
        console.log(response);
        const items = response.data?.data || [];
        setFilteredProducts(items);
        setShowDropdown(true);
        setIsLoadingProducts(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setFilteredProducts([]);
        setShowDropdown(false);
        setIsLoadingProducts(false);
      });
  }

  const debouncedSearch = useCallback(debounce((value: string, locationId: string) => {
    peformSearch(value, locationId);
  }, 500), []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim().length > 0) {
      setIsLoadingProducts(true);
    }
    debouncedSearch(value, selectedLocation);   
  };

  useEffect(() => {
      setShowDropdown(false);
  },[selectedLocation])

  useEffect(() => {
    if(isFree) setSaleAmount("0");
    else setSaleAmount("");
  },[isFree])

  useEffect(() => {
    if(paymentMethod == 'Cash') setReferenceNumber("");
  }, [paymentMethod])

  const handleProductSelect = (product: Product) => {
    console.log(orders);
    if(orders.some(item => item.id == product.serial) == true) {
      toast.info("This item is already on the order list");
      return;
    }
    setIsFree(false);
    setSelectedProduct(product);
    setSearchTerm(product.description);
    setSaleAmount(product.srp.toString());
    setShowDropdown(false);
  
  };

  const handleAddOrder = () => {
    if(!isFree && Number(saleAmount) < Number(selectedProduct?.unit_cost)){
      setSalesAmountError(`Amount should be higher than the unit cost. (${selectedProduct?.unit_cost})`);
      return;
    }else {
      setSalesAmountError("");
    }
    if (saleAmount && selectedProduct) {
      const now = new Date();
      const newOrder: Order = {
        id: selectedProduct.serial,
        product: selectedProduct,
        employee: employees.find(e => e.id === parseInt(selectedEmployee))!,
        saleAmount: parseFloat(saleAmount),
        timestamp: now.toLocaleString(),
        date: now.toISOString().split('T')[0]
      };
      setOrders([newOrder, ...orders]);
     
      
      
      setSelectedProduct(null);
      setSearchTerm("");
      setSaleAmount("");
    }
  };

  const handleRemoveOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id != orderId));
  };

    const totalSales = transactions
        .filter(order => !order.is_void)
        .reduce((sum, order) => sum + Number(order.total_price), 0);


     const orderTotal = orders.reduce((sum, order) => sum + Number(order.saleAmount), 0);


  const placeOrder = () => {
    setFormErrors({}); // Clear previous errors
    
    // Client-side validation for reference number
    if (paymentMethod !== 'Cash' && !referenceNumber.trim()) {
      setFormErrors({ reference_number: 'Reference number is required for non-cash payments' });
      toast.error("Please provide a reference number for non-cash payments.");
      return;
    }
    
    router.post('/pos-cash', {
      location_id: selectedLocation,
      employee_id: selectedEmployee,
      first_name: customerFirstName,
      last_name: customerLastName,
      address: customerAddress,
      receipt_number: receiptNumber,
      phone: customerPhone,
      payment_method: paymentMethod,
      reference_number: referenceNumber,
      existing_customer_id: existingCustomerId,
      orders: orders.map(function(item){
        return {
          id: item.product.id,
          serial: item.product.serial,
          sale_amount: item.saleAmount
        };
      }),
      total_price: orderTotal
    }, {
      onSuccess: () => {
        toast.success("Order Created");
        setOrders([]);
        setCustomerFirstName("");
        setCustomerLastName("");
        setCustomerAddress("");
        setCustomerPhone("");
        setPaymentMethod("Cash");
        setReferenceNumber("");
        setFormErrors({});
        setIsDialogOpen(false);

        setSelectedProduct(null);
        setSaleAmount("");
        setSearchQuery("");
        setSelectedCustomer(null);
        setExistingCustomerId("");
        setIsExistingCustomer(false);
      },
      onError: (e) => {
        if (e && typeof e === 'object') {
          setFormErrors(e as Record<string, string>);
        }
        toast.error("Please fix the errors in the form.");
        console.log(e);
      }
    });
}

const clearCustomer = () => {
  setCustomerFirstName('');
  setCustomerLastName('');
  setCustomerPhone('');
  setCustomerAddress('');
  setExistingCustomerId(null);
  setIsExistingCustomer(false);
  setSearchQuery("");
}

const selectCustomer = (customer : Customer) => {
  setCustomerFirstName(customer.first_name);
  setCustomerLastName(customer.last_name);
  setCustomerAddress(customer.address);
  setCustomerPhone(customer.phone_number);
  setExistingCustomerId(customer.id);
  setShowResults(false);
  setSearchQuery("");
  setSearchResults([]);
  setIsExistingCustomer(true);
  setSearchQuery(`${customer.first_name} ${customer.last_name}`);
}

const handleSearchCustomer = (query: string) => {
  setSearchQuery(query);

  if(query.length > 1) {
    setIsLoadingCustomers(true);
    axios.get('/api/customers', {params: {search: query}})
    .then(response => {
      const customers = response.data?.data || [];
      setSearchResults(customers);
      setShowResults(true);
      setIsLoadingCustomers(false);
    })
    .catch(err => {
      console.log(err);
      setSearchResults([]);
      setIsLoadingCustomers(false);
    })
  } else {
    setShowResults(false);
    setIsLoadingCustomers(false);
  }
}



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
  const filteredTotal = transactions.reduce((sum, t) => sum + t.total_price, 0);

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
                  </SelectContent>
                </Select>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Transactions</CardDescription>
                    <CardTitle className="text-3xl">{transactions.length}</CardTitle>
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
                    <CardTitle className="text-3xl">₱{Number(totalSales).toLocaleString()}</CardTitle>
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
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                  </div>
                ) : (
                <div className="space-y-4">
  {transactions.map((item) => (
    <Accordion key={item.order_number} type="single" collapsible>
      <AccordionItem value={item.order_number} className="border rounded-lg overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
          <div className="flex justify-between items-center w-full pr-4">
            <span className="font-semibold text-gray-900">{item.order_number} {item.is_void ? <Badge>Voided</Badge> : ''}</span>
            <span className="text-sm text-gray-600">{item.transaction_date}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-4 bg-gray-50">
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Order Number:</span>
                  <p className="font-medium text-gray-900">{item.order_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">Transaction Date:</span>
                  <p className="font-medium text-gray-900">{item.transaction_date}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Price:</span>
                  <p className="font-medium text-gray-900">₱{item.total_price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="font-medium text-gray-900">{item.location.name}</p>
                </div>
              </div>
            </div>

              {/* Order Items */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {item.order_items.map((orderItem, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Description:</span>
                        <p className="font-medium text-gray-900">{orderItem.item.description}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Model:</span>
                        <p className="font-medium text-gray-900">{orderItem.item.model || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Serial:</span>
                        <p className="font-medium text-gray-900">{orderItem.serial}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Sale Amount:</span>
                        <p className="font-medium text-green-600">₱{orderItem.sale_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Item Type:</span>
                        <p className="font-medium text-gray-900">{orderItem.item.item_type}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Supplier:</span>
                        <p className="font-medium text-gray-900">{orderItem.item.supplier}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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
              <CardDescription>Search by description, model or serial number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                       
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                {isLoadingProducts && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground animate-spin" />
                )}
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
                {showDropdown && (
  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
    {isLoadingProducts ? (
      <div className="p-6 text-center">
        <Loader2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2 animate-spin" />
        <p className="text-sm text-muted-foreground">Searching products...</p>
      </div>
    ) : filteredProducts.length > 0 ? (
      filteredProducts.map(product => (
        <div
          key={product.serial}
          onClick={() => handleProductSelect(product)}
          className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
        >
          <div className="font-medium">{product.description}</div>
          <div className="text-sm text-muted-foreground">{product.model}</div>
        </div>
      ))
    ) : (
      <div className="p-6 text-center">
        <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No products found</p>
        <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
      </div>
    )}
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
                    {/* <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Unit Cost</Label>
                      <p className="font-semibold">₱{selectedProduct.unit_cost.toLocaleString()}</p>
                    </div> */}
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
              <CardDescription>Enter sale amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Sale Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={saleAmount}
                  disabled={isFree}
                  onChange={(e) => setSaleAmount(e.target.value)}
                />
                  {salesAmountError && (
                    <p className="text-sm text-destructive">{salesAmountError}</p>
                  )}
              </div>
                <div className="flex items-center gap-1">
                    <Checkbox checked={isFree} onCheckedChange={() => setIsFree(!isFree)}/>
                    <Label>Is free?</Label>
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
                Total: ₱{orderTotal.toLocaleString()}
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
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold">₱{order.saleAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SRP:</span>
                          <span>₱{order.product.srp.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount:</span>
                          <span className="text-green-600 font-medium">
                            ₱{(order.product.srp - order.saleAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogTrigger asChild>
    <Button disabled={orders.length == 0}  className='mt-5 w-full'>Place Order</Button>
  </DialogTrigger>
  <DialogContent className="max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Customer Information</DialogTitle>
      <DialogDescription>
        Please enter customer details and confirm the order.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
         <div className="space-y-2">
                <Label htmlFor="searchCustomer">Search Existing Customer</Label>
                <div className="relative">
                  <Input 
                    id="searchCustomer" 
                    placeholder="Type customer name..." 
                    value={searchQuery}
                    onChange={(e) => handleSearchCustomer(e.target.value)}
                    className={isExistingCustomer ? 'border-green-500' : ''}
                  />
                  {isLoadingCustomers && (
                    <Loader2 className="absolute right-9 top-3 h-4 w-4 text-muted-foreground animate-spin" />
                  )}
                  {isExistingCustomer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCustomer}
                      className="absolute right-1 top-1 h-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {showResults && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {isLoadingCustomers ? (
                        <div className="p-6 text-center">
                          <Loader2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-muted-foreground">Searching customers...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => selectCustomer(customer)}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          >
                            <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                            <p className="text-xs text-muted-foreground">{customer.phone_number}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No customers found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {isExistingCustomer && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    ✓ Existing customer selected
                  </p>
                )}
              </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
        <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
        <Input
          id="firstName"
          placeholder="Enter first name"
          value={customerFirstName}
          onChange={(e) => setCustomerFirstName(e.target.value)}
          className={formErrors.first_name ? 'border-red-500' : ''}
        />
        {formErrors.first_name && (
          <p className="text-sm text-red-500">{formErrors.first_name}</p>
        )}
      </div>
       <div className="space-y-2">
        <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
        <Input
          id="lastName"
          placeholder="Enter last name"
          value={customerLastName}
          onChange={(e) => setCustomerLastName(e.target.value)}
          className={formErrors.last_name ? 'border-red-500' : ''}
        />
        {formErrors.last_name && (
          <p className="text-sm text-red-500">{formErrors.last_name}</p>
        )}
      </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerAddress">Address <span className="text-red-500">*</span></Label>
        <Input
          id="customerAddress"
          placeholder="Enter customer address"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          className={formErrors.address ? 'border-red-500' : ''}
        />
        {formErrors.address && (
          <p className="text-sm text-red-500">{formErrors.address}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerPhone">Phone Number</Label>
        <Input
          id="customerPhone"
          placeholder="09XXXXXXXXX"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className={formErrors.phone ? 'border-red-500' : ''}
        />
        {formErrors.phone && (
          <p className="text-sm text-red-500">{formErrors.phone}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method <span className="text-red-500">*</span></Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger id="paymentMethod">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Gcash">Gcash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Debit/Credit Card">Debit/Credit Card</SelectItem>
                      <SelectItem value="Home Credit/Skyro/Billease">Home Credit/Skyro/Billease</SelectItem>
                    </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="referenceNumber">
          Reference Number 
          {paymentMethod !== 'Cash' && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="referenceNumber"
          placeholder={paymentMethod === 'Cash' ? 'Not required for cash' : 'Enter reference number'}
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          className={formErrors.reference_number ? 'border-red-500' : ''}
          disabled={paymentMethod === 'Cash'}
        />
        {formErrors.reference_number && (
          <p className="text-sm text-red-500">{formErrors.reference_number}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {paymentMethod === 'Cash' 
            ? 'Reference number not needed for cash payments' 
            : 'Required for non-cash payments (Gcash, Bank Transfer, etc.)'}
        </p>
      </div>

       <div className="space-y-2">
        <Label htmlFor="receiptNumber">
          Receipt Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="receiptNumber"
          placeholder='#0000000934'
          value={receiptNumber}
          
          onChange={(e) => setReceiptNumber(e.target.value)}
          className={formErrors.receipt_number ? 'border-red-500' : ''}
        />
        {formErrors.receipt_number && (
          <p className="text-sm text-red-500">{formErrors.receipt_number}</p>
        )}
      </div>

           <div className="grid grid-cols-2 gap-5">
                 <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select disabled value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

                <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>

    </div>
    <Button onClick={() => placeOrder()} disabled={orders.length == 0} className='w-full'>Confirm Order</Button>
  </DialogContent>
</Dialog>
                 
            </CardContent>
      
          </Card>
        </div>
      </div>
    </div>
  );
}