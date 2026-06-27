import PeopleIndexPage from '@/components/people/people-index-page';
import { Button } from '@/components/ui/button';
import { Paginated, User } from '@/types';
import { router } from '@inertiajs/react';
import { Eye } from 'lucide-react';

interface PageProps {
    users: Paginated<User>;
    filters?: {
        search?: string | null;
    };
}

export default function Index({ users, filters }: PageProps) {
    const canViewDetails = window.can('can view user details');

    return (
        <PeopleIndexPage
            title="Users"
            description="Manage system accounts and access roles"
            records={users}
            filters={filters}
            routeBase="/users"
            searchPlaceholder="Search users..."
            emptyTitle="No users found"
            emptyDescription="Try adjusting your search or create a new user"
            action={{
                label: 'Add New User',
                href: '/users/create',
                can: window.can('can add user'),
            }}
            columns={[
                {
                    header: 'Full Name',
                    render: (user) => (
                        <div className="flex min-w-0 flex-col">
                            <span className="font-medium break-words">
                                {user.full_name}
                            </span>
                            <span className="mt-1 text-xs break-all text-muted-foreground sm:hidden">
                                {user.email}
                            </span>
                            <span className="mt-1 text-xs text-muted-foreground md:hidden">
                                {user.phone_number || 'No phone'}
                            </span>
                        </div>
                    ),
                },
                {
                    header: 'Email',
                    className:
                        'hidden min-w-[220px] font-semibold sm:table-cell',
                    cellClassName: 'hidden break-all sm:table-cell',
                    render: (user) => user.email,
                },
                {
                    header: 'Phone',
                    className:
                        'hidden min-w-[140px] font-semibold md:table-cell',
                    cellClassName: 'hidden md:table-cell',
                    render: (user) => user.phone_number || '-',
                },
                ...(canViewDetails
                    ? [
                          {
                              header: 'Actions',
                              className: 'text-center font-semibold',
                              render: (user: User) => (
                                  <div className="flex items-center justify-center gap-1">
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-11 w-11 sm:h-9 sm:w-9"
                                          onClick={() =>
                                              router.visit(`/users/${user.id}`)
                                          }
                                          aria-label="View user"
                                      >
                                          <Eye className="h-4 w-4" />
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
