import ModuleHeading from '@/components/cards/module-heading';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {
    expenseCategoryColor,
    expenseStatusColor,
    expenseStatusOptions,
    formatExpenseLabel,
} from '@/lib/expense-records';
import { ExpenseRecord } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, Edit, Trash2 } from 'lucide-react';

interface PageProps {
    expense_record: ExpenseRecord;
}

export default function Show({ expense_record }: PageProps) {
    const { data, setData, put, processing } = useForm({
        status: expense_record.status,
    });

    const handleDelete = () => {
        router.delete(`/expense-record/${expense_record.id}`, {
            onSuccess: () => {
                router.visit('/expense-record');
            },
        });
    };

    const handleStatusUpdate = () => {
        put(`/expense-record/${expense_record.id}/update-status`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Expense Record Details" />
            <ModuleHeading
                title="Expense Record Details"
                description={`Viewing expense record #${expense_record.id}`}
            >
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    {window.can('can edit expense record') &&
                        expense_record.status != 'approved' && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.visit(
                                        `/expense-record/${expense_record.id}/edit`,
                                    )
                                }
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                        )}
                    {window.can('can delete expense record') &&
                        expense_record.status != 'approved' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete the expense
                                            record from the database.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                </div>
            </ModuleHeading>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Information */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Status Update Card */}
                    {expense_record.status != 'approved' &&
                        window.can('can review expense record') && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Update Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end gap-4">
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="status">
                                                Status
                                            </Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) =>
                                                    setData('status', value)
                                                }
                                                disabled={processing}
                                            >
                                                <SelectTrigger id="status">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {expenseStatusOptions.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={handleStatusUpdate}
                                            disabled={
                                                processing ||
                                                data.status ===
                                                    expense_record.status
                                            }
                                            className="mb-0.5"
                                        >
                                            {processing
                                                ? 'Updating...'
                                                : 'Update Status'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Employee
                                    </p>
                                    <p className="font-medium">
                                        {expense_record.user?.full_name ||
                                            'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Amount
                                    </p>
                                    <p className="text-lg font-semibold">
                                        ₱
                                        {Number(
                                            expense_record.amount,
                                        ).toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Category
                                    </p>
                                    <Badge
                                        className={expenseCategoryColor(
                                            expense_record.category,
                                        )}
                                    >
                                        {formatExpenseLabel(
                                            expense_record.category,
                                        )}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Status
                                    </p>
                                    <Badge
                                        className={expenseStatusColor(
                                            expense_record.status,
                                        )}
                                    >
                                        {formatExpenseLabel(
                                            expense_record.status,
                                        )}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Payment Method
                                    </p>
                                    <p className="font-medium capitalize">
                                        {formatExpenseLabel(
                                            expense_record.payment_method,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Reference Number
                                    </p>
                                    <p className="font-medium">
                                        {expense_record.reference_number || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Expense Date
                                    </p>
                                    <p className="font-medium">
                                        {expense_record.expense_date || '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Branch
                                    </p>
                                    <p className="font-medium">
                                        {expense_record.branch?.name || '—'}
                                    </p>
                                </div>
                                <div className="font-medium">
                                    <p className="text-sm text-gray-500">
                                        Remarks
                                    </p>
                                    <p className="font-medium">
                                        {expense_record.remarks ||
                                            'No remarks provided'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Approval Information */}
                    {(expense_record.approved_by ||
                        expense_record.approved_at) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Approval Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Approved By
                                        </p>
                                        <p className="font-medium">
                                            {expense_record.approved_by
                                                ?.full_name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Approved At
                                        </p>
                                        <p className="font-medium">
                                            {expense_record.approved_at
                                                ? new Date(
                                                      expense_record.approved_at,
                                                  ).toLocaleString('en-PH')
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Timestamps */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timestamps</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Created At
                                    </p>
                                    <p className="font-medium">
                                        {new Date(
                                            expense_record.created_at,
                                        ).toLocaleString('en-PH')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Last Updated
                                    </p>
                                    <p className="font-medium">
                                        {new Date(
                                            expense_record.updated_at,
                                        ).toLocaleString('en-PH')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Receipt Image */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Receipt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {expense_record.receipt_path ? (
                                <div className="space-y-4">
                                    <img
                                        src={`/storage/${expense_record.receipt_path}`}
                                        alt="Receipt"
                                        className="w-full rounded-lg border"
                                    />
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            window.open(
                                                `/storage/${expense_record.receipt_path}`,
                                                '_blank',
                                            )
                                        }
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Receipt
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    No receipt uploaded
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
