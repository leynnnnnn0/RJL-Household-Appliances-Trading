import {
    formatCurrency,
    PAYMENT_TERMS,
    type PaymentBreakdown,
} from '@/components/pos-credit/credit-calculations';
import type { Product, SelectedProduct } from '@/components/pos-credit/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Briefcase, Loader2, Search, X } from 'lucide-react';

interface ItemPaymentDetailsCardProps {
    isPullOutItems: boolean;
    onPullOutToggle: (checked: boolean) => void;
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    isLoadingProducts: boolean;
    showDropdown: boolean;
    filteredProducts: Product[];
    selectedProducts: SelectedProduct[];
    editedSRPs: Record<string, number>;
    selectedTerm: number;
    totalLCP: number;
    downPayment: number;
    noDownPayment: boolean;
    noInterestRate: boolean;
    breakdown: PaymentBreakdown | null;
    onProductSelect: (product: Product) => void;
    onSRPChange: (productId: string, value: string) => void;
    onRemoveItem: (productId: string | number) => void;
    onToggleFree: (productId: string) => void;
    onTermSelect: (months: number) => void;
    onNoDownPaymentToggle: (checked: boolean) => void;
    onNoInterestRateToggle: (checked: boolean) => void;
    onDownPaymentChange: (value: string) => void;
}

export function ItemPaymentDetailsCard({
    isPullOutItems,
    onPullOutToggle,
    searchTerm,
    onSearchTermChange,
    isLoadingProducts,
    showDropdown,
    filteredProducts,
    selectedProducts,
    editedSRPs,
    selectedTerm,
    totalLCP,
    downPayment,
    noDownPayment,
    noInterestRate,
    breakdown,
    onProductSelect,
    onSRPChange,
    onRemoveItem,
    onToggleFree,
    onTermSelect,
    onNoDownPaymentToggle,
    onNoInterestRateToggle,
    onDownPaymentChange,
}: ItemPaymentDetailsCardProps) {
    return (
        <Card className="xl:col-span-2">
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
                                onCheckedChange={onPullOutToggle}
                            />
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <ProductSearch
                    value={searchTerm}
                    isLoading={isLoadingProducts}
                    showDropdown={showDropdown}
                    products={filteredProducts}
                    onChange={onSearchTermChange}
                    onProductSelect={onProductSelect}
                />

                {selectedProducts.length > 0 && (
                    <SelectedProductsTable
                        products={selectedProducts}
                        isPullOutItems={isPullOutItems}
                        editedSRPs={editedSRPs}
                        onSRPChange={onSRPChange}
                        onToggleFree={onToggleFree}
                        onRemoveItem={onRemoveItem}
                    />
                )}

                {selectedProducts.length > 0 && (
                    <PaymentDetails
                        selectedTerm={selectedTerm}
                        totalLCP={totalLCP}
                        downPayment={downPayment}
                        noDownPayment={noDownPayment}
                        noInterestRate={noInterestRate}
                        breakdown={breakdown}
                        onTermSelect={onTermSelect}
                        onNoDownPaymentToggle={onNoDownPaymentToggle}
                        onNoInterestRateToggle={onNoInterestRateToggle}
                        onDownPaymentChange={onDownPaymentChange}
                    />
                )}
            </CardContent>
        </Card>
    );
}

