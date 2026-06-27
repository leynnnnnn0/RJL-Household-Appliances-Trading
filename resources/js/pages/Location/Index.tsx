import ReferenceResourcePage from '@/components/references/reference-resource-page';
import { Location, Paginated } from '@/types';

interface PageProps {
    locations: Paginated<Location>;
    filters?: {
        search?: string | null;
    };
}

export default function Index({ locations, filters }: PageProps) {
    return (
        <ReferenceResourcePage
            records={locations}
            filters={filters}
            resource={{
                singular: 'Location',
                plural: 'Locations',
                title: 'Locations',
                description: 'Manage inventory storage locations',
                routeBase: '/locations',
                searchPlaceholder: 'Search locations...',
                emptyTitle: 'No locations found',
                emptyDescription:
                    'Try adjusting your search or create a new location',
                deleteDescription:
                    'This action cannot be undone. Locations with associated inventory items cannot be deleted.',
                showAddress: true,
            }}
        />
    );
}
