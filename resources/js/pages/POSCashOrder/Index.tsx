import ModuleHeading from '@/components/cards/module-heading';
import Pagination from '@/components/pagination';
import { CashOrderFilters } from '@/components/pos-cash-orders/cash-order-filters';
import { CashOrdersMobileList } from '@/components/pos-cash-orders/cash-orders-mobile-list';
import { CashOrdersTable } from '@/components/pos-cash-orders/cash-orders-table';
import {
    buildCashOrderParams,
    buildCashOrderSearchParams,
    getTodayDate,
} from '@/components/pos-cash-orders/formatters';
import { POSCashOrderFilters } from '@/components/pos-cash-orders/types';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import {
    Location,
    OrderWithrelations,
    Paginated,
    User as UserType,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    transactions: Paginated<OrderWithrelations>;
    locations: Location[];
    employees: UserType[];
}

export default function Index({ transactions, locations, employees }: Props) {
    const query = useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );
    const today = useMemo(() => getTodayDate(), []);

    const [search, setSearch] = useState(query.get('search') || '');
    const [dateFrom, setDateFrom] = useState(query.get('date_from') || today);
    const [dateTo, setDateTo] = useState(query.get('date_to') || today);
    const [selectedLocation, setSelectedLocation] = useState(
        query.get('location_id') || 'all',
    );
    const [selectedEmployee, setSelectedEmployee] = useState(
        query.get('employee_id') || 'all',
    );
    const [selectedStatus, setSelectedStatus] = useState(
        query.get('status') || 'all',
    );

    const filters: POSCashOrderFilters = {
        search,
        dateFrom,
        dateTo,
        selectedLocation,
        selectedEmployee,
        selectedStatus,
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            router.get('/pos-cash-orders', buildCashOrderParams(filters), {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(debounce);
    }, [
        search,
        dateFrom,
        dateTo,
        selectedLocation,
        selectedEmployee,
        selectedStatus,
    ]);

    const clearFilters = () => {
        setDateFrom(today);
        setDateTo(today);
        setSelectedLocation('all');
        setSelectedEmployee('all');
        setSelectedStatus('all');
    };

    const hasActiveFilters =
        dateFrom !== today ||
        dateTo !== today ||
        selectedLocation !== 'all' ||
        selectedEmployee !== 'all' ||
        selectedStatus !== 'all';

    const downloadPDF = () => {
        window.open(
            `/pos-cash-orders/download-pdf?${buildCashOrderSearchParams(
                filters,
            ).toString()}`,
            '_blank',
        );
    };

    const viewDetails = (orderNumber: string) => {
        router.visit(`/pos-cash-orders/${orderNumber}`);
    };

    const canViewDetails = window.can('can view cash order details');

    return (
        <AppLayout>
            <Head title="POS Cash Orders" />

            <div className="space-y-4 md:space-y-6">
                <ModuleHeading
                    title="POS Cash Orders"
                    description="View and manage all cash order transactions"
                >
                    <Button onClick={downloadPDF}>
                        <Download className="mr-2 h-4 w-4" /> Export to PDF
                    </Button>
                </ModuleHeading>

                <CashOrderFilters
                    filters={filters}
                    locations={locations}
                    employees={employees}
                    hasActiveFilters={hasActiveFilters}
                    setSearch={setSearch}
                    setDateFrom={setDateFrom}
                    setDateTo={setDateTo}
                    setSelectedLocation={setSelectedLocation}
                    setSelectedEmployee={setSelectedEmployee}
                    setSelectedStatus={setSelectedStatus}
                    clearFilters={clearFilters}
                />

                <CashOrdersTable
                    transactions={transactions.data}
                    canViewDetails={canViewDetails}
                    onViewDetails={viewDetails}
                />
                <CashOrdersMobileList
                    transactions={transactions.data}
                    canViewDetails={canViewDetails}
                    onViewDetails={viewDetails}
                />

                <Pagination data={transactions} />
            </div>
        </AppLayout>
    );
}
