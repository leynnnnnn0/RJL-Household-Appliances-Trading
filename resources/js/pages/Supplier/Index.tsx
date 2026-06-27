import ReferenceResourcePage from '@/components/references/reference-resource-page';
import { Paginated, Supplier } from '@/types';

interface PageProps {
    suppliers: Paginated<Supplier>;
    filters?: {
        search?: string | null;
    };
}

export default function Index({ suppliers, filters }: PageProps) {
    return (
        <ReferenceResourcePage
            records={suppliers}
            filters={filters}
            resource={{
                singular: 'Supplier',
                plural: 'Suppliers',
                title: 'Suppliers',
                description: 'Manage inventory suppliers',
                routeBase: '/suppliers',
                searchPlaceholder: 'Search suppliers...',
                emptyTitle: 'No suppliers found',
                emptyDescription:
                    'Try adjusting your search or create a new supplier',
                deleteDescription:
                    'This action cannot be undone. Suppliers with associated inventory items cannot be deleted.',
                showSlug: true,
                nameTransform: (value) => value.toUpperCase(),
            }}
        />
    );
}
