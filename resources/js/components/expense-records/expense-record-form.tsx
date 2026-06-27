import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    expenseCategoryOptions,
    expensePaymentMethodOptions,
} from '@/lib/expense-records';
import { Branch } from '@/types';
import { Upload, X } from 'lucide-react';

export type ExpenseRecordFormData = {
    user_id: string;
    amount: string;
    category: string;
    payment_method: string;
    reference_number: string;
    remarks: string;
    receipt_path: File | null;
    expense_date: string;
    branch_id: string;
    _method?: string;
};

type DropdownUser = {
    id: number;
    full_name: string;
};

interface ExpenseRecordFormProps {
    users: DropdownUser[];
    branches: Branch[];
    data: ExpenseRecordFormData;
    errors: Partial<Record<keyof ExpenseRecordFormData, string>>;
    processing: boolean;
    imagePreview: string | null;
    isSuperAdmin: boolean;
    submitLabel: string;
    processingLabel: string;
    onSubmit: (event: React.FormEvent) => void;
    onCancel: () => void;
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    setData: (
        key: keyof ExpenseRecordFormData,
        value: string | File | null,
    ) => void;
}

export default function ExpenseRecordForm({
    users,
    branches,
    data,
    errors,
    processing,
    imagePreview,
    isSuperAdmin,
    submitLabel,
    processingLabel,
    onSubmit,
    onCancel,
    onImageChange,
    onRemoveImage,
    setData,
}: ExpenseRecordFormProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="user_id">
                                User
                            </RequiredLabel>
                            <Select
                                disabled={!isSuperAdmin}
                                value={data.user_id}
                                onValueChange={(value) =>
                                    setData('user_id', value)
                                }
                            >
                                <SelectTrigger id="user_id">
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={user.id.toString()}
                                        >
                                            {user.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.user_id} />
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel htmlFor="amount">
                                Amount
                            </RequiredLabel>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                                    ₱
                                </span>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.amount}
                                    onChange={(event) =>
                                        setData('amount', event.target.value)
                                    }
                                    className="pl-8"
                                />
                            </div>
                            <FieldError message={errors.amount} />
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel htmlFor="category">
                                Category
                            </RequiredLabel>
                            <Select
                                value={data.category}
                                onValueChange={(value) =>
                                    setData('category', value)
                                }
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {expenseCategoryOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.category} />
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel htmlFor="payment_method">
                                Payment Method
                            </RequiredLabel>
                            <Select
                                value={data.payment_method}
                                onValueChange={(value) =>
                                    setData('payment_method', value)
                                }
                            >
                                <SelectTrigger id="payment_method">
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {expensePaymentMethodOptions.map(
                                        (option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.payment_method} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference_number">
                                Reference Number
                            </Label>
                            <Input
                                id="reference_number"
                                type="text"
                                placeholder="Enter reference number"
                                value={data.reference_number}
                                onChange={(event) =>
                                    setData(
                                        'reference_number',
                                        event.target.value,
                                    )
                                }
                            />
                            <FieldError message={errors.reference_number} />
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel htmlFor="expense_date">
                                Expense Date
                            </RequiredLabel>
                            <Input
                                id="expense_date"
                                type="date"
                                value={data.expense_date}
                                onChange={(event) =>
                                    setData('expense_date', event.target.value)
                                }
                            />
                            <FieldError message={errors.expense_date} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <RequiredLabel htmlFor="branch">
                                Branch
                            </RequiredLabel>
                            <Select
                                value={data.branch_id}
                                onValueChange={(value) =>
                                    setData('branch_id', value)
                                }
                            >
                                <SelectTrigger id="branch">
                                    <SelectValue placeholder="Select a branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((branch) => (
                                        <SelectItem
                                            key={branch.id}
                                            value={branch.id.toString()}
                                        >
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.branch_id} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                placeholder="Enter any additional remarks..."
                                value={data.remarks}
                                onChange={(event) =>
                                    setData('remarks', event.target.value)
                                }
                                rows={4}
                            />
                            <FieldError message={errors.remarks} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="receipt_path">Receipt Image</Label>
                            {!imagePreview ? (
                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
                                    <input
                                        id="receipt_path"
                                        type="file"
                                        accept="image/*"
                                        onChange={onImageChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="receipt_path"
                                        className="flex cursor-pointer flex-col items-center"
                                    >
                                        <Upload className="mb-2 h-10 w-10 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">
                                            Click to upload receipt image
                                        </span>
                                        <span className="mt-1 text-xs text-gray-500">
                                            PNG, JPG, JPEG up to 10MB
                                        </span>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative rounded-lg border p-4">
                                    <button
                                        type="button"
                                        onClick={onRemoveImage}
                                        className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <img
                                        src={imagePreview}
                                        alt="Receipt preview"
                                        className="mx-auto max-h-64 rounded"
                                    />
                                </div>
                            )}
                            <FieldError message={errors.receipt_path} />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? processingLabel : submitLabel}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function RequiredLabel({
    htmlFor,
    children,
}: {
    htmlFor: string;
    children: React.ReactNode;
}) {
    return (
        <Label htmlFor={htmlFor}>
            {children} <span className="text-red-500">*</span>
        </Label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-sm text-red-500">{message}</p>;
}
