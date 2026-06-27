import ModuleHeading from '@/components/cards/module-heading';
import Pagination from '@/components/pagination';
import { CreditOrderFilters } from '@/components/pos-credit-orders/credit-order-filters';
import { CreditOrdersMobileList } from '@/components/pos-credit-orders/credit-orders-mobile-list';
import { CreditOrdersTable } from '@/components/pos-credit-orders/credit-orders-table';
import { buildCreditOrderParams } from '@/components/pos-credit-orders/formatters';
import { POSCreditOrderFilters } from '@/components/pos-credit-orders/types';
import AppLayout from '@/layouts/app-layout';
import {
    InstallmentOrderWithRelations,
    Location,
    Paginated,
    User as UserType,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    transactions: Paginated<InstallmentOrderWithRelations>;
    locations: Location[];
    employees: UserType[];
}

export default function Index({ transactions, locations, employees }: Props) {
    const query = useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );

    const [search, setSearch] = useState(query.get('search') || '');
    const [dateFrom, setDateFrom] = useState(query.get('date_from') || '');
    const [dateTo, setDateTo] = useState(query.get('date_to') || '');
    const [selectedLocation, setSelectedLocation] = useState(
        query.get('location_id') || 'all',
    );
    const [selectedStatus, setSelectedStatus] = useState(
        query.get('status') || 'all',
    );
    const [selectedItemType, setSelectedItemType] = useState(
        query.get('item_type') || 'all',
    );
    const [advancedFilter, setAdvancedFilter] = useState(
        query.get('advanced_filter') || 'all',
    );

    const filters: POSCreditOrderFilters = {
        search,
        dateFrom,
        dateTo,
        selectedLocation,
        selectedStatus,
        selectedItemType,
        advancedFilter,
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            router.get(
                '/pos-installment-orders',
                buildCreditOrderParams(filters),
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(debounce);
    }, [
        search,
        dateFrom,
        dateTo,
        selectedLocation,
        selectedStatus,
        selectedItemType,
        advancedFilter,
    ]);

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setSelectedLocation('all');
        setSelectedStatus('all');
        setSelectedItemType('all');
        setAdvancedFilter('all');
    };

    const hasActiveFilters =
        Boolean(dateFrom) ||
        Boolean(dateTo) ||
        selectedLocation !== 'all' ||
        selectedStatus !== 'all' ||
        selectedItemType !== 'all' ||
        advancedFilter !== 'all';

    const viewDetails = (orderNumber: string) => {
        router.visit(`/pos-installment-orders/${orderNumber}`);
    };

    const canViewDetails = window.can('can view installment order details');

    return (
        <AppLayout>
            <Head title="POS Installment Orders" />

            <div className="space-y-4 md:space-y-6">
                <ModuleHeading
                    title="POS Installment Orders"
                    description="View and manage all installment order transactions"
                />

                <CreditOrderFilters
                    filters={filters}
                    locations={locations}
                    employees={employees}
                    hasActiveFilters={hasActiveFilters}
                    setSearch={setSearch}
                    setDateFrom={setDateFrom}
                    setDateTo={setDateTo}
                    setSelectedLocation={setSelectedLocation}
                    setSelectedStatus={setSelectedStatus}
                    setSelectedItemType={setSelectedItemType}
                    setAdvancedFilter={setAdvancedFilter}
                    clearFilters={clearFilters}
                />

                <CreditOrdersTable
                    transactions={transactions.data}
                    canViewDetails={canViewDetails}
                    onViewDetails={viewDetails}
                />
                <CreditOrdersMobileList
                    transactions={transactions.data}
                    canViewDetails={canViewDetails}
                    onViewDetails={viewDetails}
                />

                <Pagination data={transactions} />
            </div>
        </AppLayout>
    );
}
