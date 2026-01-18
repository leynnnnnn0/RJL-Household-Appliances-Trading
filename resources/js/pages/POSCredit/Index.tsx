import { useState, useEffect } from 'react';
import { Menu, Plus, X, Upload, FileText, Users, Briefcase, Home, CreditCard, Search, AlertCircle, Loader2, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { CustomerReference, InvenstigationDetail } from '@/types';
import { set } from 'lodash';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string;
  source_of_income?: string;
  monthly_income?: string;
  reference?: CustomerReference;
  investigation_detail?: InvenstigationDetail;
  email: string | null;
  zipcode: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;  
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
  isFree: boolean
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  remarks: string | null;
}

interface InterestConfig {
  multiplier: number;
  fixedCharge: number;
}

interface PageProps {
  locations: Location[];
  employees: Employee[];
  transactions: {
    order_number: string;
    customer: string;
    term: string;
  }[];
}

export default function Index({ locations, employees, transactions }: PageProps) {
    const [isPullOutItems, setIsPullOutItems] = useState<boolean>(false);
    const [editedSRPs, setEditedSRPs] = useState<Record<string, number>>({});

    const handlePullOutToggle = (checked: boolean) => {
        setIsPullOutItems(checked);
        if (!checked) {
            // Clear all selected products when unchecking pull-out
            setSelectedProducts([]);
            setEditedSRPs({});
            setSearchTerm('');
        }
    };
    const handleSRPChange = (productId: string, newSRP: string) => {
        const numValue = parseFloat(newSRP) || 0;
        setEditedSRPs((prev) => ({
            ...prev,
            [productId]: numValue,
        }));

        // Update the selected product's SRP
        setSelectedProducts((prev) =>
            prev.map((item) =>
                item.id === productId ? { ...item, srp: numValue } : item,
            ),
        );
    };
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [interestConfigOpen, setInterestConfigOpen] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [customPlans] = useState<PaymentPlan[]>([
    { months: 3, interestRate: 0 },
    { months: 6, interestRate: 0 },
    { months: 9, interestRate: 0 },
    { months: 12, interestRate: 0 }
  ]);
  const [employmentVerified, setEmploymentVerified] = useState<boolean>(false);

  const [noInterestRate, setNoInterestRate] = useState<boolean>(false);


  const [itemSearch, setItemSearch] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [employment, setEmployment] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const [ref1Name, setRef1Name] = useState<string>('');
  const [ref1Contact, setRef1Contact] = useState<string>('');

  const [visitDate, setVisitDate] = useState<string>('');
  const [investigatorId, setInvestigatorId] = useState<string>('');
  const [investigationNotes, setInvestigationNotes] = useState<string>('');

  const [idPresented, setIdPresented] = useState<string>('');
  const [idNumber, setIdNumber] = useState<string>('');
  const [civilStatus, setCivilStatus] = useState<string>('');
  const [spouseName, setSpouseName] = useState<string>('');
  const [spouseContactNumber, setSpouseContactNumber] = useState<string>('');

  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[] | []>([]);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [selectedTerm, setSelectedTerm] = useState<number>(3);
  const [noDownPayment, setNoDownPayment] = useState<boolean>(false);

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [modeOfPayment, setModeOfPayment] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  const [isLoadingCustomers, setIsLoadingCustomers] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerCity, setCustomerCity] = useState<string>('');
  const [customerProvince, setCustomerProvince] = useState<string>('');
  const [customerZipcode, setCustomerZipcode] = useState<string>('');
  const [customerCountry, setCustomerCountry] = useState<string>('PHILIPPINES');

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const [transactionDate, setTransactionDate] = useState<string>(getTodayDate());

  // LCP Configuration state
  const [lcpMarkupRate, setLcpMarkupRate] = useState<number>(1.1);
  const [lcpAdditionalCharge, setLcpAdditionalCharge] = useState<number>(300);

  // Interest configuration state
  const [interestConfigs, setInterestConfigs] = useState<Record<string, Record<number, InterestConfig>>>({
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
  });

  const [tempInterestConfigs, setTempInterestConfigs] = useState(interestConfigs);
  const [tempLcpMarkupRate, setTempLcpMarkupRate] = useState(lcpMarkupRate);
  const [tempLcpAdditionalCharge, setTempLcpAdditionalCharge] = useState(lcpAdditionalCharge);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      setIsLoadingCustomers(true);
      axios.get('/api/customers', {params: {search: query}})
      .then(response => {
        const customers = response.data?.data || [];
        setSearchResults(customers);
        setShowResults(true);
        setIsLoadingCustomers(false);
      })
      .catch(error => {
        console.error("Error fetching customers:", error);
        setSearchResults([]);
        setIsLoadingCustomers(false);
      });
    } else {
      setSearchResults([]);
      setShowResults(false);
      setIsLoadingCustomers(false);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsExistingCustomer(true);
    setFirstName(customer.first_name);
    setLastName(customer.last_name);
    setContact(customer.phone_number);
    setAddress(customer.address);
    setEmployment(customer.source_of_income || '');
    setIncome(customer.monthly_income || '');
    setSearchQuery(`${customer.first_name} ${customer.last_name}`);
    setCustomerEmail(customer.email ?? '');
    setCustomerCity(customer.city ?? '');
    setCustomerProvince(customer.province ?? '');
    setCustomerZipcode(customer.zipcode ?? '');
    setCustomerCountry(customer.country ?? '');
    setShowResults(false);

    if (customer.reference?.id) {
      setRef1Name(customer.reference?.full_name);
      setRef1Contact(customer.reference?.phone_number);
    }

    if (customer.investigation_detail?.id) {
      setVisitDate(customer.investigation_detail?.home_visit_date);
      setEmploymentVerified(customer.investigation_detail?.is_employment_verified);
      setInvestigationNotes(customer.investigation_detail?.investigation_notes);
      setInvestigatorId(customer.investigation_detail?.employee_id?.toString());

      setIdPresented(customer.investigation_detail?.id_presented ?? '');
      setIdNumber(customer.investigation_detail?.id_number ?? '');
      setCivilStatus(customer.investigation_detail?.civil_status ?? '');
      setSpouseName(customer.investigation_detail?.spouse_name ?? '');
      setSpouseContactNumber(
          customer.investigation_detail?.spouse_contact_number ?? '',
      );
    }
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
    setRef1Name('');
    setRef1Contact('');
    setVisitDate('');
    setInvestigatorId('');
    setEmploymentVerified(false);
    setInvestigationNotes('');
    setCustomerEmail("");
    setCustomerCity("");
    setCustomerProvince("");
    setCustomerZipcode("");
    setCustomerCountry("");

    setIdPresented('');
    setIdNumber('');
    setCivilStatus('');
    setSpouseName('');
    setSpouseContactNumber('');
  };

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      file: file 
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

  const calculateLCP = (srp: number) => {
    return srp * lcpMarkupRate + lcpAdditionalCharge;
  };

  const getDefaultDownPaymentPercent = (itemType?: string) => {
    if (itemType === 'furniture' || itemType === 'appliances') {
      return 0.15;
    }
    return 0.20;
  };

  const getInterestConfig = (itemType: string | undefined, months: number) => {
    const type = itemType || 'furniture';
    return interestConfigs[type]?.[months] || { multiplier: 1.12, fixedCharge: 0 };
  };

 const calculatePaymentBreakdown = () => {
  if (!selectedProducts) return null;

  const paidProducts = selectedProducts.filter(item => !item.isFree);
  if(paidProducts.length == 0) return;

  const lcp = totalLCP;
  const downPaymentAmount = noDownPayment ? 0 : downPayment;
  const pnv = lcp - downPaymentAmount;

  const { multiplier, fixedCharge } = getInterestConfig(selectedProducts[0].item_type, selectedTerm);

  let finalPNV: number;
  
  // Check if no interest rate is applied
  if (noInterestRate) {
    // No interest: Final PNV equals PNV (no multiplier or fixed charge)
    finalPNV = pnv;
  } else if (noDownPayment) {
    // No down payment option: Special rate
    finalPNV = lcp * 1.33 + 600;
  } else {
    // Standard calculation with interest
    finalPNV = pnv * multiplier + fixedCharge;
  }

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
    downPaymentAmount,
    multiplier,
    fixedCharge
  };
};

  const [totalLCP, setTotalLCP] = useState(0);

  const handleProductSelect = (product: Product) => {
      const lcp = calculateLCP(product.srp);
      const downPaymentPercent = getDefaultDownPaymentPercent(
          product.item_type,
      );
      const defaultDownPayment = Math.round(lcp * downPaymentPercent);

      setSelectedProducts((prev) => {
          const alreadyExists = prev.some((p) => p.id === product.id);

          if (alreadyExists) {
              return prev;
          }

          return [
              ...prev,
              {
                  ...product,
                  downPayment: 0,
                  selectedTerm: selectedTerm,
                  noDownPayment: false,
                  isFree: false,
              },
          ];
      });

      // Initialize edited SRP if pull-out mode
      if (isPullOutItems) {
          setEditedSRPs((prev) => ({
              ...prev,
              [product.id]: product.srp,
          }));
      }

      setSearchTerm('');
      setDownPayment(defaultDownPayment);
      setNoDownPayment(false);
      setShowDropdown(false);
  };

 useEffect(() => {
  if(selectedProducts.length == 0) return;
  
  // Filter out free items before calculating total
  const paidProducts = selectedProducts.filter(item => !item.isFree);
  
  const total = paidProducts.length > 0
    ? paidProducts.reduce((sum, item) => sum + Number.parseFloat(item.srp.toString()), 0)
    : 0;



  const lcp = total > 0 ? calculateLCP(total) : 0;

  setTotalLCP(Number.parseFloat(lcp.toFixed(2)));

  const downPaymentPercent = getDefaultDownPaymentPercent(selectedProducts[0].item_type);
  const defaultDownPayment = Math.round(lcp * downPaymentPercent);

  setDownPayment(defaultDownPayment);
  
}, [selectedProducts]);

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
    if(noInterestRate && checked) setNoInterestRate(false);
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

  const handleNoInterestRateToggle = (checked: boolean) => {
    setNoInterestRate(checked);
    if(noDownPayment && checked) setNoDownPayment(false);
    if(checked){
      setDownPayment(0);
      const paidProducts = selectedProducts.filter(item => !item.isFree);
  
    const total = paidProducts.length > 0
    ? paidProducts.reduce((sum, item) => sum + Number.parseFloat(item.srp.toString()), 0)
    : 0;
    
    setTotalLCP(total);
    
    }else {
       const paidProducts = selectedProducts.filter(item => !item.isFree);
  
  const total = paidProducts.length > 0
    ? paidProducts.reduce((sum, item) => sum + Number.parseFloat(item.srp.toString()), 0)
    : 0;



  const lcp = total > 0 ? calculateLCP(total) : 0;

  setTotalLCP(Number.parseFloat(lcp.toFixed(2)));

  const downPaymentPercent = getDefaultDownPaymentPercent(selectedProducts[0].item_type);
  const defaultDownPayment = Math.round(lcp * downPaymentPercent);

  setDownPayment(defaultDownPayment);
    }
  }

  const handleProductSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim().length > 0) {
      setIsLoadingProducts(true);
    }
    axios.get('/api/items', { params: { search: value, is_defaulted: isPullOutItems } })
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
  };

  const validateForm = () => {
    if(selectedProducts.length == 0){
      return "Please select an item to proceed";
    }
      const paidProducts = selectedProducts.filter(item => !item.isFree);
    if (paidProducts.length == 0) {
      return "Add at least one paid item.";
    }
    if (!firstName || !lastName) {
      return "Customer name is required";
    }
    if (!address) {
      return "Address is required";
    }
    if (!ref1Name || !ref1Contact) {
      return "Reference information is required";
    }
    if (!visitDate) {
      return "Home visit date is required";
    }
    if (!investigatorId) {
      return "Investigator must be selected";
    }
    if (!customerCity) {
      return "City is required";
    }
    if (!customerProvince) {
      return "Province is required";
    }
    if (!customerCountry) {
      return "Country is required";
    }
    return null;
  };

  const openDialog = () => {
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    setDialogOpen(true);
  };

  const validateDialogForm = () => {

    if (!receiptNumber) {
      return "Receipt number is required";
    }
    if (!selectedLocation) {
      return "Location is required";
    }
    const hasDownPayment = downPayment > 0;
    if (hasDownPayment) {
      if (!modeOfPayment) {
        return "Mode of payment is required when there is a down payment";
      }
      if (modeOfPayment !== 'Cash' && !referenceNumber) {
        return "Reference number is required for non-cash payments";
      }
    }
    return null;
  };

 const handleSubmit = async () => {
  const dialogError = validateDialogForm();
  if (dialogError) {
    setValidationError(dialogError);
    alert("Please make sure all the information needed is filled.");
    return;
  }

  setIsSubmitting(true);
  setValidationError('');

  const clearAllFields = () => {
    setSelectedCustomer(null);
    setIsExistingCustomer(false);
    setFirstName('');
    setLastName('');
    setContact('');
    setAddress('');
    setEmployment('');
    setIncome('');
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setRef1Name('');
    setRef1Contact('');
    setVisitDate('');
    setInvestigatorId('');
    setEmploymentVerified(false);
    setInvestigationNotes('');
    setSelectedProduct(null);
    setSelectedProducts([]);
    setDownPayment(0);
    setSelectedTerm(3);
    setNoDownPayment(false);
    setSearchTerm('');
    setFilteredProducts([]);
    setShowDropdown(false);
    setUploadedFiles([]);
    setSelectedLocation('');
    setModeOfPayment('');
    setReferenceNumber('');
    setValidationError('');
    setCustomerEmail("");
    setCustomerCity("");
    setCustomerProvince("");
    setCustomerZipcode("");
    setCustomerCountry("");
    setReceiptNumber('');
    setTotalLCP(0);
    setIdPresented('');
    setIdNumber('');
    setCivilStatus('');
    setSpouseName('');
    setSpouseContactNumber('');
  };

  const breakdown = calculatePaymentBreakdown();
  if (!breakdown) {
    setValidationError("Unable to calculate payment breakdown");
    setIsSubmitting(false);
    return;
  }

  // Prepare items data - only send paid items
  const paidProducts = selectedProducts.filter(item => !item.isFree);
  const freeProducts = selectedProducts.filter(item => item.isFree);

  if (paidProducts.length === 0) {
    setValidationError("At least one paid item is required");
    setIsSubmitting(false);
    return;
  }

  // Prepare the items array with their details
  const items = paidProducts.map(product => ({
    item_id: product.id,
    serial: product.serial,
    description: product.description,
    model: product.model,
    srp: product.srp,
    item_type: product.item_type
  }));

  // Prepare free items array
  const free_items = freeProducts.map(product => ({
    item_id: product.id,
    serial: product.serial,
    description: product.description,
    model: product.model,
    item_type: product.item_type
  }));

  router.post(
      '/pos-credit',
      {
          // Customer Information
          customer_id: isExistingCustomer ? selectedCustomer?.id : null,
          customer_first_name: firstName,
          customer_last_name: lastName,
          customer_phone_number: contact,
          customer_address: address,
          email: customerEmail,
          city: customerCity,
          province: customerProvince,
          zipcode: customerZipcode,
          country: customerCountry,
          customer_source_of_income: employment,
          customer_monthly_income: income,

          // Reference Information
          customer_reference_full_name: ref1Name,
          customer_reference_phone_number: ref1Contact,

          // Investigation Details
          home_visit_date: visitDate,
          investigator_id: investigatorId,
          is_employment_verified: employmentVerified,
          investigation_notes: investigationNotes,
          id_presented: idPresented,
          id_number: idNumber,
          civil_status: civilStatus,
          spouse_name: spouseName,
          spouse_contact_number: spouseContactNumber,

          // Payment Breakdown
          loan_contract_price: breakdown.lcp,
          lcp_markup_rate: noInterestRate ? 0 : lcpMarkupRate,
          lcp_additional_charge: noInterestRate ? 0 : lcpAdditionalCharge,
          down_payment: breakdown.downPaymentAmount,
          promisory_note_value: noInterestRate ? 0 : breakdown.pnv,
          number_of_terms: selectedTerm,
          promisory_note_value_interest: noInterestRate
              ? 0
              : breakdown.multiplier,
          promisory_note_value_interest_additional_charge: noInterestRate
              ? 0
              : breakdown.fixedCharge,

          // Items - Send as JSON string or array depending on your backend
          items: items,
          free_items: free_items,

          // Transaction Details
          location_id: selectedLocation,
          payment_method: modeOfPayment || null,
          reference_number: referenceNumber || null,
          receipt_number: receiptNumber || null,
          transaction_date: transactionDate,

          is_no_interest: noInterestRate,

          // Documents
          documents: uploadedFiles.map((f) => f.file),
      },
      {
          forceFormData: true,
          onSuccess: () => {
              toast.success('Installment Data Created.');
              setDialogOpen(false);
              clearAllFields();
          },
          onError: (e) => {
              setValidationError(
                  'An error occurred while creating the account',
              );
              console.log(e);
          },
          onFinish: () => {
              setIsSubmitting(false);
          },
      },
  );
};

  const updateInterestConfig = (itemType: string, term: number, field: 'multiplier' | 'fixedCharge', value: string) => {
    const numValue = parseFloat(value) || 0;
    setTempInterestConfigs(prev => ({
      ...prev,
      [itemType]: {
        ...prev[itemType],
        [term]: {
          ...prev[itemType][term],
          [field]: numValue
        }
      }
    }));
  };

  const saveInterestConfigs = () => {
    setInterestConfigs(tempInterestConfigs);
    setLcpMarkupRate(tempLcpMarkupRate);
    setLcpAdditionalCharge(tempLcpAdditionalCharge);
    setInterestConfigOpen(false);
    toast.success('Interest configurations saved successfully!');
  };

  const resetInterestConfigs = () => {
    const defaultConfigs = {
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
    setTempInterestConfigs(defaultConfigs);
    setTempLcpMarkupRate(1.1);
    setTempLcpAdditionalCharge(300);
  };

 const handleRemoveItem = (productId: string | number) => {
     setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
     setEditedSRPs((prev) => {
         const newEdited = { ...prev };
         delete newEdited[productId.toString()];
         return newEdited;
     });
 };

const setProductToFree = (id) => {
  setSelectedProducts(prevProducts =>
    prevProducts.map(item =>
      item.id === id 
        ? { ...item, isFree: !item.isFree }
        : item
    )
  );
};

  return (
      <div className="min-h-screen bg-background">
          <div className="border-b">
              <div className="container mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                  <a
                      href="/"
                      className="flex items-center gap-3 transition-opacity hover:opacity-80"
                  >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                          <CreditCard className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                          <h1 className="text-xl font-bold tracking-tight">
                              Credit Approval System
                          </h1>
                          <p className="text-xs text-muted-foreground">
                              Installment Setup
                          </p>
                      </div>
                  </a>

                  <div className="flex gap-2">
                      <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setInterestConfigOpen(true)}
                      >
                          <Settings className="h-5 w-5" />
                      </Button>
                      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                          <SheetTrigger asChild>
                              <Button variant="outline" size="icon">
                                  <Menu className="h-5 w-5" />
                              </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                              <SheetHeader>
                                  <SheetTitle>Quick Actions</SheetTitle>
                                  <SheetDescription>
                                      View transactions history
                                  </SheetDescription>
                              </SheetHeader>
                              <div className="space-y-4 p-5 pt-0">
                                  <Separator />
                                  <div className="space-y-3">
                                      <h3 className="text-sm font-semibold">
                                          Today's Applications
                                      </h3>
                                      <div className="space-y-2">
                                          {transactions?.map((transaction) => (
                                              <Card
                                                  key={transaction.order_number}
                                                  className="p-3"
                                              >
                                                  <div className="flex items-start justify-between">
                                                      <div>
                                                          <p className="text-sm font-medium">
                                                              {
                                                                  transaction.customer
                                                              }
                                                          </p>
                                                          <p className="text-xs text-muted-foreground">
                                                              {transaction.term}{' '}
                                                              months
                                                          </p>
                                                      </div>
                                                      <a
                                                          href={`/pos-installment-orders/${transaction.order_number}`}
                                                          className="cursor-pointer rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800"
                                                      >
                                                          {
                                                              transaction.order_number
                                                          }
                                                      </a>
                                                  </div>
                                              </Card>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </SheetContent>
                      </Sheet>
                  </div>
              </div>
          </div>

          <div className="container mx-auto max-w-7xl p-6">
              <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">
                      Credit Approval & Installment Setup
                  </h2>
                  <p className="text-muted-foreground">
                      Complete the form to process a new installment application
                  </p>
              </div>

              {validationError && !dialogOpen && (
                  <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="lg:col-span-2">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <div className="flex w-full items-center justify-between">
                                  <div className="flex items-center gap-2">
                                      <Briefcase className="h-5 w-5" />
                                      Item & Payment Details
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <Label className="text-xs font-bold">
                                          Pull out items
                                      </Label>
                                      <Checkbox
                                          checked={isPullOutItems}
                                          onCheckedChange={handlePullOutToggle}
                                      />
                                  </div>
                              </div>
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="space-y-2">
                              <Label>Search Product *</Label>
                              <div className="relative">
                                  <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                  {isLoadingProducts && (
                                      <Loader2 className="absolute top-3 right-3 h-4 w-4 animate-spin text-muted-foreground" />
                                  )}
                                  <Input
                                      placeholder="Search products..."
                                      value={searchTerm}
                                      onChange={(e) =>
                                          handleProductSearch(e.target.value)
                                      }
                                      className="pl-9"
                                  />
                                  {showDropdown && (
                                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
                                          {isLoadingProducts ? (
                                              <div className="p-6 text-center">
                                                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground/50" />
                                                  <p className="text-sm text-muted-foreground">
                                                      Searching products...
                                                  </p>
                                              </div>
                                          ) : filteredProducts.length > 0 ? (
                                              filteredProducts.map(
                                                  (product) => (
                                                      <div
                                                          key={product.serial}
                                                          onClick={() =>
                                                              handleProductSelect(
                                                                  product,
                                                              )
                                                          }
                                                          className="cursor-pointer border-b p-3 last:border-b-0 hover:bg-accent"
                                                      >
                                                          <div className="font-medium">
                                                              {
                                                                  product.description
                                                              }
                                                          </div>
                                                          <div className="text-sm text-muted-foreground">
                                                              {product.model} •
                                                              Serial:{' '}
                                                              {product.serial}
                                                          </div>
                                                          <div className="mt-1 text-sm font-semibold text-primary">
                                                              ₱
                                                              {product.srp.toLocaleString()}
                                                          </div>
                                                      </div>
                                                  ),
                                              )
                                          ) : (
                                              <div className="p-6 text-center">
                                                  <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                                                  <p className="text-sm text-muted-foreground">
                                                      No products found
                                                  </p>
                                                  <p className="mt-1 text-xs text-muted-foreground">
                                                      Try a different search
                                                      term
                                                  </p>
                                              </div>
                                          )}
                                      </div>
                                  )}
                              </div>
                          </div>

                          {selectedProducts.length > 0 && (
                              <div className="overflow-hidden rounded-lg border">
                                  <table className="w-full">
                                      <thead className="bg-muted">
                                          <tr>
                                              <th className="p-3 text-left font-semibold">
                                                  Product
                                              </th>
                                              <th className="p-3 text-start font-semibold">
                                                  SRP
                                              </th>
                                              <th className="p-3 text-start font-semibold">
                                                  Type
                                              </th>
                                              <th className="p-3 text-start font-semibold">
                                                  Is free?
                                              </th>
                                              <th className="w-24 p-3 text-center font-semibold">
                                                  Actions
                                              </th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {selectedProducts.map(
                                              (item, index) => {
                                                  return (
                                                      <tr
                                                          key={index}
                                                          className="border-t hover:bg-muted/50"
                                                      >
                                                          <td className="p-3">
                                                              <div className="font-medium">
                                                                  {
                                                                      item.description
                                                                  }
                                                              </div>
                                                              <div className="text-sm text-muted-foreground">
                                                                  {item.model} •{' '}
                                                                  {item.serial}
                                                              </div>
                                                          </td>
                                                          <td className="p-3 text-start">
                                                              {isPullOutItems ? (
                                                                  <Input
                                                                      type="number"
                                                                      value={
                                                                          editedSRPs[
                                                                              item
                                                                                  .id
                                                                          ] ??
                                                                          item.srp
                                                                      }
                                                                      onChange={(
                                                                          e,
                                                                      ) =>
                                                                          handleSRPChange(
                                                                              item.id,
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                      }
                                                                      className="w-32"
                                                                      min="0"
                                                                      step="0.01"
                                                                  />
                                                              ) : (
                                                                  item.srp
                                                              )}
                                                          </td>
                                                          <td className="p-3 text-start">
                                                              {item.item_type}
                                                          </td>
                                                          <td className="p-3 text-start">
                                                              <Checkbox
                                                                  checked={
                                                                      item.isFree
                                                                  }
                                                                  onCheckedChange={() =>
                                                                      setProductToFree(
                                                                          item.id,
                                                                      )
                                                                  }
                                                              />
                                                          </td>
                                                          <td className="p-3">
                                                              <div className="flex justify-center gap-1">
                                                                  <Button
                                                                      variant="ghost"
                                                                      size="icon"
                                                                      onClick={() =>
                                                                          handleRemoveItem(
                                                                              item.id,
                                                                          )
                                                                      }
                                                                  >
                                                                      <X className="h-4 w-4 text-destructive" />
                                                                  </Button>
                                                              </div>
                                                          </td>
                                                      </tr>
                                                  );
                                              },
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          )}

                          {selectedProducts.length > 0 && (
                              <div className="space-y-4">
                                  <Separator />
                                  <div>
                                      <Label>Payment Term *</Label>
                                      <div className="mt-2 grid grid-cols-4 gap-3">
                                          {customPlans.map((plan) => (
                                              <Card
                                                  key={plan.months}
                                                  className={`cursor-pointer p-3 transition-colors hover:border-primary ${
                                                      selectedTerm ===
                                                      plan.months
                                                          ? 'border-primary bg-primary/5'
                                                          : ''
                                                  }`}
                                                  onClick={() =>
                                                      handleTermSelect(
                                                          plan.months,
                                                      )
                                                  }
                                              >
                                                  <div className="space-y-1 text-center">
                                                      <p className="text-2xl font-bold">
                                                          {plan.months}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                          months
                                                      </p>
                                                  </div>
                                              </Card>
                                          ))}
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-5">
                                      <div className="flex items-center space-x-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                          <Checkbox
                                              id="noDownPayment"
                                              checked={noDownPayment}
                                              onCheckedChange={
                                                  handleNoDownPaymentToggle
                                              }
                                          />
                                          <Label
                                              htmlFor="noDownPayment"
                                              className="cursor-pointer text-sm font-medium"
                                          >
                                              No Down Payment (Special Option)
                                          </Label>
                                      </div>
                                      <div className="flex items-center space-x-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                          <Checkbox
                                              id="noDownPayment"
                                              checked={noInterestRate}
                                              onCheckedChange={
                                                  handleNoInterestRateToggle
                                              }
                                          />
                                          <Label
                                              htmlFor="noDownPayment"
                                              className="cursor-pointer text-sm font-medium"
                                          >
                                              No Interest Rate (Special Option)
                                          </Label>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Label htmlFor="downPayment">
                                              LCP *
                                          </Label>
                                          <div className="relative">
                                              <span className="absolute top-2.5 left-3 text-muted-foreground">
                                                  ₱
                                              </span>
                                              <Input
                                                  id="lcp"
                                                  type="number"
                                                  placeholder="0"
                                                  className="pl-7"
                                                  value={totalLCP}
                                                  disabled={true}
                                              />
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                              {noDownPayment
                                                  ? 'No down payment applied'
                                                  : 'Initial payment'}
                                          </p>
                                      </div>

                                      <div className="space-y-2">
                                          <Label htmlFor="downPayment">
                                              Down Payment *
                                          </Label>
                                          <div className="relative">
                                              <span className="absolute top-2.5 left-3 text-muted-foreground">
                                                  ₱
                                              </span>
                                              <Input
                                                  id="downPayment"
                                                  type="number"
                                                  placeholder="0"
                                                  className="pl-7"
                                                  value={downPayment}
                                                  onChange={(e) =>
                                                      handleDownPaymentChange(
                                                          e.target.value,
                                                      )
                                                  }
                                                  disabled={
                                                      noDownPayment ||
                                                      noInterestRate
                                                  }
                                              />
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                              {noDownPayment
                                                  ? 'No down payment applied'
                                                  : 'Initial payment'}
                                          </p>
                                      </div>

                                      <div className="space-y-2">
                                          <Label>
                                              PNV (Promissory Note Value)
                                          </Label>
                                          <div className="flex h-10 items-center rounded-md bg-muted px-3 py-2">
                                              <span className="font-semibold">
                                                  ₱
                                                  {calculatePaymentBreakdown()?.pnv.toLocaleString(
                                                      'en-US',
                                                      {
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                      },
                                                  )}
                                              </span>
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                              LCP - Down Payment
                                          </p>
                                      </div>
                                  </div>
                                  {(() => {
                                      const breakdown =
                                          calculatePaymentBreakdown();
                                      if (!breakdown) return null;

                                      return (
                                          <Card className="border-primary/20 bg-primary/5">
                                              <CardContent className="pt-6">
                                                  <div className="mb-4 flex items-center justify-between">
                                                      <div>
                                                          <p className="text-sm text-muted-foreground">
                                                              Monthly Payment
                                                          </p>
                                                          <p className="text-3xl font-bold text-primary">
                                                              ₱
                                                              {breakdown.monthlyPayment.toLocaleString(
                                                                  'en-US',
                                                                  {
                                                                      minimumFractionDigits: 2,
                                                                      maximumFractionDigits: 2,
                                                                  },
                                                              )}
                                                          </p>
                                                      </div>
                                                      <div className="text-right">
                                                          <p className="text-sm text-muted-foreground">
                                                              Total Amount
                                                          </p>
                                                          <p className="text-xl font-semibold">
                                                              ₱
                                                              {breakdown.totalAmount.toLocaleString(
                                                                  'en-US',
                                                                  {
                                                                      minimumFractionDigits: 2,
                                                                      maximumFractionDigits: 2,
                                                                  },
                                                              )}
                                                          </p>
                                                      </div>
                                                  </div>
                                                  <Separator className="my-4" />
                                                  <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                                                      <div>
                                                          <p className="text-muted-foreground">
                                                              LCP (Loan Contract
                                                              Price)
                                                          </p>
                                                          <p className="font-semibold">
                                                              ₱
                                                              {breakdown.lcp.toLocaleString(
                                                                  'en-US',
                                                                  {
                                                                      minimumFractionDigits: 2,
                                                                      maximumFractionDigits: 2,
                                                                  },
                                                              )}
                                                          </p>
                                                      </div>
                                                      <div>
                                                          <p className="text-muted-foreground">
                                                              PNV (Promissory
                                                              Note)
                                                          </p>
                                                          <p className="font-semibold">
                                                              ₱
                                                              {breakdown.pnv.toLocaleString(
                                                                  'en-US',
                                                                  {
                                                                      minimumFractionDigits: 2,
                                                                      maximumFractionDigits: 2,
                                                                  },
                                                              )}
                                                          </p>
                                                      </div>
                                                  </div>
                                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                                      <div>
                                                          <p className="text-muted-foreground">
                                                              Term
                                                          </p>
                                                          <p className="font-semibold">
                                                              {selectedTerm}{' '}
                                                              months
                                                          </p>
                                                      </div>
                                                      <div>
                                                          <p className="text-muted-foreground">
                                                              Down Payment
                                                          </p>
                                                          <p className="font-semibold">
                                                              ₱
                                                              {breakdown.downPaymentAmount.toLocaleString()}
                                                          </p>
                                                      </div>
                                                      <div>
                                                          <p className="text-muted-foreground">
                                                              Total Interest
                                                          </p>
                                                          <p className="font-semibold">
                                                              ₱
                                                              {breakdown.totalInterest.toLocaleString(
                                                                  'en-US',
                                                                  {
                                                                      minimumFractionDigits: 2,
                                                                      maximumFractionDigits: 2,
                                                                  },
                                                              )}
                                                          </p>
                                                      </div>
                                                  </div>
                                                  {noDownPayment && (
                                                      <>
                                                          <Separator className="my-3" />
                                                          <p className="text-xs font-medium text-amber-600">
                                                              ⚠ No down payment
                                                              option: Special
                                                              12-month rate
                                                              applied (1.33x +
                                                              ₱600)
                                                          </p>
                                                      </>
                                                  )}
                                              </CardContent>
                                          </Card>
                                      );
                                  })()}
                              </div>
                          )}
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              Customer Information
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="searchCustomer">
                                  Search Existing Customer
                              </Label>
                              <div className="relative">
                                  <Input
                                      id="searchCustomer"
                                      placeholder="Type customer name..."
                                      value={searchQuery}
                                      onChange={(e) =>
                                          handleSearch(e.target.value)
                                      }
                                      className={
                                          isExistingCustomer
                                              ? 'border-green-500'
                                              : ''
                                      }
                                  />
                                  {isLoadingCustomers && (
                                      <Loader2 className="absolute top-3 right-9 h-4 w-4 animate-spin text-muted-foreground" />
                                  )}
                                  {isExistingCustomer && (
                                      <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={clearCustomer}
                                          className="absolute top-1 right-1 h-7"
                                      >
                                          <X className="h-4 w-4" />
                                      </Button>
                                  )}
                                  {showResults && (
                                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
                                          {isLoadingCustomers ? (
                                              <div className="p-6 text-center">
                                                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground/50" />
                                                  <p className="text-sm text-muted-foreground">
                                                      Searching customers...
                                                  </p>
                                              </div>
                                          ) : searchResults.length > 0 ? (
                                              searchResults.map((customer) => (
                                                  <div
                                                      key={customer.id}
                                                      onClick={() =>
                                                          selectCustomer(
                                                              customer,
                                                          )
                                                      }
                                                      className="cursor-pointer border-b p-3 last:border-b-0 hover:bg-gray-100"
                                                  >
                                                      <p className="font-medium">
                                                          {customer.first_name}{' '}
                                                          {customer.last_name}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                          {
                                                              customer.phone_number
                                                          }
                                                      </p>
                                                  </div>
                                              ))
                                          ) : (
                                              <div className="p-6 text-center">
                                                  <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                                                  <p className="text-sm text-muted-foreground">
                                                      No customers found
                                                  </p>
                                              </div>
                                          )}
                                      </div>
                                  )}
                              </div>
                              {isExistingCustomer && (
                                  <p className="flex items-center gap-1 text-xs text-green-600">
                                      ✓ Existing customer selected
                                  </p>
                              )}
                          </div>

                          <Separator />

                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="firstName">
                                      First Name *
                                  </Label>
                                  <Input
                                      disabled={isExistingCustomer}
                                      id="firstName"
                                      placeholder="Juan"
                                      value={firstName}
                                      onChange={(e) =>
                                          setFirstName(e.target.value)
                                      }
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="lastName">Last Name *</Label>
                                  <Input
                                      disabled={isExistingCustomer}
                                      id="lastName"
                                      placeholder="Dela Cruz"
                                      value={lastName}
                                      onChange={(e) =>
                                          setLastName(e.target.value)
                                      }
                                  />
                              </div>
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="contact">Contact Number</Label>
                              <Input
                                  disabled={isExistingCustomer}
                                  id="contact"
                                  placeholder="0912 345 6789"
                                  value={contact}
                                  onChange={(e) => setContact(e.target.value)}
                              />
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="customerAddress">Email</Label>
                              <Input
                                  disabled={isExistingCustomer}
                                  id="email"
                                  placeholder="Enter customer's email"
                                  value={customerEmail}
                                  onChange={(e) =>
                                      setCustomerEmail(e.target.value)
                                  }
                              />
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="address">
                                  Complete Address *
                              </Label>
                              <Textarea
                                  disabled={isExistingCustomer}
                                  id="address"
                                  placeholder="Street, Barangay, City, Province"
                                  rows={3}
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="city">City *</Label>
                                  <Input
                                      disabled={isExistingCustomer}
                                      id="city"
                                      placeholder="Enter city"
                                      value={customerCity}
                                      onChange={(e) =>
                                          setCustomerCity(e.target.value)
                                      }
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="province">Province *</Label>
                                  <Input
                                      disabled={isExistingCustomer}
                                      id="province"
                                      placeholder="Enter province"
                                      value={customerProvince}
                                      onChange={(e) =>
                                          setCustomerProvince(e.target.value)
                                      }
                                  />
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="zipcode">Zipcode</Label>
                                  <Input
                                      disabled={isExistingCustomer}
                                      id="zipcode"
                                      placeholder="Enter zipcode"
                                      value={customerZipcode}
                                      onChange={(e) =>
                                          setCustomerZipcode(e.target.value)
                                      }
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="country">Country *</Label>
                                  <Input
                                      disabled={isExistingCustomer}
                                      id="country"
                                      placeholder="Enter country"
                                      value={customerCountry}
                                      onChange={(e) =>
                                          setCustomerCountry(e.target.value)
                                      }
                                  />
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                  <div className="space-y-4">
                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                  <Users className="h-5 w-5" />
                                  Reference
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                              <div className="space-y-4">
                                  <div className="space-y-2">
                                      <Label htmlFor="ref1Name">Name *</Label>
                                      <Input
                                          id="ref1Name"
                                          placeholder="Full name"
                                          value={ref1Name}
                                          onChange={(e) =>
                                              setRef1Name(e.target.value)
                                          }
                                          disabled={
                                              selectedCustomer?.reference
                                                  ?.full_name != null
                                          }
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="ref1Contact">
                                          Contact *
                                      </Label>
                                      <Input
                                          id="ref1Contact"
                                          placeholder="0912 345 6789"
                                          value={ref1Contact}
                                          onChange={(e) =>
                                              setRef1Contact(e.target.value)
                                          }
                                          disabled={
                                              selectedCustomer?.reference
                                                  ?.phone_number != null
                                          }
                                      />
                                  </div>
                              </div>
                          </CardContent>
                      </Card>

                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                  <Home className="h-5 w-5" />
                                  Investigation Details
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="space-y-2">
                                  <Label htmlFor="visitDate">
                                      Home Visit Date *
                                  </Label>
                                  <Input
                                      id="visitDate"
                                      type="date"
                                      value={visitDate}
                                      disabled={
                                          selectedCustomer?.investigation_detail
                                              ?.home_visit_date != null
                                      }
                                      onChange={(e) =>
                                          setVisitDate(e.target.value)
                                      }
                                  />
                              </div>

                              <div className="space-y-2">
                                  <Label htmlFor="investigator">
                                      Investigator Name *
                                  </Label>
                                  <Select
                                      disabled={
                                          selectedCustomer?.investigation_detail
                                              ?.employee_id != null
                                      }
                                      value={investigatorId}
                                      onValueChange={setInvestigatorId}
                                  >
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select investigator" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          {employees.map((employee) => (
                                              <SelectItem
                                                  key={employee.id}
                                                  value={employee.id.toString()}
                                              >
                                                  {employee.full_name}
                                              </SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                              </div>

                              <div className="flex items-center space-x-2">
                                  <Checkbox
                                      disabled={
                                          selectedCustomer?.investigation_detail
                                              ?.is_employment_verified != null
                                      }
                                      id="verified"
                                      checked={employmentVerified}
                                      onCheckedChange={(checked) =>
                                          setEmploymentVerified(
                                              checked as boolean,
                                          )
                                      }
                                  />
                                  <Label
                                      htmlFor="verified"
                                      className="cursor-pointer text-sm font-normal"
                                  >
                                      Employment Verified
                                  </Label>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="notes">
                                      Investigation Notes
                                  </Label>
                                  <Textarea
                                      disabled={
                                          selectedCustomer?.investigation_detail
                                              ?.investigation_notes != null
                                      }
                                      id="notes"
                                      placeholder="Add notes about the customer, home visit, references verification, etc."
                                      rows={4}
                                      value={investigationNotes}
                                      onChange={(e) =>
                                          setInvestigationNotes(e.target.value)
                                      }
                                  />
                              </div>

                              {/* Add these new fields below */}
                              <Separator className="my-4" />

                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <Label htmlFor="idPresented">
                                          ID Presented
                                      </Label>
                                      <Input
                                          disabled={
                                              selectedCustomer
                                                  ?.investigation_detail
                                                  ?.id_presented != null
                                          }
                                          id="idPresented"
                                          placeholder="e.g., Driver's License"
                                          value={idPresented}
                                          onChange={(e) =>
                                              setIdPresented(e.target.value)
                                          }
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="idNumber">
                                          ID Number
                                      </Label>
                                      <Input
                                          disabled={
                                              selectedCustomer
                                                  ?.investigation_detail
                                                  ?.id_number != null
                                          }
                                          id="idNumber"
                                          placeholder="Enter ID number"
                                          value={idNumber}
                                          onChange={(e) =>
                                              setIdNumber(e.target.value)
                                          }
                                      />
                                  </div>
                              </div>

                              <div className="space-y-2">
                                  <Label htmlFor="civilStatus">
                                      Civil Status
                                  </Label>
                                  <Select
                                      disabled={
                                          selectedCustomer?.investigation_detail
                                              ?.civil_status != null
                                      }
                                      value={civilStatus}
                                      onValueChange={setCivilStatus}
                                  >
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select civil status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="Single">
                                              Single
                                          </SelectItem>
                                          <SelectItem value="Married">
                                              Married
                                          </SelectItem>
                                          <SelectItem value="Widowed">
                                              Widowed
                                          </SelectItem>
                                          <SelectItem value="Separated">
                                              Separated
                                          </SelectItem>
                                          <SelectItem value="Divorced">
                                              Divorced
                                          </SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>

                              {civilStatus === 'Married' && (
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                          <Label htmlFor="spouseName">
                                              Spouse Name
                                          </Label>
                                          <Input
                                              disabled={
                                                  selectedCustomer
                                                      ?.investigation_detail
                                                      ?.spouse_name != null
                                              }
                                              id="spouseName"
                                              placeholder="Enter spouse name"
                                              value={spouseName}
                                              onChange={(e) =>
                                                  setSpouseName(e.target.value)
                                              }
                                          />
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="spouseContactNumber">
                                              Spouse Contact Number
                                          </Label>
                                          <Input
                                              disabled={
                                                  selectedCustomer
                                                      ?.investigation_detail
                                                      ?.spouse_contact_number !=
                                                  null
                                              }
                                              id="spouseContactNumber"
                                              placeholder="0912 345 6789"
                                              value={spouseContactNumber}
                                              onChange={(e) =>
                                                  setSpouseContactNumber(
                                                      e.target.value,
                                                  )
                                              }
                                          />
                                      </div>
                                  </div>
                              )}
                          </CardContent>
                      </Card>
                  </div>

                  <Card className="lg:col-span-2">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Additional Documents
                          </CardTitle>
                          <CardDescription>
                              Upload supporting documents (PNG, JPG, PDF up to
                              10MB each)
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary">
                              <input
                                  type="file"
                                  id="fileUpload"
                                  className="hidden"
                                  multiple
                                  accept=".png,.jpg,.jpeg,.pdf"
                                  onChange={handleFileUpload}
                              />
                              <label
                                  htmlFor="fileUpload"
                                  className="cursor-pointer"
                              >
                                  <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                                  <p className="mb-1 font-medium">
                                      Click to upload or drag and drop
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                      PNG, JPG, PDF up to 10MB
                                  </p>
                              </label>
                          </div>

                          {uploadedFiles.length > 0 && (
                              <div className="space-y-2">
                                  <Label>
                                      Uploaded Files ({uploadedFiles.length})
                                  </Label>
                                  <div className="space-y-2">
                                      {uploadedFiles.map((file) => (
                                          <div
                                              key={file.id}
                                              className="flex items-center justify-between rounded-lg border p-3"
                                          >
                                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                                  <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                                  <div className="min-w-0 flex-1">
                                                      <p className="truncate text-sm font-medium">
                                                          {file.name}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                          {formatFileSize(
                                                              file.size,
                                                          )}
                                                      </p>
                                                  </div>
                                              </div>
                                              <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                      removeFile(file.id)
                                                  }
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
                  <Button size="lg" className="min-w-40" onClick={openDialog}>
                      Create Account
                  </Button>
              </div>
          </div>

          {/* Interest Configuration Dialog */}
          <Dialog
              open={interestConfigOpen}
              onOpenChange={setInterestConfigOpen}
          >
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                  <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Interest Rate & LCP Configuration
                      </DialogTitle>
                      <DialogDescription>
                          Configure LCP markup, interest multipliers and fixed
                          charges for different item types and terms
                      </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                      <Card>
                          <CardHeader>
                              <CardTitle className="text-base">
                                  LCP (Loan Contract Price) Configuration
                              </CardTitle>
                              <CardDescription>
                                  Configure how the Loan Contract Price is
                                  calculated from SRP
                              </CardDescription>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="lcpMarkupRate">
                                      LCP Markup Rate
                                  </Label>
                                  <Input
                                      id="lcpMarkupRate"
                                      type="number"
                                      step="0.01"
                                      value={tempLcpMarkupRate}
                                      onChange={(e) =>
                                          setTempLcpMarkupRate(
                                              parseFloat(e.target.value) || 1.0,
                                          )
                                      }
                                      placeholder="e.g., 1.1"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                      SRP will be multiplied by this value
                                  </p>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="lcpAdditionalCharge">
                                      LCP Additional Charge (₱)
                                  </Label>
                                  <Input
                                      id="lcpAdditionalCharge"
                                      type="number"
                                      step="50"
                                      value={tempLcpAdditionalCharge}
                                      onChange={(e) =>
                                          setTempLcpAdditionalCharge(
                                              parseFloat(e.target.value) || 0,
                                          )
                                      }
                                      placeholder="e.g., 300"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                      Additional fixed amount added to marked-up
                                      SRP
                                  </p>
                              </div>
                          </CardContent>
                      </Card>

                      <Separator />

                      <Tabs defaultValue="furniture" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="furniture">
                                  Furniture
                              </TabsTrigger>
                              <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
                              <TabsTrigger value="appliances">
                                  Appliances
                              </TabsTrigger>
                          </TabsList>

                          {['furniture', 'gadgets', 'appliances'].map(
                              (itemType) => (
                                  <TabsContent
                                      key={itemType}
                                      value={itemType}
                                      className="space-y-4"
                                  >
                                      <div className="grid gap-4">
                                          {[3, 6, 9, 12].map((term) => (
                                              <Card key={term}>
                                                  <CardHeader className="pb-3">
                                                      <CardTitle className="text-base">
                                                          {term} Months Term
                                                      </CardTitle>
                                                  </CardHeader>
                                                  <CardContent className="grid grid-cols-2 gap-4">
                                                      <div className="space-y-2">
                                                          <Label
                                                              htmlFor={`${itemType}-${term}-multiplier`}
                                                          >
                                                              Interest
                                                              Multiplier
                                                          </Label>
                                                          <Input
                                                              id={`${itemType}-${term}-multiplier`}
                                                              type="number"
                                                              step="0.01"
                                                              value={
                                                                  tempInterestConfigs[
                                                                      itemType
                                                                  ][term]
                                                                      .multiplier
                                                              }
                                                              onChange={(e) =>
                                                                  updateInterestConfig(
                                                                      itemType,
                                                                      term,
                                                                      'multiplier',
                                                                      e.target
                                                                          .value,
                                                                  )
                                                              }
                                                              placeholder="e.g., 1.12"
                                                          />
                                                          <p className="text-xs text-muted-foreground">
                                                              PNV will be
                                                              multiplied by this
                                                              value
                                                          </p>
                                                      </div>
                                                      <div className="space-y-2">
                                                          <Label
                                                              htmlFor={`${itemType}-${term}-fixed`}
                                                          >
                                                              Fixed Charge (₱)
                                                          </Label>
                                                          <Input
                                                              id={`${itemType}-${term}-fixed`}
                                                              type="number"
                                                              step="50"
                                                              value={
                                                                  tempInterestConfigs[
                                                                      itemType
                                                                  ][term]
                                                                      .fixedCharge
                                                              }
                                                              onChange={(e) =>
                                                                  updateInterestConfig(
                                                                      itemType,
                                                                      term,
                                                                      'fixedCharge',
                                                                      e.target
                                                                          .value,
                                                                  )
                                                              }
                                                              placeholder="e.g., 300"
                                                          />
                                                          <p className="text-xs text-muted-foreground">
                                                              Additional fixed
                                                              amount added to
                                                              PNV
                                                          </p>
                                                      </div>
                                                  </CardContent>
                                              </Card>
                                          ))}
                                      </div>

                                      <Alert>
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertDescription className="text-sm">
                                              <strong>LCP Formula:</strong> LCP
                                              = (SRP × {tempLcpMarkupRate}) + ₱
                                              {tempLcpAdditionalCharge}
                                              <br />
                                              <strong>PNV Formula:</strong>{' '}
                                              Final PNV = (PNV × Multiplier) +
                                              Fixed Charge
                                              <br />
                                              <strong>Example:</strong> If PNV
                                              is ₱10,000, multiplier is 1.12,
                                              and fixed charge is ₱300:
                                              <br />
                                              Final PNV = (₱10,000 × 1.12) +
                                              ₱300 = ₱11,500
                                          </AlertDescription>
                                      </Alert>
                                  </TabsContent>
                              ),
                          )}
                      </Tabs>
                  </div>

                  <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={resetInterestConfigs}>
                          Reset to Defaults
                      </Button>
                      <Button
                          variant="outline"
                          onClick={() => {
                              setTempInterestConfigs(interestConfigs);
                              setTempLcpMarkupRate(lcpMarkupRate);
                              setTempLcpAdditionalCharge(lcpAdditionalCharge);
                              setInterestConfigOpen(false);
                          }}
                      >
                          Cancel
                      </Button>
                      <Button onClick={saveInterestConfigs}>
                          Save Configuration
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>

          {/* Confirmation Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle>Confirm Account Creation</DialogTitle>
                      <DialogDescription>
                          Please provide additional details to complete the
                          account setup
                      </DialogDescription>
                  </DialogHeader>

                  {validationError && (
                      <Alert variant="destructive" className="mb-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{validationError}</AlertDescription>
                      </Alert>
                  )}

                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="receiptNumber">
                              Receipt Number *
                          </Label>
                          <Input
                              id="receiptNumber"
                              placeholder="#000000923"
                              value={receiptNumber}
                              onChange={(e) => setReceiptNumber(e.target.value)}
                          />
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="transactionDate">
                              Transaction Date *
                          </Label>
                          <Input
                              type="date"
                              id="transactionDate"
                              value={transactionDate}
                              onChange={(e) =>
                                  setTransactionDate(e.target.value)
                              }
                          />
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="location">Branch *</Label>
                          <Select
                              value={selectedLocation}
                              onValueChange={setSelectedLocation}
                          >
                              <SelectTrigger>
                                  <SelectValue placeholder="Select Branch" />
                              </SelectTrigger>
                              <SelectContent>
                                  {locations.map((location) => (
                                      <SelectItem
                                          key={location.id}
                                          value={location.id.toString()}
                                      >
                                          {location.name}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>

                      {downPayment > 0 && (
                          <>
                              <div className="space-y-2">
                                  <Label htmlFor="modeOfPayment">
                                      Mode of Payment *
                                  </Label>
                                  <Select
                                      value={modeOfPayment}
                                      onValueChange={setModeOfPayment}
                                  >
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select payment mode" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="Cash">
                                              Cash
                                          </SelectItem>
                                          <SelectItem value="Gcash">
                                              Gcash
                                          </SelectItem>
                                          <SelectItem value="Bank Transfer">
                                              Bank Transfer
                                          </SelectItem>
                                          <SelectItem value="Debit/Credit Card">
                                              Debit/Credit Card
                                          </SelectItem>
                                          <SelectItem value="Home Credit/Skyro/Billease">
                                              Home Credit/Skyro/Billease
                                          </SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                                      Down payment: ₱
                                      {downPayment.toLocaleString()}
                                  </p>
                              </div>

                              {modeOfPayment && modeOfPayment !== 'Cash' && (
                                  <div className="space-y-2">
                                      <Label htmlFor="referenceNumber">
                                          Reference Number *
                                      </Label>
                                      <Input
                                          id="referenceNumber"
                                          placeholder="Enter reference/transaction number"
                                          value={referenceNumber}
                                          onChange={(e) =>
                                              setReferenceNumber(e.target.value)
                                          }
                                      />
                                  </div>
                              )}
                          </>
                      )}

                      {downPayment === 0 && (
                          <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                  No down payment - payment details not required
                              </AlertDescription>
                          </Alert>
                      )}
                  </div>

                  <DialogFooter>
                      <Button
                          variant="outline"
                          onClick={() => {
                              setDialogOpen(false);
                              setValidationError('');
                          }}
                          disabled={isSubmitting}
                      >
                          Cancel
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                          {isSubmitting ? 'Creating...' : 'Confirm & Create'}
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      </div>
  );
}