import ReferenceResourcePage from '@/components/references/reference-resource-page';
import { Branch, Paginated } from '@/types';

interface PageProps {
    branches: Paginated<Branch>;
    filters?: {
        search?: string | null;
    };
}

export default function Index({ branches, filters }: PageProps) {
    return (
        <ReferenceResourcePage
            records={branches}
            filters={filters}
            resource={{
                singular: 'Branch',
                plural: 'Branches',
                title: 'Branches',
                description:
                    'Manage business branches used for sales, payments, and expenses',
                routeBase: '/branches',
                searchPlaceholder: 'Search branches...',
                emptyTitle: 'No branches found',
                emptyDescription:
                    'Try adjusting your search or create a new branch',
                deleteDescription:
                    'This action cannot be undone. Branches used by sales, payments, or expenses cannot be deleted.',
                showAddress: true,
            }}
        />
    );
}
