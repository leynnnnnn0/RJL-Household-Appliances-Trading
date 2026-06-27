import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ImportProps {
    items?: any[];
}

export default function Import({ items }: ImportProps) {
    const [open, setOpen] = useState(false);
    const [errorDialog, setErrorDialog] = useState({
        open: false,
        title: '',
        message: '',
    });

    const { data, setData, post, processing, reset } = useForm({
        file: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
        }
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('items.import.upload'), {
            onSuccess: () => {
                setOpen(false);
                reset();
                toast.success(
                    'File imported successfully! Review the data below.',
                );
            },
            onError: (errors) => {
                console.error(errors);
                const errorMessage =
                    errors.file ||
                    errors.error ||
                    'Failed to import file. Please check the file format and try again.';

                setErrorDialog({
                    open: true,
                    title: 'Import Failed',
                    message: Array.isArray(errorMessage)
                        ? errorMessage[0]
                        : errorMessage,
                });
            },
        });
    };

    const handleSave = () => {
        router.post(
            route('items.import.save'),
            {},
            {
                onSuccess: () => {
                    toast.success('Items saved to database successfully!');
                },
                onError: (errors) => {
                    const errorMessage =
                        errors.error || 'Failed to save items to database.';

                    setErrorDialog({
                        open: true,
                        title: 'Save Failed',
                        message: Array.isArray(errorMessage)
                            ? errorMessage[0]
                            : errorMessage,
                    });
                },
            },
        );
    };

    const handleCancel = () => {
        router.post(route('items.import.cancel'));
    };

    return (
        <AppLayout>
            <Head title="Import Items" />

            <ModuleHeading
                title="Import Items from Excel"
                description="Use the provided excel format"
            >
                <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
                    {items && items.length > 0 && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="min-h-11 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="min-h-11 cursor-pointer bg-green-600 hover:bg-green-700"
                            >
                                Save to Database ({items.length} items)
                            </Button>
                        </>
                    )}

                    <BackButton />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="min-h-11 cursor-pointer">
                                Import
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <form onSubmit={handleImport}>
                                <DialogHeader>
                                    <DialogTitle>Import Data</DialogTitle>
                                    <DialogDescription>
                                        Please make sure your excel file follows
                                        the correct format.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-3 py-4">
                                    <Label htmlFor="file">Excel File</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        required
                                    />
                                    <a
                                        href={route('items.export.template')}
                                        className="text-xs text-blue-600 underline hover:text-blue-800"
                                    >
                                        Download Template Format
                                    </a>
                                </div>
                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.file}
                                    >
                                        {processing ? 'Importing...' : 'Import'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </ModuleHeading>

            <AlertDialog
                open={errorDialog.open}
                onOpenChange={(open) =>
                    setErrorDialog({ ...errorDialog, open })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <AlertDialogTitle className="text-red-600">
                                {errorDialog.title}
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="pt-4 text-left whitespace-pre-wrap">
                            {errorDialog.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() =>
                                setErrorDialog({
                                    open: false,
                                    title: '',
                                    message: '',
                                })
                            }
                        >
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {items && items.length > 0 && (
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                    <AlertDescription>
                        Preview: {items.length} items imported. Review the data
                        below and click "Save to Database" to confirm.
                    </AlertDescription>
                </Alert>
            )}

            <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                    <Table className="min-w-[1100px]">
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="text-[10px] font-light">
                                    Row
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Supplier
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Location
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Item Type
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    DR Number
                                </TableHead>

                                <TableHead className="text-[10px] font-light">
                                    Description
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Model
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Serial
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Quantity
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    SRP
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Unit Cost
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Date of Purchase
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Date Out
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Size
                                </TableHead>
                                <TableHead className="text-[10px] font-light">
                                    Remarks
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!items || items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={15}
                                        className="py-10 text-center text-gray-500"
                                    >
                                        Import data to see items here.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="text-[10px]">
                                            {item.row_number}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.supplier_name}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.location_display}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.item_type}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.dr_no}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.description}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.model}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.serial}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.srp}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.unit_cost}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.date_of_purchase}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.date_out}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.size}
                                        </TableCell>
                                        <TableCell className="text-[10px]">
                                            {item.remarks}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
