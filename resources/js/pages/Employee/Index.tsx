import ModuleHeading from '@/components/cards/module-heading';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Employee, Paginated } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type EmployeeForm = {
    first_name: string;
    last_name: string;
    remarks: string;
};

interface PageProps {
    employees: Paginated<Employee>;
    filters?: {
        search?: string | null;
    };
}

export default function Index({ employees, filters }: PageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
        null,
    );
    const hasMounted = useRef(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<EmployeeForm>({
            first_name: '',
            last_name: '',
            remarks: '',
        });

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        const timer = window.setTimeout(() => {
            router.get('/employees', search ? { search } : {}, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [search]);

    const resetForm = () => {
        reset();
        clearErrors();
        setEmployeeToEdit(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const openEditDialog = (employee: Employee) => {
        setEmployeeToEdit(employee);
        clearErrors();
        setData({
            first_name: employee.first_name,
            last_name: employee.last_name,
            remarks: employee.remarks ?? '',
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `Employee ${employeeToEdit ? 'updated' : 'created'} successfully.`,
                );
                setIsFormOpen(false);
                resetForm();
            },
            onError: () => {
                toast.error(
                    `Unable to ${employeeToEdit ? 'update' : 'create'} employee.`,
                );
            },
        };

        if (employeeToEdit) {
            put(`/employees/${employeeToEdit.id}`, options);
            return;
        }

        post('/employees', options);
    };

    const handleDelete = () => {
        if (!employeeToDelete) return;

        router.delete(`/employees/${employeeToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Employee deleted successfully.');
                setEmployeeToDelete(null);
            },
            onError: (pageErrors) => {
                toast.error(pageErrors.error ?? 'Unable to delete employee.');
                setEmployeeToDelete(null);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Employees" />
            <ModuleHeading
                title="Employees"
                description="Manage employees used for customer investigations"
            >
                <Button
                    onClick={openCreateDialog}
                    className="min-h-11 w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Employee
                </Button>
            </ModuleHeading>

            <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Search employees..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[160px] font-semibold">
                                        Name
                                    </TableHead>
                                    <TableHead className="hidden min-w-[220px] font-semibold sm:table-cell">
                                        Remarks
                                    </TableHead>
                                    <TableHead className="min-w-[110px] text-center font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={100}
                                            className="h-56 w-full p-0 whitespace-normal"
                                        >
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                                                <Search className="mb-2 h-8 w-8" />
                                                <p className="font-medium">
                                                    No employees found
                                                </p>
                                                <p className="px-4 text-sm">
                                                    Try adjusting your search or
                                                    create a new employee
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employees.data.map((employee) => (
                                        <TableRow
                                            key={employee.id}
                                            className="transition-colors hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <div className="flex min-w-0 flex-col">
                                                    <span className="font-medium break-words">
                                                        {employee.full_name}
                                                    </span>
                                                    <span className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:hidden">
                                                        {employee.remarks ||
                                                            'No remarks'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {employee.remarks || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-11 w-11 sm:h-9 sm:w-9"
                                                        onClick={() =>
                                                            openEditDialog(
                                                                employee,
                                                            )
                                                        }
                                                        aria-label="Edit employee"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-11 w-11 text-destructive hover:text-destructive sm:h-9 sm:w-9"
                                                        onClick={() =>
                                                            setEmployeeToDelete(
                                                                employee,
                                                            )
                                                        }
                                                        aria-label="Delete employee"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Pagination data={employees} />
            </div>

            <Dialog
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogContent className="max-h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {employeeToEdit
                                ? 'Edit Employee'
                                : 'Create New Employee'}
                        </DialogTitle>
                        <DialogDescription>
                            {employeeToEdit
                                ? 'Update the employee information below.'
                                : 'Add a new employee to the system.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(event) =>
                                        setData(
                                            'first_name',
                                            event.target.value,
                                        )
                                    }
                                />
                                {errors.first_name && (
                                    <p className="text-sm text-destructive">
                                        {errors.first_name}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(event) =>
                                        setData('last_name', event.target.value)
                                    }
                                />
                                {errors.last_name && (
                                    <p className="text-sm text-destructive">
                                        {errors.last_name}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(event) =>
                                        setData('remarks', event.target.value)
                                    }
                                    rows={3}
                                />
                                {errors.remarks && (
                                    <p className="text-sm text-destructive">
                                        {errors.remarks}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                                className="min-h-11 w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="min-h-11 w-full sm:w-auto"
                            >
                                {employeeToEdit
                                    ? 'Update Employee'
                                    : 'Create Employee'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={!!employeeToDelete}
                onOpenChange={(open) => !open && setEmployeeToDelete(null)}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. Employees assigned to
                            customer investigations cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <AlertDialogCancel className="min-h-11 w-full sm:w-auto">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="min-h-11 w-full bg-destructive text-white hover:bg-destructive/90 sm:w-auto"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
