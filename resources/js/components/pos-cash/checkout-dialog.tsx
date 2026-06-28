import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PHPhoneInput } from '@/components/ui/ph-phone-input';
import { SearchInput } from '@/components/ui/search-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    emptyPOSCashCustomerForm,
    POSCashCartItem,
    POSCashCustomerForm,
    POSCashPayment,
    posCashPaymentMethods,
} from '@/lib/pos-cash';
import { Customer, Location, User } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Loader2, Plus, Trash2, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CheckoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orders: POSCashCartItem[];
    orderTotal: number;
    employees: User[];
    locations: Location[];
    selectedEmployee: string;
    onSelectedEmployeeChange: (value: string) => void;
    selectedLocation: string;
    onSelectedLocationChange: (value: string) => void;
    onOrderCreated: () => void;
}

export default function CheckoutDialog({
    open,
    onOpenChange,
    orders,
    orderTotal,
    employees,
    locations,
    selectedEmployee,
    onSelectedEmployeeChange,
    selectedLocation,
    onSelectedLocationChange,
    onOrderCreated,
}: CheckoutDialogProps) {
    const [form, setForm] = useState<POSCashCustomerForm>(
        emptyPOSCashCustomerForm(),
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [payments, setPayments] = useState<POSCashPayment[]>([
        { payment_method: 'Cash', amount: orderTotal, reference_number: '' },
    ]);

    useEffect(() => {
        setPayments((current) => {
            if (current.length !== 1) {
                return current;
            }

            return [{ ...current[0], amount: orderTotal }];
        });
    }, [orderTotal]);

    const paymentTotal = payments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
    );
    const paymentBalance = orderTotal - paymentTotal;

    const setFormValue = (
        key: keyof POSCashCustomerForm,
        value: string | number | null,
    ) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const resetForm = () => {
        setForm(emptyPOSCashCustomerForm());
        setErrors({});
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
        setIsExistingCustomer(false);
        setPayments([
            {
                payment_method: 'Cash',
                amount: orderTotal,
                reference_number: '',
            },
        ]);
    };

    const clearCustomer = () => {
        setForm((current) => ({
            ...emptyPOSCashCustomerForm(),
            receipt_number: current.receipt_number,
        }));
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
        setIsExistingCustomer(false);
    };

    const selectCustomer = (customer: Customer) => {
        setForm((current) => ({
            ...current,
            existing_customer_id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            address: customer.address,
            phone: customer.phone_number,
            email: customer.email ?? '',
            city: customer.city ?? '',
            province: customer.province ?? '',
            zipcode: customer.zipcode ?? '',
            country: customer.country ?? '',
        }));
        setShowResults(false);
        setSearchResults([]);
        setIsExistingCustomer(true);
        setSearchQuery(`${customer.first_name} ${customer.last_name}`);
    };

    const handleSearchCustomer = (query: string) => {
        setSearchQuery(query);

        if (query.length <= 1) {
            setShowResults(false);
            setIsLoadingCustomers(false);
            return;
        }

        setIsLoadingCustomers(true);
        axios
            .get('/api/customers', { params: { search: query } })
            .then((response) => {
                setSearchResults(response.data?.data || []);
                setShowResults(true);
            })
            .catch(() => {
                setSearchResults([]);
            })
            .finally(() => setIsLoadingCustomers(false));
    };

    const placeOrder = () => {
        setErrors({});

        const nextErrors: Record<string, string> = {};

        payments.forEach((payment, index) => {
            if (
                payment.payment_method !== 'Cash' &&
                !payment.reference_number.trim()
            ) {
                nextErrors[`payments.${index}.reference_number`] =
                    'Reference number is required for non-cash payments';
            }

            if (Number(payment.amount) < 0) {
                nextErrors[`payments.${index}.amount`] =
                    'Amount cannot be negative';
            }
        });

        if (Math.round(paymentBalance * 100) !== 0) {
            nextErrors.payments = 'Payment total must match order total';
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            toast.error('Please fix the payment breakdown.');
            return;
        }

        const primaryPayment = payments[0] ?? {
            payment_method: 'Cash',
            reference_number: '',
        };

        router.post(
            '/pos-cash',
            {
                location_id: selectedLocation,
                employee_id: selectedEmployee,
                first_name: form.first_name,
                last_name: form.last_name,
                address: form.address,
                receipt_number: form.receipt_number,
                phone: form.phone,
                email: form.email,
                city: form.city,
                province: form.province,
                zipcode: form.zipcode,
                country: form.country,
                payment_method: primaryPayment.payment_method,
                reference_number:
                    payments.length > 1 ? null : primaryPayment.reference_number,
                payments: payments.map((payment) => ({
                    payment_method: payment.payment_method,
                    amount: Number(payment.amount || 0),
                    reference_number: payment.reference_number || null,
                })),
                existing_customer_id: form.existing_customer_id,
                orders: orders.map((item) => ({
                    id: item.product.id,
                    serial: item.product.serial,
                    sale_amount: item.saleAmount,
                })),
                total_price: orderTotal,
            },
            {
                onSuccess: () => {
                    toast.success('Order Created');
                    resetForm();
                    onOrderCreated();
                    onOpenChange(false);
                },
                onError: (errorBag) => {
                    if (errorBag && typeof errorBag === 'object') {
                        setErrors(errorBag as Record<string, string>);
                    }
                    toast.error('Please fix the errors in the form.');
                },
            },
        );
    };

    const updatePayment = (
        index: number,
        key: keyof POSCashPayment,
        value: string | number,
    ) => {
        setPayments((current) =>
            current.map((payment, paymentIndex) => {
                if (paymentIndex !== index) {
                    return payment;
                }

                const nextPayment = { ...payment, [key]: value };

                if (key === 'payment_method' && value === 'Cash') {
                    nextPayment.reference_number = '';
                }

                return nextPayment;
            }),
        );
    };

    const addPayment = () => {
        setPayments((current) => [
            ...current,
            {
                payment_method: 'Gcash',
                amount: Math.max(0, Number(paymentBalance.toFixed(2))),
                reference_number: '',
            },
        ]);
    };

    const removePayment = (index: number) => {
        setPayments((current) =>
            current.filter((_, paymentIndex) => paymentIndex !== index),
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button disabled={orders.length === 0} className="mt-5 w-full">
                    Place Order
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Customer Information</DialogTitle>
                    <DialogDescription>
                        Please enter customer details and confirm the order.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <CustomerSearch
                        searchQuery={searchQuery}
                        onSearch={handleSearchCustomer}
                        isLoading={isLoadingCustomers}
                        isExistingCustomer={isExistingCustomer}
                        onClear={clearCustomer}
                        showResults={showResults}
                        searchResults={searchResults}
                        onSelectCustomer={selectCustomer}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextInput
                            id="firstName"
                            label="First Name"
                            required
                            value={form.first_name}
                            onChange={(value) =>
                                setFormValue('first_name', value)
                            }
                            error={errors.first_name}
                            placeholder="Enter first name"
                        />
                        <TextInput
                            id="lastName"
                            label="Last Name"
                            required
                            value={form.last_name}
                            onChange={(value) =>
                                setFormValue('last_name', value)
                            }
                            error={errors.last_name}
                            placeholder="Enter last name"
                        />
                    </div>

                    <TextInput
                        id="customerAddress"
                        label="Address"
                        required
                        value={form.address}
                        onChange={(value) => setFormValue('address', value)}
                        error={errors.address}
                        placeholder="Enter customer address"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextInput
                            id="city"
                            label="City"
                            required
                            value={form.city}
                            onChange={(value) => setFormValue('city', value)}
                            error={errors.city}
                            placeholder="Enter city"
                        />
                        <TextInput
                            id="province"
                            label="Province"
                            required
                            value={form.province}
                            onChange={(value) =>
                                setFormValue('province', value)
                            }
                            error={errors.province}
                            placeholder="Enter province"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextInput
                            id="zipcode"
                            label="Zipcode"
                            value={form.zipcode}
                            onChange={(value) => setFormValue('zipcode', value)}
                            error={errors.zipcode}
                            placeholder="Enter zipcode"
                        />
                        <TextInput
                            id="country"
                            label="Country"
                            required
                            value={form.country}
                            onChange={(value) => setFormValue('country', value)}
                            error={errors.country}
                            placeholder="Enter country"
                        />
                    </div>

                    <TextInput
                        id="email"
                        label="Email"
                        value={form.email}
                        onChange={(value) => setFormValue('email', value)}
                        error={errors.email}
                        placeholder="Enter customer's email"
                    />

                    <div className="space-y-2">
                        <Label htmlFor="customerPhone">Phone Number</Label>
                        <PHPhoneInput
                            id="customerPhone"
                            value={form.phone}
                            onChange={(value) => setFormValue('phone', value)}
                            className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-500">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <PaymentBreakdown
                        payments={payments}
                        orderTotal={orderTotal}
                        paymentTotal={paymentTotal}
                        balance={paymentBalance}
                        errors={errors}
                        onUpdate={updatePayment}
                        onAdd={addPayment}
                        onRemove={removePayment}
                    />

                    <TextInput
                        id="receiptNumber"
                        label="Receipt Number"
                        required
                        value={form.receipt_number}
                        onChange={(value) =>
                            setFormValue('receipt_number', value)
                        }
                        error={errors.receipt_number}
                        placeholder="#0000000934"
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <SelectInput
                            id="employee"
                            label="Employee"
                            value={selectedEmployee}
                            onChange={onSelectedEmployeeChange}
                            disabled
                            options={employees.map((employee) => ({
                                value: employee.id.toString(),
                                label: employee.full_name as string,
                            }))}
                        />
                        <SelectInput
                            id="branch"
                            label="Branch"
                            value={selectedLocation}
                            onChange={onSelectedLocationChange}
                            options={locations.map((location) => ({
                                value: location.id.toString(),
                                label: location.name,
                            }))}
                        />
                    </div>
                </div>

                <Button
                    onClick={placeOrder}
                    disabled={orders.length === 0}
                    className="w-full"
                >
                    Confirm Order
                </Button>
            </DialogContent>
        </Dialog>
    );
}

function PaymentBreakdown({
    payments,
    orderTotal,
    paymentTotal,
    balance,
    errors,
    onUpdate,
    onAdd,
    onRemove,
}: {
    payments: POSCashPayment[];
    orderTotal: number;
    paymentTotal: number;
    balance: number;
    errors: Record<string, string>;
    onUpdate: (
        index: number,
        key: keyof POSCashPayment,
        value: string | number,
    ) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
}) {
    const isBalanced = Math.round(balance * 100) === 0;

    return (
        <div className="space-y-3 rounded-lg border p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Label>Payment Breakdown</Label>
                    <p className="text-xs text-muted-foreground">
                        Total payments must match the order total.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAdd}
                >
                    <Plus className="h-4 w-4" />
                    Add Payment
                </Button>
            </div>

            <div className="space-y-3">
                {payments.map((payment, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-1 gap-3 rounded-md border bg-muted/20 p-3 sm:grid-cols-[1fr_140px] lg:grid-cols-[1fr_140px_1fr_auto]"
                    >
                        <SelectInput
                            id={`payment-method-${index}`}
                            label="Method"
                            value={payment.payment_method}
                            onChange={(value) =>
                                onUpdate(index, 'payment_method', value)
                            }
                            options={posCashPaymentMethods.map((method) => ({
                                value: method,
                                label: method,
                            }))}
                        />

                        <TextInput
                            id={`payment-amount-${index}`}
                            label="Amount"
                            value={String(payment.amount)}
                            onChange={(value) =>
                                onUpdate(
                                    index,
                                    'amount',
                                    value === '' ? 0 : Number(value),
                                )
                            }
                            error={errors[`payments.${index}.amount`]}
                            placeholder="0.00"
                        />

                        <TextInput
                            id={`payment-reference-${index}`}
                            label="Reference"
                            required={payment.payment_method !== 'Cash'}
                            value={payment.reference_number}
                            onChange={(value) =>
                                onUpdate(index, 'reference_number', value)
                            }
                            error={errors[`payments.${index}.reference_number`]}
                            disabled={payment.payment_method === 'Cash'}
                            placeholder={
                                payment.payment_method === 'Cash'
                                    ? 'Not required'
                                    : 'Reference number'
                            }
                        />

                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                disabled={payments.length === 1}
                                onClick={() => onRemove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-2 rounded-md bg-muted/40 p-3 text-sm sm:grid-cols-3">
                <PaymentTotal label="Order Total" value={orderTotal} />
                <PaymentTotal label="Payments" value={paymentTotal} />
                <PaymentTotal
                    label="Balance"
                    value={balance}
                    className={isBalanced ? 'text-green-600' : 'text-red-600'}
                />
            </div>

            {errors.payments && (
                <p className="text-sm text-red-500">{errors.payments}</p>
            )}
        </div>
    );
}

function PaymentTotal({
    label,
    value,
    className = '',
}: {
    label: string;
    value: number;
    className?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 sm:block">
            <span className="text-muted-foreground">{label}</span>
            <p className={`font-semibold ${className}`}>
                ₱
                {Number(value || 0).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                })}
            </p>
        </div>
    );
}

function CustomerSearch({
    searchQuery,
    onSearch,
    isLoading,
    isExistingCustomer,
    onClear,
    showResults,
    searchResults,
    onSelectCustomer,
}: {
    searchQuery: string;
    onSearch: (query: string) => void;
    isLoading: boolean;
    isExistingCustomer: boolean;
    onClear: () => void;
    showResults: boolean;
    searchResults: Customer[];
    onSelectCustomer: (customer: Customer) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor="searchCustomer">Search Existing Customer</Label>
            <div className="relative">
                <SearchInput
                    id="searchCustomer"
                    placeholder="Type customer name..."
                    value={searchQuery}
                    onChange={onSearch}
                    inputClassName={
                        isExistingCustomer ? 'border-green-500' : ''
                    }
                />
                {isLoading && (
                    <Loader2 className="absolute top-3 right-9 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {isExistingCustomer && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="absolute top-1 right-1 h-7"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
                {showResults && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
                        {isLoading ? (
                            <div className="p-6 text-center">
                                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    Searching customers...
                                </p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((customer) => (
                                <button
                                    key={customer.id}
                                    type="button"
                                    onClick={() => onSelectCustomer(customer)}
                                    className="w-full cursor-pointer border-b p-3 text-left last:border-b-0 hover:bg-gray-100"
                                >
                                    <p className="font-medium">
                                        {customer.first_name}{' '}
                                        {customer.last_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {customer.phone_number}
                                    </p>
                                </button>
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
                    Existing customer selected
                </p>
            )}
        </div>
    );
}

function TextInput({
    id,
    label,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    hint,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
                id={id}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

function SelectInput({
    id,
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    required?: boolean;
    disabled?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Select disabled={disabled} value={value} onValueChange={onChange}>
                <SelectTrigger id={id}>
                    <SelectValue
                        placeholder={`Select ${label.toLowerCase()}`}
                    />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
