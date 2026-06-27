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
                    render: (user) => user.full_name,
                },
                {
                    header: 'Email',
                    render: (user) => user.email,
                },
                {
                    header: 'Phone',
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
                                          className="h-8 w-8"
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
