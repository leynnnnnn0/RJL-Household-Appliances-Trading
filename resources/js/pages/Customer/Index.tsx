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
                    render: (customer) => (
                        <div className="flex min-w-0 flex-col">
                            <span className="font-medium break-words">
                                {customer.full_name}
                            </span>
                            <span className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:hidden">
                                {customer.address || 'No address'}
                            </span>
                            <span className="mt-1 text-xs text-muted-foreground md:hidden">
                                {customer.phone_number || 'No phone'}
                            </span>
                        </div>
                    ),
                },
                {
                    header: 'Address',
                    className:
                        'hidden min-w-[240px] font-semibold sm:table-cell',
                    cellClassName: 'hidden max-w-[360px] sm:table-cell',
                    render: (customer) => customer.address || '-',
                },
                {
                    header: 'Phone Number',
                    className:
                        'hidden min-w-[150px] font-semibold md:table-cell',
                    cellClassName: 'hidden md:table-cell',
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
                                          className="h-11 w-11 sm:h-9 sm:w-9"
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
                                          className="h-11 w-11 sm:h-9 sm:w-9"
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
