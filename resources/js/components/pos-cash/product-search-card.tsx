import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchInput } from '@/components/ui/search-input';
import { formatPOSCashCurrency, POSCashProduct } from '@/lib/pos-cash';
import { Loader2, Plus, Search } from 'lucide-react';

interface ProductSearchCardProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isLoading: boolean;
    showDropdown: boolean;
    products: POSCashProduct[];
    selectedProduct: POSCashProduct | null;
    onSelectProduct: (product: POSCashProduct) => void;
    saleAmount: string;
    onSaleAmountChange: (value: string) => void;
    isFree: boolean;
    onFreeChange: () => void;
    saleAmountError: string;
    onAddOrder: () => void;
    canAddOrder: boolean;
}

export default function ProductSearchCard({
    searchTerm,
    onSearchChange,
    isLoading,
    showDropdown,
    products,
    selectedProduct,
    onSelectProduct,
    saleAmount,
    onSaleAmountChange,
    isFree,
    onFreeChange,
    saleAmountError,
    onAddOrder,
    canAddOrder,
}: ProductSearchCardProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Search</CardTitle>
                    <CardDescription>
                        Search by description, model or serial number
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        {isLoading && (
                            <Loader2 className="absolute top-3 right-3 z-10 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        <SearchInput
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={onSearchChange}
                            inputClassName={isLoading ? 'pr-9' : ''}
                        />
                        {showDropdown && (
                            <ProductSearchResults
                                isLoading={isLoading}
                                products={products}
                                onSelectProduct={onSelectProduct}
                            />
                        )}
                    </div>

                    {selectedProduct && (
                        <SelectedProductDetails product={selectedProduct} />
                    )}
                </CardContent>
            </Card>

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
                            onChange={(event) =>
                                onSaleAmountChange(event.target.value)
                            }
                        />
                        {saleAmountError && (
                            <p className="text-sm text-destructive">
                                {saleAmountError}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is-free"
                            checked={isFree}
                            onCheckedChange={onFreeChange}
                        />
                        <Label htmlFor="is-free">Is free?</Label>
                    </div>
                    <Button
                        onClick={onAddOrder}
                        disabled={!canAddOrder}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Orders
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function ProductSearchResults({
    isLoading,
    products,
    onSelectProduct,
}: {
    isLoading: boolean;
    products: POSCashProduct[];
    onSelectProduct: (product: POSCashProduct) => void;
}) {
    return (
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
                        onClick={() => onSelectProduct(product)}
                        className="w-full cursor-pointer border-b p-3 text-left last:border-b-0 hover:bg-accent"
                    >
                        <div className="font-medium">{product.description}</div>
                        <div className="text-sm text-muted-foreground">
                            {product.model}
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
    );
}

function SelectedProductDetails({ product }: { product: POSCashProduct }) {
    return (
        <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <ProductField label="Supplier" value={product.supplier} />
                <ProductField label="Serial Number" value={product.serial} />
                <ProductField label="Description" value={product.description} />
                <ProductField label="Model" value={product.model} />
                <ProductField
                    label="SRP"
                    value={formatPOSCashCurrency(product.srp)}
                    strong
                />
            </div>
        </div>
    );
}

function ProductField({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <p className={strong ? 'font-semibold' : 'font-medium'}>{value}</p>
        </div>
    );
}
