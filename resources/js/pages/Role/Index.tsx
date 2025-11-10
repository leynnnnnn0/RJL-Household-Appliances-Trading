import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination";
import { useState, useEffect } from "react";
import { Paginated } from "@/types";
import SearchBox from "@/components/cards/search-box";
import TableContainer from "@/components/cards/table-container";
import { toast } from "sonner";

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions_count: number;
    created_at: string;
}

interface Props {
    roles: Paginated<Role>
    filters: {
        search?: string;
    };
}

export default function Index({ roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('roles.index'),
                { search },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = (id: number) => {
        router.delete(route('roles.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Role Deleted Successfully.");
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Roles" />
            <ModuleHeading title="Roles" description="Manage system roles and permissions">
                <Link href={route('roles.create')}>
                    <Button className="bg-black text-white hover:bg-gray-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Role
                    </Button>
                </Link>
            </ModuleHeading>

                     <SearchBox>
                                   <Input
                                       placeholder="Search users..."
                                       value={search}
                                       onChange={(e) => setSearch(e.target.value)}
                                       className="pl-10"
                                   />
                               </SearchBox>

                    <TableContainer>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold">Role Name</TableHead>
                                    <TableHead className="font-semibold">Permissions</TableHead>
                                    <TableHead className="font-semibold">Created At</TableHead>
                                    <TableHead className="tont-semibold text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                            No roles found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roles.data.map((role) => (
                                        <TableRow key={role.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-black text-black">
                                                    {role.permissions_count} permissions
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {new Date(role.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={route('roles.show', role.id)}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-black hover:bg-gray-100"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('roles.edit', role.id)}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-black hover:bg-gray-100"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-black hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="border-black">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this role? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="border-black">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(role.id)}
                                                                    className="bg-black text-white hover:bg-gray-800"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                           <Pagination data={roles} />

        </AppLayout>
    );
}