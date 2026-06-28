import ModuleHeading from '@/components/cards/module-heading';
import TableContainer from '@/components/cards/table-container';
import Pagination from '@/components/pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchInput } from '@/components/ui/search-input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRoleDate } from '@/lib/roles';
import { Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RoleIndexRecord {
    id: number;
    name: string;
    permissions_count: number;
    created_at: string;
}

interface Props {
    roles: Paginated<RoleIndexRecord>;
    filters: {
        search?: string;
    };
}

export default function Index({ roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/roles', search ? { search } : {}, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = (id: number) => {
        router.delete(`/roles/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Role Deleted Successfully.');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Roles" />
            <ModuleHeading
                title="Roles"
                description="Manage system roles and permissions"
            >
                <Button onClick={() => router.visit('/roles/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Role
                </Button>
            </ModuleHeading>

            <div className="space-y-4">
                <SearchInput
                    placeholder="Search roles..."
                    value={search}
                    onChange={setSearch}
                    className="sm:max-w-sm"
                />

                <div className="hidden md:block">
                    <TableContainer>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold">
                                        Role Name
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Permissions
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Created At
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.data.length === 0 ? (
                                    <EmptyRoleRow />
                                ) : (
                                    roles.data.map((role) => (
                                        <TableRow
                                            key={role.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <TableCell className="font-medium">
                                                {role.name}
                                            </TableCell>
                                            <TableCell>
                                                <PermissionCount
                                                    count={
                                                        role.permissions_count
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {formatRoleDate(
                                                    role.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <RoleActions
                                                    role={role}
                                                    onDelete={handleDelete}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                <div className="space-y-3 md:hidden">
                    {roles.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                                    <Search className="h-8 w-8" />
                                    <p className="font-medium">
                                        No roles found
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        roles.data.map((role) => (
                            <Card key={role.id}>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold break-words">
                                                {role.name}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Created{' '}
                                                {formatRoleDate(
                                                    role.created_at,
                                                )}
                                            </p>
                                        </div>
                                        <PermissionCount
                                            count={role.permissions_count}
                                        />
                                    </div>
                                    <RoleActions
                                        role={role}
                                        onDelete={handleDelete}
                                        mobile
                                    />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <Pagination data={roles} />
            </div>
        </AppLayout>
    );
}

function PermissionCount({ count }: { count: number }) {
    return (
        <Badge variant="outline" className="border-black text-black">
            {count} permissions
        </Badge>
    );
}

function EmptyRoleRow() {
    return (
        <TableRow>
            <TableCell colSpan={4} className="py-10 text-center text-gray-500">
                No roles found
            </TableCell>
        </TableRow>
    );
}

function RoleActions({
    role,
    onDelete,
    mobile = false,
}: {
    role: RoleIndexRecord;
    onDelete: (id: number) => void;
    mobile?: boolean;
}) {
    const buttonClass = mobile ? 'flex-1' : 'h-9 w-9';

    return (
        <div
            className={
                mobile
                    ? 'flex items-center gap-2 border-t pt-3'
                    : 'flex items-center justify-center gap-1'
            }
        >
            <Button
                variant="ghost"
                size={mobile ? 'sm' : 'icon'}
                className={buttonClass}
                onClick={() => router.visit(`/roles/${role.id}`)}
            >
                <Eye className="h-4 w-4" />
                {mobile && <span className="ml-2">View</span>}
            </Button>
            <Button
                variant="ghost"
                size={mobile ? 'sm' : 'icon'}
                className={buttonClass}
                onClick={() => router.visit(`/roles/${role.id}/edit`)}
            >
                <Pencil className="h-4 w-4" />
                {mobile && <span className="ml-2">Edit</span>}
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size={mobile ? 'sm' : 'icon'}
                        className={buttonClass}
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this role? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(role.id)}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
