import {
    InstallmentOrderWithRelations,
    Location,
    User as UserType,
} from '@/types';

export type POSCreditOrderFilters = {
    search: string;
    dateFrom: string;
    dateTo: string;
    selectedLocation: string;
    selectedStatus: string;
    selectedItemType: string;
    advancedFilter: string;
};

export type POSCreditOrderFilterOptions = {
    locations: Location[];
    employees: UserType[];
};

export type POSCreditOrderFilterActions = {
    setSearch: (value: string) => void;
    setDateFrom: (value: string) => void;
    setDateTo: (value: string) => void;
    setSelectedLocation: (value: string) => void;
    setSelectedStatus: (value: string) => void;
    setSelectedItemType: (value: string) => void;
    setAdvancedFilter: (value: string) => void;
    clearFilters: () => void;
};

export type POSCreditOrderListProps = {
    transactions: InstallmentOrderWithRelations[];
    canViewDetails: boolean;
    onViewDetails: (orderNumber: string) => void;
};
