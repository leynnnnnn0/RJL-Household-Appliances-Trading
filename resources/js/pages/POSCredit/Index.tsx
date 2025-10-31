import { useState } from 'react';
import { Menu, Plus, X, Upload, FileText, Users, Briefcase, Home, CreditCard, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import axios from 'axios';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

interface PaymentPlan {
  months: number;
  interestRate: number;
}

interface Product {
  id: string;
  supplier: string;
  description: string;
  serial: string;
  model: string;
  srp: number;
  unit_cost: string;
  item_type: 'furniture' | 'gadgets' | 'appliances';
}

interface SelectedProduct extends Product {
  downPayment: number;
  selectedTerm: number;
  noDownPayment?: boolean;
}

export default function Index() {
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [customPlans] = useState<PaymentPlan[]>([
    { months: 3, interestRate: 0 },
    { months: 6, interestRate: 0 },
    { months: 9, interestRate: 0 },
    { months: 12, interestRate: 0 }
  ]);
  const [employmentVerified, setEmploymentVerified] = useState<boolean>(false);
  
  // Customer search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemSearch, setItemSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Form states
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [employment, setEmployment] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  // Product and payment states
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [selectedTerm, setSelectedTerm] = useState<number>(3);
  const [noDownPayment, setNoDownPayment] = useState<boolean>(false);
  
  // Mock database - replace with actual API call
  const mockCustomers: Customer[] = [
    { id: '1', first_name: 'Juan', last_name: 'Dela Cruz', address: '123 Main St, Quezon City', phone_number: '0912 345 6789'},
    { id: '2', first_name: 'Maria', last_name: 'Santos', address: '456 Oak Ave, Manila', phone_number: '0923 456 7890'},
    { id: '3', first_name: 'Jose', last_name: 'Reyes', address: '789 Pine Rd, Makati', phone_number: '0934 567 8901'},
  ];
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      axios.get('/api/customers', {params: {search: searchQuery}})
      .then(response => {
        console.log(response);
        const customers = response.data?.data || [];
          setSearchResults(customers);
          setShowResults(true);
        });
      
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };
  
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsExistingCustomer(true);
    setFirstName(customer.first_name);
    setLastName(customer.last_name);
    setContact(customer.phone_number);
    setAddress(customer.address);
    setSearchQuery(`${customer.first_name} ${customer.last_name}`);
    setShowResults(false);
  };
  
  const clearCustomer = () => {
    setSelectedCustomer(null);
    setIsExistingCustomer(false);
    setFirstName('');
    setLastName('');
    setContact('');
    setAddress('');
    setEmployment('');
    setIncome('');
    setSearchQuery('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Calculate LCP (Loan Contract Pricing)
  const calculateLCP = (srp: number) => {
    return srp * 1.1 + 300;
  };

  // Get default down payment percentage based on item type
  const getDefaultDownPaymentPercent = (itemType?: string) => {
    if (itemType === 'furniture' || itemType === 'appliances') {
      return 0.15; // 15%
    }
    return 0.20; // 20% for cellphone and gadgets
  };

  // Calculate interest multiplier and fixed charges based on item type and term
  const getInterestConfig = (itemType: string | undefined, months: number) => {
    const type = itemType || 'furniture';
    console.log(itemType);
    const configs: Record<string, Record<number, { multiplier: number; fixedCharge: number }>> = {
      furniture: {
        3: { multiplier: 1.12, fixedCharge: 0 },
        6: { multiplier: 1.18, fixedCharge: 300 },
        9: { multiplier: 1.21, fixedCharge: 450 },
        12: { multiplier: 1.27, fixedCharge: 600 }
      },
      gadgets: {
        3: { multiplier: 1.10, fixedCharge: 0 },
        6: { multiplier: 1.27, fixedCharge: 300 },
        9: { multiplier: 1.3, fixedCharge: 450 },
        12: { multiplier: 1.33, fixedCharge: 600 }
      },
      appliances: {
        3: { multiplier: 1.12, fixedCharge: 0 },
        6: { multiplier: 1.18, fixedCharge: 300 },
        9: { multiplier: 1.21, fixedCharge: 450 },
        12: { multiplier: 1.27, fixedCharge: 600 }
      }
    };

    return configs[type]?.[months] || { multiplier: 1.12, fixedCharge: 0 };
  };

  // Calculate PNV (Promissory Note Value) and Final PNV
  const calculatePaymentBreakdown = () => {
    if (!selectedProduct) return null;

    const lcp = calculateLCP(selectedProduct.srp);
    const downPaymentAmount = noDownPayment ? 0 : downPayment;
    const pnv = lcp - downPaymentAmount;

    console.log(selectedProduct.item_type);
    
    const { multiplier, fixedCharge } = getInterestConfig(selectedProduct.item_type, selectedTerm);
    
    let finalPNV: number;
    if (noDownPayment) {
      // When no down payment, use LCP instead of PNV
      finalPNV = lcp * 1.33 + 600;
    } else {
      finalPNV = pnv * multiplier + fixedCharge;
    }
    console.log(pnv);
    console.log(multiplier);
    console.log(fixedCharge);
    console.log(finalPNV);

    const monthlyPayment = finalPNV / selectedTerm;
    const totalAmount = downPaymentAmount + finalPNV;
    const totalInterest = finalPNV - pnv;

    return {
      lcp,
      pnv,
      finalPNV,
      monthlyPayment,
      totalAmount,
      totalInterest,
      downPaymentAmount
    };
  };

  const handleProductSelect = (product: Product) => {
    const lcp = calculateLCP(product.srp);
    const downPaymentPercent = getDefaultDownPaymentPercent(product.item_type);
    const defaultDownPayment = Math.round(lcp * downPaymentPercent);
    
    setSelectedProduct({
      ...product,
      downPayment: defaultDownPayment,
      selectedTerm: selectedTerm,
      noDownPayment: false
    });
    setDownPayment(defaultDownPayment);
    setNoDownPayment(false);
    setSearchTerm(product.description);
    setShowDropdown(false);
  };

  const handleTermSelect = (months: number) => {
    setSelectedTerm(months);
    if (selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        selectedTerm: months
      });
    }
  };

  const handleDownPaymentChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setDownPayment(numValue);
    if (selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        downPayment: numValue
      });
    }
  };

  const handleNoDownPaymentToggle = (checked: boolean) => {
    setNoDownPayment(checked);
    if (checked) {
      setDownPayment(0);
      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          downPayment: 0,
          noDownPayment: true
        });
      }
    } else {
      if (selectedProduct) {
        const lcp = calculateLCP(selectedProduct.srp);
        const downPaymentPercent = getDefaultDownPaymentPercent(selectedProduct.item_type);
        const defaultDownPayment = Math.round(lcp * downPaymentPercent);
        setDownPayment(defaultDownPayment);
        setSelectedProduct({
          ...selectedProduct,
          downPayment: defaultDownPayment,
          noDownPayment: false
        });
      }
    }
  };

  const calculateMonthlyAmount = () => {
    const breakdown = calculatePaymentBreakdown();
    return breakdown ? breakdown.monthlyPayment : 0;
  };

  const handleProductSearch = (value: string) => {
    setSearchTerm(value);
      axios.get('/api/items', { params: { search: value } })
    .then(response => {
      console.log(response);
      const items = response.data?.data || [];
      setFilteredProducts(items);
      setShowDropdown(true); 
    })
    .catch(error => {
      console.error("Error fetching products:", error);
      setFilteredProducts([]);
      setShowDropdown(false);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Credit Approval System</h1>
              <p className="text-muted-foreground text-xs">Installment Setup</p>
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
                <SheetTitle>Quick Actions</SheetTitle>
                <SheetDescription>Manage applications and view history</SheetDescription>
              </SheetHeader>

              <div className="p-5 space-y-4">
   
                <Separator  />
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Today's Applications</h3>
                  <div className="space-y-2">
                    <Card className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Juan Dela Cruz</p>
                          <p className="text-xs text-muted-foreground">₱25,000 - 6 months</p>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Maria Santos</p>
                          <p className="text-xs text-muted-foreground">₱15,000 - 3 months</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Approved</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Credit Approval & Installment Setup</h2>
          <p className="text-muted-foreground">Complete the form to process a new installment application</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
                 {/* Item & Payment Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Item & Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Search */}
              <div className="space-y-2">
                <Label>Search Product *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    className="pl-9"
                  />
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                          <div
                            key={product.serial}
                            onClick={() => handleProductSelect(product)}
                            className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          >
                            <div className="font-medium">{product.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.model} • Serial: {product.serial}
                            </div>
                            <div className="text-sm font-semibold text-primary mt-1">
                              ₱{product.srp.toLocaleString()}
                            </div>
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
              </div>

              {/* Selected Product Details */}
              {selectedProduct && (
                <>
                  <Separator />
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Selected Product</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="font-medium">{selectedProduct.description}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Model</p>
                        <p className="font-medium">{selectedProduct.model}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Serial Number</p>
                        <p className="font-medium">{selectedProduct.serial}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Supplier</p>
                        <p className="font-medium">{selectedProduct.supplier}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Item Type</p>
                        <p className="font-medium capitalize">{selectedProduct.item_type || 'furniture'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unit Cost</p>
                        <p className="font-medium">₱{parseFloat(selectedProduct.unit_cost).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">SRP</p>
                        <p className="text-lg font-bold text-primary">₱{selectedProduct.srp.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">LCP (Loan Contract Price)</p>
                        <p className="text-lg font-bold text-blue-600">₱{calculateLCP(selectedProduct.srp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(null);
                        setSearchTerm('');
                        setDownPayment(0);
                        setNoDownPayment(false);
                      }}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Selection
                    </Button>
                  </div>

                  <Separator />

                  {/* Payment Terms */}
                  <div className="space-y-4">
                    <div>
                      <Label>Payment Term *</Label>
                      <div className="grid grid-cols-4 gap-3 mt-2">
                        {customPlans.map((plan) => (
                          <Card 
                            key={plan.months} 
                            className={`p-3 cursor-pointer hover:border-primary transition-colors ${
                              selectedTerm === plan.months ? 'border-primary bg-primary/5' : ''
                            }`}
                            onClick={() => handleTermSelect(plan.months)}
                          >
                            <div className="text-center space-y-1">
                              <p className="text-2xl font-bold">{plan.months}</p>
                              <p className="text-xs text-muted-foreground">months</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* No Down Payment Option */}
                    <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Checkbox 
                        id="noDownPayment" 
                        checked={noDownPayment}
                        onCheckedChange={handleNoDownPaymentToggle}
                      />
                      <Label 
                        htmlFor="noDownPayment" 
                        className="text-sm font-medium cursor-pointer"
                      >
                        No Down Payment (Special Option)
                      </Label>
                    </div>

                    {/* Down Payment */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="downPayment">Down Payment *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                          <Input 
                            id="downPayment" 
                            type="number" 
                            placeholder="0" 
                            className="pl-7" 
                            value={downPayment}
                            onChange={(e) => handleDownPaymentChange(e.target.value)}
                            disabled={noDownPayment}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {noDownPayment ? 'No down payment applied' : 'Initial payment'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>PNV (Promissory Note Value)</Label>
                        <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                          <span className="font-semibold">
                            ₱{calculatePaymentBreakdown()?.pnv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          LCP - Down Payment
                        </p>
                      </div>
                    </div>

                    {/* Monthly Payment Summary */}
                    {(() => {
                      const breakdown = calculatePaymentBreakdown();
                      if (!breakdown) return null;

                      return (
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                                <p className="text-3xl font-bold text-primary">
                                  ₱{breakdown.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-xl font-semibold">
                                  ₱{breakdown.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-muted-foreground">LCP (Loan Contract Price)</p>
                                <p className="font-semibold">₱{breakdown.lcp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">PNV (Promissory Note)</p>
                                <p className="font-semibold">₱{breakdown.pnv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Term</p>
                                <p className="font-semibold">{selectedTerm} months</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Down Payment</p>
                                <p className="font-semibold">₱{breakdown.downPaymentAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total Interest</p>
                                <p className="font-semibold">
                                  ₱{breakdown.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                            {noDownPayment && (
                              <>
                                <Separator className="my-3" />
                                <p className="text-xs text-amber-600 font-medium">
                                  ⚠ No down payment option: Special 12-month rate applied (1.33x + ₱600)
                                </p>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="searchCustomer">Search Existing Customer</Label>
                <div className="relative">
                  <Input 
                    id="searchCustomer" 
                    placeholder="Type customer name..." 
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={isExistingCustomer ? 'border-green-500' : ''}
                  />
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
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => selectCustomer(customer)}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                          <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone_number}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {isExistingCustomer && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    ✓ Existing customer selected
                  </p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Juan" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isExistingCustomer}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Dela Cruz" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isExistingCustomer}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input 
                  id="contact" 
                  placeholder="0912 345 6789" 
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  disabled={isExistingCustomer}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea 
                  id="address" 
                  placeholder="Street, Barangay, City, Province"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isExistingCustomer}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment">Employment/Source of Income *</Label>
                <Input 
                  id="employment" 
                  placeholder="Company name or business" 
                  value={employment}
                  onChange={(e) => setEmployment(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                  <Input 
                    id="income" 
                    type="number" 
                    placeholder="15,000" 
                    className="pl-7" 
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

         <div className='space-y-4'>
           {/* References */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                References
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Reference 1</h3>
                <div className="space-y-2">
                  <Label htmlFor="ref1Name">Name *</Label>
                  <Input id="ref1Name" placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ref1Contact">Contact *</Label>
                  <Input id="ref1Contact" placeholder="0912 345 6789" />
                </div>
              </div>
            </CardContent>
          </Card>

            {/* Investigation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Investigation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visitDate">Home Visit Date *</Label>
                <Input id="visitDate" type="date" defaultValue="2025-10-25" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investigator">Investigator Name *</Label>
                <Input id="investigator" placeholder="Field staff name" />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="verified" 
                  checked={employmentVerified}
                  onCheckedChange={(checked) => setEmploymentVerified(checked as boolean)}
                />
                <Label 
                  htmlFor="verified" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Employment Verified
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Investigation Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add notes about the customer, home visit, references verification, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
         </div>

           {/* Additional Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Documents
              </CardTitle>
              <CardDescription>Upload supporting documents (PNG, JPG, PDF up to 10MB each)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileUpload}
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({uploadedFiles.length})</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

   
        
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="lg">
            Save as Draft
          </Button>
          <Button size="lg" className="min-w-40">
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}