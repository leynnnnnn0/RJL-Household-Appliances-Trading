import type { Customer } from '@/components/pos-credit/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PHPhoneInput } from '@/components/ui/ph-phone-input';
import { SearchInput } from '@/components/ui/search-input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Users, X } from 'lucide-react';

interface CustomerInformationCardProps {
    searchQuery: string;
    searchResults: Customer[];
    showResults: boolean;
    selectedCustomer: Customer | null;
    isExistingCustomer: boolean;
    isLoadingCustomers: boolean;
    firstName: string;
    lastName: string;
    contact: string;
    email: string;
    address: string;
    city: string;
    province: string;
    zipcode: string;
    country: string;
    onSearch: (value: string) => void;
    onSelectCustomer: (customer: Customer) => void;
    onClearCustomer: () => void;
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
    onContactChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onAddressChange: (value: string) => void;
    onCityChange: (value: string) => void;
    onProvinceChange: (value: string) => void;
    onZipcodeChange: (value: string) => void;
    onCountryChange: (value: string) => void;
}

export function CustomerInformationCard({
    searchQuery,
    searchResults,
    showResults,
    isExistingCustomer,
    isLoadingCustomers,
    firstName,
    lastName,
    contact,
    email,
    address,
    city,
    province,
    zipcode,
    country,
    onSearch,
    onSelectCustomer,
    onClearCustomer,
    onFirstNameChange,
    onLastNameChange,
    onContactChange,
    onEmailChange,
    onAddressChange,
    onCityChange,
    onProvinceChange,
    onZipcodeChange,
    onCountryChange,
}: CustomerInformationCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <CustomerSearch
                    value={searchQuery}
                    results={searchResults}
                    showResults={showResults}
                    isExistingCustomer={isExistingCustomer}
                    isLoading={isLoadingCustomers}
                    onSearch={onSearch}
                    onSelectCustomer={onSelectCustomer}
                    onClearCustomer={onClearCustomer}
                />

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        id="firstName"
                        label="First Name *"
                        placeholder="Juan"
                        value={firstName}
                        disabled={isExistingCustomer}
                        onChange={onFirstNameChange}
                    />
                    <TextField
                        id="lastName"
                        label="Last Name *"
                        placeholder="Dela Cruz"
                        value={lastName}
                        disabled={isExistingCustomer}
                        onChange={onLastNameChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    <PHPhoneInput
                        id="contact"
                        value={contact}
                        disabled={isExistingCustomer}
                        onChange={onContactChange}
                    />
                </div>
                <TextField
                    id="email"
                    label="Email"
                    placeholder="Enter customer's email"
                    value={email}
                    disabled={isExistingCustomer}
                    onChange={onEmailChange}
                />

                <div className="space-y-2">
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                        disabled={isExistingCustomer}
                        id="address"
                        placeholder="Street, Barangay, City, Province"
                        rows={3}
                        value={address}
                        onChange={(event) =>
                            onAddressChange(event.target.value)
                        }
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        id="city"
                        label="City *"
                        placeholder="Enter city"
                        value={city}
                        disabled={isExistingCustomer}
                        onChange={onCityChange}
                    />
                    <TextField
                        id="province"
                        label="Province *"
                        placeholder="Enter province"
                        value={province}
                        disabled={isExistingCustomer}
                        onChange={onProvinceChange}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        id="zipcode"
                        label="Zipcode"
                        placeholder="Enter zipcode"
                        value={zipcode}
                        disabled={isExistingCustomer}
                        onChange={onZipcodeChange}
                    />
                    <TextField
                        id="country"
                        label="Country *"
                        placeholder="Enter country"
                        value={country}
                        disabled={isExistingCustomer}
                        onChange={onCountryChange}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function CustomerSearch({
    value,
    results,
    showResults,
    isExistingCustomer,
    isLoading,
    onSearch,
    onSelectCustomer,
    onClearCustomer,
}: {
    value: string;
    results: Customer[];
    showResults: boolean;
    isExistingCustomer: boolean;
    isLoading: boolean;
    onSearch: (value: string) => void;
    onSelectCustomer: (customer: Customer) => void;
    onClearCustomer: () => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor="searchCustomer">Search Existing Customer</Label>
            <div className="relative">
                <SearchInput
                    id="searchCustomer"
                    placeholder="Type customer name..."
                    value={value}
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
                        onClick={onClearCustomer}
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
                        ) : results.length > 0 ? (
                            results.map((customer) => (
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

function TextField({
    id,
    label,
    placeholder,
    value,
    disabled,
    onChange,
}: {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                disabled={disabled}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}
