import { Location, OrderWithrelations, User as UserType } from '@/types';

export type POSCashOrderFilters = {
    search: string;
    dateFrom: string;
    dateTo: string;
    selectedLocation: string;
    selectedEmployee: string;
    selectedStatus: string;
};

export type POSCashOrderFilterActions = {
    setSearch: (value: string) => void;
    setDateFrom: (value: string) => void;
    setDateTo: (value: string) => void;
    setSelectedLocation: (value: string) => void;
    setSelectedEmployee: (value: string) => void;
    setSelectedStatus: (value: string) => void;
    clearFilters: () => void;
};

export type POSCashOrderFilterOptions = {
    locations: Location[];
    employees: UserType[];
};

export type POSCashOrderListProps = {
    transactions: OrderWithrelations[];
    canViewDetails: boolean;
    onViewDetails: (orderNumber: string) => void;
};