function ProductSearch({
    value,
    isLoading,
    showDropdown,
    products,
    onChange,
    onProductSelect,
}: {
    value: string;
    isLoading: boolean;
    showDropdown: boolean;
    products: Product[];
    onChange: (value: string) => void;
    onProductSelect: (product: Product) => void;
}) {
    return (
        <div className="space-y-2">
            <Label>Search Product *</Label>
            <div className="relative">
                <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                {isLoading && (
                    <Loader2 className="absolute top-3 right-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Input
                    placeholder="Search products..."
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="pl-9"
                />
                {showDropdown && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
                        {isLoading ? (
                            <div className="p-6 text-center">
                                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    Searching products...
                                </p>
                            </div>
                        ) : products.length > 0 ? (
                            products.map((product) => (
                                <button
                                    key={product.serial}
                                    type="button"
                                    onClick={() => onProductSelect(product)}
                                    className="w-full cursor-pointer border-b p-3 text-left last:border-b-0 hover:bg-accent"
                                >
                                    <div className="font-medium">
                                        {product.description}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {product.model} • Serial:{' '}
                                        {product.serial}
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-primary">
                                        ₱{formatCurrency(product.srp)}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-6 text-center">
                                <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    No products found
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Try a different search term
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function SelectedProductsTable({
    products,
    isPullOutItems,
    editedSRPs,
    onSRPChange,
    onToggleFree,
    onRemoveItem,
}: {
    products: SelectedProduct[];
    isPullOutItems: boolean;
    editedSRPs: Record<string, number>;
    onSRPChange: (productId: string, value: string) => void;
    onToggleFree: (productId: string) => void;
    onRemoveItem: (productId: string | number) => void;
}) {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[720px]">
                <thead className="bg-muted">
                    <tr>
                        <th className="p-3 text-left font-semibold">Product</th>
                        <th className="p-3 text-start font-semibold">SRP</th>
                        <th className="p-3 text-start font-semibold">Type</th>
                        <th className="p-3 text-start font-semibold">
                            Is free?
                        </th>
                        <th className="w-24 p-3 text-center font-semibold">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((item) => (
                        <tr
                            key={item.id}
                            className="border-t hover:bg-muted/50"
                        >
                            <td className="p-3">
                                <div className="font-medium">
                                    {item.description}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {item.model} • {item.serial}
                                </div>
                            </td>
                            <td className="p-3 text-start">
                                {isPullOutItems ? (
                                    <Input
                                        type="number"
                                        value={editedSRPs[item.id] ?? item.srp}
                                        onChange={(event) =>
                                            onSRPChange(
                                                item.id,
                                                event.target.value,
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
                            <td className="p-3 text-start">{item.item_type}</td>
                            <td className="p-3 text-start">
                                <Checkbox
                                    checked={item.isFree}
                                    onCheckedChange={() =>
                                        onToggleFree(item.id)
                                    }
                                />
                            </td>
                            <td className="p-3">
                                <div className="flex justify-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemoveItem(item.id)}
                                    >
                                        <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PaymentDetails({
    selectedTerm,
    totalLCP,
    downPayment,
    noDownPayment,
    noInterestRate,
    breakdown,
    onTermSelect,
    onNoDownPaymentToggle,
    onNoInterestRateToggle,
    onDownPaymentChange,
}: {
    selectedTerm: number;
    totalLCP: number;
    downPayment: number;
    noDownPayment: boolean;
    noInterestRate: boolean;
    breakdown: PaymentBreakdown | null;
    onTermSelect: (months: number) => void;
    onNoDownPaymentToggle: (checked: boolean) => void;
    onNoInterestRateToggle: (checked: boolean) => void;
    onDownPaymentChange: (value: string) => void;
}) {
    return (
        <div className="space-y-4">
            <Separator />
            <div>
                <Label>Payment Term *</Label>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {PAYMENT_TERMS.map((months) => (
                        <Card
                            key={months}
                            className={`cursor-pointer p-3 transition-colors hover:border-primary ${
                                selectedTerm === months
                                    ? 'border-primary bg-primary/5'
                                    : ''
                            }`}
                            onClick={() => onTermSelect(months)}
                        >
                            <div className="space-y-1 text-center">
                                <p className="text-2xl font-bold">{months}</p>
                                <p className="text-xs text-muted-foreground">
                                    months
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <SpecialOption
                    id="noDownPayment"
                    checked={noDownPayment}
                    label="No Down Payment (Special Option)"
                    onChange={onNoDownPaymentToggle}
                />
                <SpecialOption
                    id="noInterestRate"
                    checked={noInterestRate}
                    label="No Interest Rate (Special Option)"
                    onChange={onNoInterestRateToggle}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <CurrencyField label="LCP *" value={totalLCP} disabled />
                <CurrencyField
                    label="Down Payment *"
                    value={downPayment}
                    disabled={noDownPayment}
                    onChange={onDownPaymentChange}
                />
                <div className="space-y-2">
                    <Label>PNV (Promissory Note Value)</Label>
                    <div className="flex h-10 items-center rounded-md bg-muted px-3 py-2">
                        <span className="font-semibold">
                            ₱{formatCurrency(breakdown?.pnv ?? 0)}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        LCP - Down Payment
                    </p>
                </div>
            </div>

            {breakdown && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Monthly Payment
                                </p>
                                <p className="text-3xl font-bold text-primary">
                                    ₱{formatCurrency(breakdown.monthlyPayment)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                    Total Amount
                                </p>
                                <p className="text-xl font-semibold">
                                    ₱{formatCurrency(breakdown.totalAmount)}
                                </p>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="mb-3 grid gap-4 text-sm sm:grid-cols-2">
                            <BreakdownMetric
                                label="LCP (Loan Contract Price)"
                                value={breakdown.lcp}
                            />
                            <BreakdownMetric
                                label="PNV (Promissory Note)"
                                value={breakdown.pnv}
                            />
                        </div>
                        <div className="grid gap-4 text-sm sm:grid-cols-3">
                            <div>
                                <p className="text-muted-foreground">Term</p>
                                <p className="font-semibold">
                                    {selectedTerm} months
                                </p>
                            </div>
                            <BreakdownMetric
                                label="Down Payment"
                                value={breakdown.downPaymentAmount}
                            />
                            <BreakdownMetric
                                label="Total Interest"
                                value={breakdown.totalInterest}
                            />
                        </div>
                        {noDownPayment && (
                            <>
                                <Separator className="my-3" />
                                <p className="text-xs font-medium text-amber-600">
                                    No down payment option: Special 12-month
                                    rate applied (1.33x + ₱600)
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function SpecialOption({
    id,
    checked,
    label,
    onChange,
}: {
    id: string;
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center space-x-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
            <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
                {label}
            </Label>
        </div>
    );
}

function CurrencyField({
    label,
    value,
    disabled,
    onChange,
}: {
    label: string;
    value: number;
    disabled?: boolean;
    onChange?: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="relative">
                <span className="absolute top-2.5 left-3 text-muted-foreground">
                    ₱
                </span>
                <Input
                    type="number"
                    placeholder="0"
                    className="pl-7"
                    value={value}
                    disabled={disabled}
                    onChange={(event) => onChange?.(event.target.value)}
                />
            </div>
            <p className="text-xs text-muted-foreground">Initial payment</p>
        </div>
    );
}

function BreakdownMetric({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold">₱{formatCurrency(value)}</p>
        </div>
    );
}
