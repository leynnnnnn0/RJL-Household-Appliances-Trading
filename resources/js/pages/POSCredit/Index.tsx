import { CheckoutDialog } from '@/components/pos-credit/checkout-dialog';
import {
    calculateLCP as calculateCreditLCP,
    calculatePaymentBreakdown as calculateCreditPaymentBreakdown,
    cloneDefaultInterestConfigs,
    DEFAULT_LCP_ADDITIONAL_CHARGE,
    DEFAULT_LCP_MARKUP_RATE,
    getDefaultDownPaymentPercent,
    type InterestConfigMap,
    paidProductTotal,
} from '@/components/pos-credit/credit-calculations';
import { CreditCheckCards } from '@/components/pos-credit/credit-check-cards';
import { CustomerInformationCard } from '@/components/pos-credit/customer-information-card';
import { DocumentsCard } from '@/components/pos-credit/documents-card';
import { InterestConfigDialog } from '@/components/pos-credit/interest-config-dialog';
import { ItemPaymentDetailsCard } from '@/components/pos-credit/item-payment-details-card';
import { POSCreditPageHeader } from '@/components/pos-credit/page-header';
import type {
    Customer,
    Employee,
    Location,
    Product,
    SelectedProduct,
    TransactionSummary,
    UploadedFile,
} from '@/components/pos-credit/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Background from '../../../images/plain_background.jpg';

interface PageProps {
    locations: Location[];
    employees: Employee[];
    transactions: TransactionSummary[];
}

