import OrdersCard from '@/components/pos-cash/orders-card';
import ProductSearchCard from '@/components/pos-cash/product-search-card';
import TransactionHistorySheet from '@/components/pos-cash/transaction-history-sheet';
import { POSCashCartItem, POSCashProduct } from '@/lib/pos-cash';
import { Location, OrderWithrelations, User } from '@/types';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PageProps {
    employees: User[];
    locations: Location[];
    transactions: OrderWithrelations[];
}

export default function Index({
    locations,
    employees,
    transactions,
}: PageProps) {
    const { auth } = usePage().props as any;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] =
        useState<POSCashProduct | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState(
        auth.user.id.toString(),
    );
    const [selectedLocation, setSelectedLocation] = useState(
        locations[0]?.id.toString() ?? '',
    );
    const [saleAmount, setSaleAmount] = useState('');
    const [orders, setOrders] = useState<POSCashCartItem[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<POSCashProduct[]>(
        [],
    );
    const [showDropdown, setShowDropdown] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [saleAmountError, setSaleAmountError] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        if (searchTerm.trim().length === 0) {
            setFilteredProducts([]);
            setShowDropdown(false);
            setIsLoadingProducts(false);
            return;
        }

        setIsLoadingProducts(true);
        const timeout = window.setTimeout(() => {
            axios
                .get('/api/items', {
                    params: { search: searchTerm, location: selectedLocation },
                })
                .then((response) => {
                    setFilteredProducts(response.data?.data || []);
                    setShowDropdown(true);
                })
                .catch((error) => {
                    console.error('Error fetching products:', error);
                    setFilteredProducts([]);
                    setShowDropdown(false);
                })
                .finally(() => setIsLoadingProducts(false));
        }, 500);

        return () => window.clearTimeout(timeout);
    }, [searchTerm, selectedLocation]);

    useEffect(() => {
        setShowDropdown(false);
    }, [selectedLocation]);

    useEffect(() => {
        setSaleAmount(isFree ? '0' : '');
    }, [isFree]);

    const handleProductSelect = (product: POSCashProduct) => {
        if (orders.some((item) => item.id === product.serial)) {
            toast.info('This item is already on the order list');
            return;
        }

        setIsFree(false);
        setSelectedProduct(product);
        setSearchTerm(product.description);
        setSaleAmount(product.srp.toString());
        setShowDropdown(false);
    };

    const handleAddOrder = () => {
        if (!selectedProduct || !saleAmount) {
            return;
        }

        if (!isFree && Number(saleAmount) < Number(selectedProduct.unit_cost)) {
            setSaleAmountError(
                `Amount should be higher than the unit cost. (${selectedProduct.unit_cost})`,
            );
            return;
        }

        setSaleAmountError('');

        const employee = employees.find(
            (employee) => employee.id === parseInt(selectedEmployee),
        );

        if (!employee) {
            return;
        }

        const now = new Date();
        setOrders((current) => [
            {
                id: selectedProduct.serial,
                product: selectedProduct,
                employee,
                saleAmount: parseFloat(saleAmount),
                timestamp: now.toLocaleString(),
                date: now.toISOString().split('T')[0],
            },
            ...current,
        ]);

        setSelectedProduct(null);
        setSearchTerm('');
        setSaleAmount('');
    };

    const handleOrderCreated = () => {
        setOrders([]);
        setSelectedProduct(null);
        setSaleAmount('');
        setSearchTerm('');
    };

    return (
        <div className="container mx-auto max-w-7xl p-4 sm:p-6">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <a
                    href="/"
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <span className="text-xl font-bold text-primary-foreground">
                            P
                        </span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Point of Sale
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Search products and process sales
                        </p>
                    </div>
                </a>

                <TransactionHistorySheet
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    transactions={transactions}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ProductSearchCard
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoadingProducts}
                        showDropdown={showDropdown}
                        products={filteredProducts}
                        selectedProduct={selectedProduct}
                        onSelectProduct={handleProductSelect}
                        saleAmount={saleAmount}
                        onSaleAmountChange={setSaleAmount}
                        isFree={isFree}
                        onFreeChange={() => setIsFree((current) => !current)}
                        saleAmountError={saleAmountError}
                        onAddOrder={handleAddOrder}
                        canAddOrder={
                            !!selectedProduct &&
                            !!selectedEmployee &&
                            !!saleAmount
                        }
                    />
                </div>

                <OrdersCard
                    orders={orders}
                    onRemoveOrder={(orderId) =>
                        setOrders((current) =>
                            current.filter((order) => order.id !== orderId),
                        )
                    }
                    checkoutOpen={checkoutOpen}
                    onCheckoutOpenChange={setCheckoutOpen}
                    employees={employees}
                    locations={locations}
                    selectedEmployee={selectedEmployee}
                    onSelectedEmployeeChange={setSelectedEmployee}
                    selectedLocation={selectedLocation}
                    onSelectedLocationChange={setSelectedLocation}
                    onOrderCreated={handleOrderCreated}
                />
            </div>
        </div>
    );
}
