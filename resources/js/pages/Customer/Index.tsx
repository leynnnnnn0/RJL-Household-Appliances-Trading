import PeopleIndexPage from '@/components/people/people-index-page';
import { Button } from '@/components/ui/button';
import { Customer, Paginated } from '@/types';
import { router } from '@inertiajs/react';
import { Eye, Pencil } from 'lucide-react';

interface PageProps {
    customers: Paginated<Customer>;
    filters?: {
        search?: string | null;
    };
}

export default function Index({ customers, filters }: PageProps) {
    const canViewDetails = window.can('can view customer details');

    return (
        <PeopleIndexPage
            title="Customers"
            description="Manage customer profiles and investigation records"
            records={customers}
            filters={filters}
            routeBase="/customers"
            searchPlaceholder="Search customers..."
            emptyTitle="No customers found"
            emptyDescription="Try adjusting your search"
            columns={[
                {
                    header: 'Full Name',
                    render: (customer) => customer.full_name,
                },
                {
                    header: 'Address',
                    render: (customer) => customer.address || '-',
                },
                {
                    header: 'Phone Number',
                    render: (customer) => customer.phone_number || '-',
                },
                ...(canViewDetails
                    ? [
                          {
                              header: 'Actions',
                              className: 'text-center font-semibold',
                              render: (customer: Customer) => (
                                  <div className="flex items-center justify-center gap-1">
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                              router.visit(
                                                  `/customers/${customer.id}`,
                                              )
                                          }
                                          aria-label="View customer"
                                      >
                                          <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                              router.visit(
                                                  `/customers/${customer.id}/edit`,
                                              )
                                          }
                                          aria-label="Edit customer"
                                      >
                                          <Pencil className="h-4 w-4" />
                                      </Button>
                                  </div>
                              ),
                          },
                      ]
                    : []),
            ]}
        />
    );
}
