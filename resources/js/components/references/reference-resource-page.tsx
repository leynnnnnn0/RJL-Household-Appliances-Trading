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
import { SearchInput } from '@/components/ui/search-input';
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
import { Paginated } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export type ReferenceRecord = {
    id: number;
    name: string;
    address?: string | null;
    remarks?: string | null;
    slug?: string | null;
};

type ReferenceForm = {
    name: string;
    address: string;
    remarks: string;
};

type ReferenceResourcePageProps<TRecord extends ReferenceRecord> = {
    records: Paginated<TRecord>;
    filters?: {
        search?: string | null;
    };
    resource: {
        singular: string;
        plural: string;
        title: string;
        description: string;
        routeBase: string;
        searchPlaceholder: string;
        emptyTitle: string;
        emptyDescription: string;
        deleteDescription: string;
        showAddress?: boolean;
        showSlug?: boolean;
        nameTransform?: (value: string) => string;
    };
};

export default function ReferenceResourcePage<TRecord extends ReferenceRecord>({
    records,
    filters,
    resource,
}: ReferenceResourcePageProps<TRecord>) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<TRecord | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<TRecord | null>(null);
    const hasMounted = useRef(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<ReferenceForm>({
            name: '',
            address: '',
            remarks: '',
        });

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        const timer = window.setTimeout(() => {
            router.get(resource.routeBase, search ? { search } : {}, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [resource.routeBase, search]);

    const resetForm = () => {
        reset();
        clearErrors();
        setEditingRecord(null);
    };

    const handleCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEdit = (record: TRecord) => {
        setEditingRecord(record);
        clearErrors();
        setData({
            name: record.name,
            address: record.address ?? '',
            remarks: record.remarks ?? '',
        });
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `${resource.singular} ${editingRecord ? 'updated' : 'created'} successfully.`,
                );
                setIsDialogOpen(false);
                resetForm();
            },
            onError: (pageErrors: Record<string, string>) => {
                toast.error(
                    pageErrors.error ??
                        `Unable to ${editingRecord ? 'update' : 'create'} ${resource.singular.toLowerCase()}.`,
                );
            },
        };

        if (editingRecord) {
            put(`${resource.routeBase}/${editingRecord.id}`, options);
            return;
        }

        post(resource.routeBase, options);
    };

    const handleDeleteConfirm = () => {
        if (!deleteRecord) return;

        router.delete(`${resource.routeBase}/${deleteRecord.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${resource.singular} deleted successfully.`);
                setIsDeleteDialogOpen(false);
                setDeleteRecord(null);
            },
            onError: (pageErrors) => {
                toast.error(
                    pageErrors.error ??
                        `Unable to delete ${resource.singular.toLowerCase()}.`,
                );
            },
        });
    };

    const openDeleteDialog = (record: TRecord) => {
        setDeleteRecord(record);
        setIsDeleteDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title={resource.title} />
            <ModuleHeading
                title={resource.title}
                description={resource.description}
            >
                <Button
                    onClick={handleCreate}
                    className="min-h-11 w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Create New</span>
                </Button>
            </ModuleHeading>

            <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={resource.searchPlaceholder}
                        className="sm:max-w-sm"
                    />
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[120px] font-semibold">
                                        Name
                                    </TableHead>
                                    {resource.showSlug && (
                                        <TableHead className="hidden min-w-[100px] font-semibold sm:table-cell">
                                            Slug
                                        </TableHead>
                                    )}
                                    {resource.showAddress && (
                                        <TableHead className="hidden min-w-[150px] font-semibold sm:table-cell">
                                            Address
                                        </TableHead>
                                    )}
                                    <TableHead className="hidden min-w-[150px] font-semibold md:table-cell">
                                        Remarks
                                    </TableHead>
                                    <TableHead className="min-w-[100px] text-center font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={100}
                                            className="h-56 w-full p-0 whitespace-normal"
                                        >
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                                                <Search className="mb-2 h-8 w-8" />
                                                <p className="font-medium">
                                                    {resource.emptyTitle}
                                                </p>
                                                <p className="px-4 text-sm">
                                                    {resource.emptyDescription}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.data.map((record) => (
                                        <TableRow
                                            key={record.id}
                                            className="transition-colors hover:bg-muted/50"
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{record.name}</span>
                                                    {resource.showSlug &&
                                                        record.slug && (
                                                            <span className="text-xs text-muted-foreground sm:hidden">
                                                                {record.slug}
                                                            </span>
                                                        )}
                                                    {resource.showAddress && (
                                                        <span className="mt-1 text-xs text-muted-foreground sm:hidden">
                                                            {record.address ??
                                                                'No address'}
                                                        </span>
                                                    )}
                                                    <span className="mt-1 text-xs text-muted-foreground md:hidden">
                                                        {record.remarks ??
                                                            'No remarks'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {resource.showSlug && (
                                                <TableCell className="hidden sm:table-cell">
                                                    {record.slug}
                                                </TableCell>
                                            )}
                                            {resource.showAddress && (
                                                <TableCell className="hidden sm:table-cell">
                                                    {record.address ?? 'None'}
                                                </TableCell>
                                            )}
                                            <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                                                {record.remarks ?? 'None'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-11 w-11 sm:h-9 sm:w-9"
                                                        onClick={() =>
                                                            handleEdit(record)
                                                        }
                                                        aria-label={`Edit ${resource.singular.toLowerCase()}`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-11 w-11 text-destructive hover:text-destructive sm:h-9 sm:w-9"
                                                        onClick={() =>
                                                            openDeleteDialog(
                                                                record,
                                                            )
                                                        }
                                                        aria-label={`Delete ${resource.singular.toLowerCase()}`}
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

                <Pagination data={records} />
            </div>

            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogContent className="max-h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRecord
                                ? `Edit ${resource.singular}`
                                : `Create New ${resource.singular}`}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRecord
                                ? `Update the ${resource.singular.toLowerCase()} details below.`
                                : `Enter the details for the new ${resource.singular.toLowerCase()}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                placeholder={`Enter ${resource.singular.toLowerCase()} name`}
                                value={data.name}
                                onChange={(event) =>
                                    setData(
                                        'name',
                                        resource.nameTransform
                                            ? resource.nameTransform(
                                                  event.target.value,
                                              )
                                            : event.target.value,
                                    )
                                }
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        {resource.showAddress && (
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    placeholder="Enter address"
                                    value={data.address}
                                    onChange={(event) =>
                                        setData('address', event.target.value)
                                    }
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">
                                        {errors.address}
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                placeholder="Enter remarks (optional)"
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
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="min-h-11 w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={processing}
                            className="min-h-11 w-full sm:w-auto"
                        >
                            {editingRecord ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {resource.deleteDescription}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <AlertDialogCancel className="min-h-11 w-full sm:w-auto">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
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