export default function Index({
    locations,
    employees,
    transactions,
}: PageProps) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [interestConfigOpen, setInterestConfigOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');

    const [isPullOutItems, setIsPullOutItems] = useState(false);
    const [editedSRPs, setEditedSRPs] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const suppressProductDropdownRef = useRef(false);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
        [],
    );

    const [downPayment, setDownPayment] = useState(0);
    const [selectedTerm, setSelectedTerm] = useState(3);
    const [noDownPayment, setNoDownPayment] = useState(false);
    const [noInterestRate, setNoInterestRate] = useState(false);
    const [totalLCP, setTotalLCP] = useState(0);
    const [lcpMarkupRate, setLcpMarkupRate] = useState(DEFAULT_LCP_MARKUP_RATE);
    const [lcpAdditionalCharge, setLcpAdditionalCharge] = useState(
        DEFAULT_LCP_ADDITIONAL_CHARGE,
    );
    const [interestConfigs, setInterestConfigs] = useState<InterestConfigMap>(
        () => cloneDefaultInterestConfigs(),
    );
    const [tempInterestConfigs, setTempInterestConfigs] =
        useState(interestConfigs);
    const [tempLcpMarkupRate, setTempLcpMarkupRate] = useState(lcpMarkupRate);
    const [tempLcpAdditionalCharge, setTempLcpAdditionalCharge] =
        useState(lcpAdditionalCharge);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
    );
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const suppressCustomerResultsRef = useRef(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contact, setContact] = useState('');
    const [address, setAddress] = useState('');
    const [employment, setEmployment] = useState('');
    const [income, setIncome] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerCity, setCustomerCity] = useState('');
    const [customerProvince, setCustomerProvince] = useState('');
    const [customerZipcode, setCustomerZipcode] = useState('');
    const [customerCountry, setCustomerCountry] = useState('PHILIPPINES');

    const [ref1Name, setRef1Name] = useState('');
    const [ref1Contact, setRef1Contact] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [investigatorId, setInvestigatorId] = useState('');
    const [employmentVerified, setEmploymentVerified] = useState(false);
    const [investigationNotes, setInvestigationNotes] = useState('');
    const [idPresented, setIdPresented] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [civilStatus, setCivilStatus] = useState('');
    const [spouseName, setSpouseName] = useState('');
    const [spouseContactNumber, setSpouseContactNumber] = useState('');

    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [modeOfPayment, setModeOfPayment] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [transactionDate, setTransactionDate] = useState(getTodayDate());

    const paymentBreakdown = calculateCreditPaymentBreakdown({
        products: selectedProducts,
        totalLCP,
        downPayment,
        selectedTerm,
        noDownPayment,
        noInterestRate,
        interestConfigs,
    });

    useEffect(() => {
        if (selectedProducts.length === 0) return;

        const total = paidProductTotal(selectedProducts);
        const lcp = total > 0 ? calculateLCP(total) : 0;
        const downPaymentPercent = getDefaultDownPaymentPercent(
            selectedProducts[0].item_type,
        );

        setTotalLCP(Number.parseFloat(lcp.toFixed(2)));
        setDownPayment(Math.round(lcp * downPaymentPercent));
    }, [selectedProducts]);

    function calculateLCP(srp: number) {
        return calculateCreditLCP(srp, lcpMarkupRate, lcpAdditionalCharge);
    }

    function handlePullOutToggle(checked: boolean) {
        setIsPullOutItems(checked);
        if (!checked) {
            setSelectedProducts([]);
            setEditedSRPs({});
            setSearchTerm('');
        }
    }

    function handleSRPChange(productId: string, newSRP: string) {
        const numValue = parseFloat(newSRP) || 0;
        setEditedSRPs((prev) => ({ ...prev, [productId]: numValue }));
        setSelectedProducts((prev) =>
            prev.map((item) =>
                item.id === productId ? { ...item, srp: numValue } : item,
            ),
        );
    }

    function handleProductSelect(product: Product) {
        const lcp = calculateLCP(product.srp);
        const defaultDownPayment = Math.round(
            lcp * getDefaultDownPaymentPercent(product.item_type),
        );

        setSelectedProducts((prev) =>
            prev.some((p) => p.id === product.id)
                ? prev
                : [
                      ...prev,
                      {
                          ...product,
                          downPayment: 0,
                          selectedTerm,
                          noDownPayment: false,
                          isFree: false,
                      },
                  ],
        );

        if (isPullOutItems) {
            setEditedSRPs((prev) => ({ ...prev, [product.id]: product.srp }));
        }

        suppressProductDropdownRef.current = true;
        setSearchTerm('');
        setDownPayment(defaultDownPayment);
        setNoDownPayment(false);
        setShowDropdown(false);
    }

    function handleProductSearch(value: string) {
        suppressProductDropdownRef.current = false;
        setSearchTerm(value);
        if (value.trim().length === 0) {
            setFilteredProducts([]);
            setShowDropdown(false);
            setIsLoadingProducts(false);
            return;
        }

        setIsLoadingProducts(true);

        axios
            .get('/api/items', {
                params: { search: value, is_defaulted: isPullOutItems },
            })
            .then((response) => {
                if (suppressProductDropdownRef.current) {
                    setFilteredProducts([]);
                    setShowDropdown(false);
                    return;
                }

                setFilteredProducts(response.data?.data || []);
                setShowDropdown(true);
                setIsLoadingProducts(false);
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
                setFilteredProducts([]);
                setShowDropdown(false);
                setIsLoadingProducts(false);
            });
    }

    function handleRemoveItem(productId: string | number) {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
        setEditedSRPs((prev) => {
            const next = { ...prev };
            delete next[productId.toString()];
            return next;
        });
    }

    function setProductToFree(id: string) {
        setSelectedProducts((prevProducts) =>
            prevProducts.map((item) =>
                item.id === id ? { ...item, isFree: !item.isFree } : item,
            ),
        );
    }

    function handleTermSelect(months: number) {
        setSelectedTerm(months);
    }

    function handleDownPaymentChange(value: string) {
        setDownPayment(parseFloat(value) || 0);
    }

    function handleNoDownPaymentToggle(checked: boolean) {
        setNoDownPayment(checked);
        if (noInterestRate && checked) setNoInterestRate(false);

        if (checked) {
            setDownPayment(0);
        }
    }

    function handleNoInterestRateToggle(checked: boolean) {
        setNoInterestRate(checked);
        if (noDownPayment && checked) setNoDownPayment(false);

        const total = paidProductTotal(selectedProducts);
        const downPaymentPercent = getDefaultDownPaymentPercent(
            selectedProducts[0]?.item_type,
        );

        if (checked) {
            setTotalLCP(total);
            setDownPayment(Math.round(total * downPaymentPercent));
            return;
        }

        const lcp = total > 0 ? calculateLCP(total) : 0;
        setTotalLCP(Number.parseFloat(lcp.toFixed(2)));
        setDownPayment(Math.round(lcp * downPaymentPercent));
    }

    function handleSearch(query: string) {
        suppressCustomerResultsRef.current = false;
        setSearchQuery(query);
        if (query.length <= 1) {
            setSearchResults([]);
            setShowResults(false);
            setIsLoadingCustomers(false);
            return;
        }

        setIsLoadingCustomers(true);
        axios
            .get('/api/customers', { params: { search: query } })
            .then((response) => {
                if (suppressCustomerResultsRef.current) {
                    setSearchResults([]);
                    setShowResults(false);
                    return;
                }

                setSearchResults(response.data?.data || []);
                setShowResults(true);
                setIsLoadingCustomers(false);
            })
            .catch((error) => {
                console.error('Error fetching customers:', error);
                setSearchResults([]);
                setIsLoadingCustomers(false);
            });
    }

    function selectCustomer(customer: Customer) {
        suppressCustomerResultsRef.current = true;
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
            setRef1Name(customer.reference.full_name);
            setRef1Contact(customer.reference.phone_number);
        }

        if (customer.investigation_detail?.id) {
            setVisitDate(customer.investigation_detail.home_visit_date);
            setEmploymentVerified(
                customer.investigation_detail.is_employment_verified,
            );
            setInvestigationNotes(
                customer.investigation_detail.investigation_notes,
            );
            setInvestigatorId(
                customer.investigation_detail.employee_id?.toString(),
            );
            setIdPresented(customer.investigation_detail.id_presented ?? '');
            setIdNumber(customer.investigation_detail.id_number ?? '');
            setCivilStatus(customer.investigation_detail.civil_status ?? '');
            setSpouseName(customer.investigation_detail.spouse_name ?? '');
            setSpouseContactNumber(
                customer.investigation_detail.spouse_contact_number ?? '',
            );
        }
    }

    function clearCustomer() {
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
        setCustomerEmail('');
        setCustomerCity('');
        setCustomerProvince('');
        setCustomerZipcode('');
        setCustomerCountry('');
        setIdPresented('');
        setIdNumber('');
        setCivilStatus('');
        setSpouseName('');
        setSpouseContactNumber('');
    }

    function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            file,
        }));

        setUploadedFiles([...uploadedFiles, ...newFiles]);
    }

    function removeFile(id: string) {
        setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
    }

    function validateForm() {
        if (selectedProducts.length === 0)
            return 'Please select an item to proceed';
        if (selectedProducts.filter((item) => !item.isFree).length === 0) {
            return 'Add at least one paid item.';
        }
        if (!firstName || !lastName) return 'Customer name is required';
        if (!address) return 'Address is required';
        if (!ref1Name || !ref1Contact)
            return 'Reference information is required';
        if (!visitDate) return 'Home visit date is required';
        if (!investigatorId) return 'Investigator must be selected';
        if (!customerCity) return 'City is required';
        if (!customerProvince) return 'Province is required';
        if (!customerCountry) return 'Country is required';

        return null;
    }

    function validateDialogForm() {
        if (!receiptNumber) return 'Receipt number is required';
        if (!selectedLocation) return 'Location is required';

        if (downPayment > 0) {
            if (!modeOfPayment) {
                return 'Mode of payment is required when there is a down payment';
            }
            if (modeOfPayment !== 'Cash' && !referenceNumber) {
                return 'Reference number is required for non-cash payments';
            }
        }

        return null;
    }

    function openDialog() {
        const error = validateForm();
        if (error) {
            setValidationError(error);
            return;
        }

        setValidationError('');
        setDialogOpen(true);
    }

    function clearAllFields() {
        clearCustomer();
        setSearchResults([]);
        setShowResults(false);
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
        setCustomerCountry('');
        setReceiptNumber('');
        setTotalLCP(0);
    }

    function handleSubmit() {
        const dialogError = validateDialogForm();
        if (dialogError) {
            setValidationError(dialogError);
            alert('Please make sure all the information needed is filled.');
            return;
        }

        if (!paymentBreakdown) {
            setValidationError('Unable to calculate payment breakdown');
            return;
        }

        const paidProducts = selectedProducts.filter((item) => !item.isFree);
        const freeProducts = selectedProducts.filter((item) => item.isFree);

        if (paidProducts.length === 0) {
            setValidationError('At least one paid item is required');
            return;
        }

        setIsSubmitting(true);
        setValidationError('');

        router.post(
            '/pos-credit',
            {
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
                customer_reference_full_name: ref1Name,
                customer_reference_phone_number: ref1Contact,
                home_visit_date: visitDate,
                investigator_id: investigatorId,
                is_employment_verified: employmentVerified,
                investigation_notes: investigationNotes,
                id_presented: idPresented,
                id_number: idNumber,
                civil_status: civilStatus,
                spouse_name: spouseName,
                spouse_contact_number: spouseContactNumber,
                loan_contract_price: paymentBreakdown.lcp,
                lcp_markup_rate: noInterestRate ? 0 : lcpMarkupRate,
                lcp_additional_charge: noInterestRate ? 0 : lcpAdditionalCharge,
                down_payment: paymentBreakdown.downPaymentAmount,
                promisory_note_value: paymentBreakdown.pnv,
                number_of_terms: selectedTerm,
                promisory_note_value_interest: noInterestRate
                    ? 1
                    : paymentBreakdown.multiplier,
                promisory_note_value_interest_additional_charge: noInterestRate
                    ? 0
                    : paymentBreakdown.fixedCharge,
                items: paidProducts.map((product) => ({
                    item_id: product.id,
                    serial: product.serial,
                    description: product.description,
                    model: product.model,
                    srp: product.srp,
                    item_type: product.item_type,
                })),
                free_items: freeProducts.map((product) => ({
                    item_id: product.id,
                    serial: product.serial,
                    description: product.description,
                    model: product.model,
                    item_type: product.item_type,
                })),
                location_id: selectedLocation,
                payment_method: modeOfPayment || null,
                reference_number: referenceNumber || null,
                receipt_number: receiptNumber || null,
                transaction_date: transactionDate,
                is_no_interest: noInterestRate,
                documents: uploadedFiles.map((file) => file.file),
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Installment Data Created.');
                    setDialogOpen(false);
                    clearAllFields();
                },
                onError: (error) => {
                    setValidationError(
                        'An error occurred while creating the account',
                    );
                    console.log(error);
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    }

    function updateInterestConfig(
        itemType: keyof InterestConfigMap,
        term: number,
        field: 'multiplier' | 'fixedCharge',
        value: string,
    ) {
        const numValue = parseFloat(value) || 0;
        setTempInterestConfigs((prev) => ({
            ...prev,
            [itemType]: {
                ...prev[itemType],
                [term]: {
                    ...prev[itemType][term],
                    [field]: numValue,
                },
            },
        }));
    }

    function saveInterestConfigs() {
        setInterestConfigs(tempInterestConfigs);
        setLcpMarkupRate(tempLcpMarkupRate);
        setLcpAdditionalCharge(tempLcpAdditionalCharge);
        setInterestConfigOpen(false);
        toast.success('Interest configurations saved successfully!');
    }

    function resetInterestConfigs() {
        setTempInterestConfigs(cloneDefaultInterestConfigs());
        setTempLcpMarkupRate(DEFAULT_LCP_MARKUP_RATE);
        setTempLcpAdditionalCharge(DEFAULT_LCP_ADDITIONAL_CHARGE);
    }

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage: `url(${Background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="min-h-screen">
                <POSCreditPageHeader
                    sheetOpen={sheetOpen}
                    onSheetOpenChange={setSheetOpen}
                    onOpenSettings={() => setInterestConfigOpen(true)}
                    transactions={transactions}
                />

                <main className="container mx-auto max-w-7xl p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Credit Approval & Installment Setup
                        </h2>
                        <p className="text-muted-foreground">
                            Complete the form to process a new installment
                            application
                        </p>
                    </div>

                    {validationError && !dialogOpen && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {validationError}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 xl:grid-cols-2">
                        <ItemPaymentDetailsCard
                            isPullOutItems={isPullOutItems}
                            onPullOutToggle={handlePullOutToggle}
                            searchTerm={searchTerm}
                            onSearchTermChange={handleProductSearch}
                            isLoadingProducts={isLoadingProducts}
                            showDropdown={showDropdown}
                            filteredProducts={filteredProducts}
                            selectedProducts={selectedProducts}
                            editedSRPs={editedSRPs}
                            selectedTerm={selectedTerm}
                            totalLCP={totalLCP}
                            downPayment={downPayment}
                            noDownPayment={noDownPayment}
                            noInterestRate={noInterestRate}
                            breakdown={paymentBreakdown}
                            onProductSelect={handleProductSelect}
                            onSRPChange={handleSRPChange}
                            onRemoveItem={handleRemoveItem}
                            onToggleFree={setProductToFree}
                            onTermSelect={handleTermSelect}
                            onNoDownPaymentToggle={handleNoDownPaymentToggle}
                            onNoInterestRateToggle={handleNoInterestRateToggle}
                            onDownPaymentChange={handleDownPaymentChange}
                        />

                        <CustomerInformationCard
                            searchQuery={searchQuery}
                            searchResults={searchResults}
                            showResults={showResults}
                            selectedCustomer={selectedCustomer}
                            isExistingCustomer={isExistingCustomer}
                            isLoadingCustomers={isLoadingCustomers}
                            firstName={firstName}
                            lastName={lastName}
                            contact={contact}
                            email={customerEmail}
                            address={address}
                            city={customerCity}
                            province={customerProvince}
                            zipcode={customerZipcode}
                            country={customerCountry}
                            onSearch={handleSearch}
                            onSelectCustomer={selectCustomer}
                            onClearCustomer={clearCustomer}
                            onFirstNameChange={setFirstName}
                            onLastNameChange={setLastName}
                            onContactChange={setContact}
                            onEmailChange={setCustomerEmail}
                            onAddressChange={setAddress}
                            onCityChange={setCustomerCity}
                            onProvinceChange={setCustomerProvince}
                            onZipcodeChange={setCustomerZipcode}
                            onCountryChange={setCustomerCountry}
                        />

                        <CreditCheckCards
                            selectedCustomer={selectedCustomer}
                            employees={employees}
                            ref1Name={ref1Name}
                            ref1Contact={ref1Contact}
                            visitDate={visitDate}
                            investigatorId={investigatorId}
                            employmentVerified={employmentVerified}
                            investigationNotes={investigationNotes}
                            idPresented={idPresented}
                            idNumber={idNumber}
                            civilStatus={civilStatus}
                            spouseName={spouseName}
                            spouseContactNumber={spouseContactNumber}
                            onRefNameChange={setRef1Name}
                            onRefContactChange={setRef1Contact}
                            onVisitDateChange={setVisitDate}
                            onInvestigatorChange={setInvestigatorId}
                            onEmploymentVerifiedChange={setEmploymentVerified}
                            onInvestigationNotesChange={setInvestigationNotes}
                            onIdPresentedChange={setIdPresented}
                            onIdNumberChange={setIdNumber}
                            onCivilStatusChange={setCivilStatus}
                            onSpouseNameChange={setSpouseName}
                            onSpouseContactNumberChange={setSpouseContactNumber}
                        />

                        <DocumentsCard
                            files={uploadedFiles}
                            onUpload={handleFileUpload}
                            onRemove={removeFile}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" size="lg">
                            Save as Draft
                        </Button>
                        <Button
                            size="lg"
                            className="min-w-40"
                            onClick={openDialog}
                        >
                            Create Account
                        </Button>
                    </div>
                </main>

                <InterestConfigDialog
                    open={interestConfigOpen}
                    interestConfigs={interestConfigs}
                    tempInterestConfigs={tempInterestConfigs}
                    lcpMarkupRate={lcpMarkupRate}
                    lcpAdditionalCharge={lcpAdditionalCharge}
                    tempLcpMarkupRate={tempLcpMarkupRate}
                    tempLcpAdditionalCharge={tempLcpAdditionalCharge}
                    onOpenChange={setInterestConfigOpen}
                    onTempInterestConfigsChange={setTempInterestConfigs}
                    onTempLcpMarkupRateChange={setTempLcpMarkupRate}
                    onTempLcpAdditionalChargeChange={setTempLcpAdditionalCharge}
                    onUpdateInterestConfig={updateInterestConfig}
                    onReset={resetInterestConfigs}
                    onSave={saveInterestConfigs}
                />

                <CheckoutDialog
                    open={dialogOpen}
                    locations={locations}
                    validationError={validationError}
                    receiptNumber={receiptNumber}
                    transactionDate={transactionDate}
                    selectedLocation={selectedLocation}
                    modeOfPayment={modeOfPayment}
                    referenceNumber={referenceNumber}
                    downPayment={downPayment}
                    customerName={`${firstName} ${lastName}`.trim()}
                    selectedProducts={selectedProducts}
                    term={selectedTerm}
                    loanContractPrice={paymentBreakdown?.lcp ?? totalLCP}
                    promisoryNoteValue={paymentBreakdown?.pnv ?? 0}
                    isSubmitting={isSubmitting}
                    onOpenChange={setDialogOpen}
                    onReceiptNumberChange={setReceiptNumber}
                    onTransactionDateChange={setTransactionDate}
                    onSelectedLocationChange={setSelectedLocation}
                    onModeOfPaymentChange={setModeOfPayment}
                    onReferenceNumberChange={setReferenceNumber}
                    onClearValidationError={() => setValidationError('')}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}
