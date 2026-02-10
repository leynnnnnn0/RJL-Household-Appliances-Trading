import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useState } from "react";
import { ExpenseRecord } from "@/types";

interface User {
  id: number;
  full_name: string;
}

interface PageProps {
    users: User[];
    expense_record: ExpenseRecord;
    branches: Location[];
}

export default function Edit({ users, expense_record, branches }: PageProps) {
    const { auth } = usePage().props as any;
    const [imagePreview, setImagePreview] = useState<string | null>(
        expense_record.receipt_path
            ? `/storage/${expense_record.receipt_path}`
            : null,
    );

    const { data, setData, post, processing, errors } = useForm({
        user_id: expense_record.user_id?.toString() || '',
        amount: expense_record.amount.toString(),
        category: expense_record.category,
        payment_method: expense_record.payment_method,
        reference_number: expense_record.reference_number || '',
        remarks: expense_record.remarks || '',
        receipt_path: null as File | null,
        expense_date: expense_record.expense_date || '',
        _method: 'PUT',
        branch_id: expense_record.branch_id?.toString() || '',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('receipt_path', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('receipt_path', null);
        setImagePreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('expense-record.update', expense_record.id), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Edit Expense Record" />
            <ModuleHeading
                title="Edit Expense Record"
                description="Update expense record information"
            >
                <Button variant="outline" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </ModuleHeading>

            <div className="mt-6">
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Employee */}
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">
                                        User{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        disabled={
                                            !auth.roles?.includes('super admin')
                                        }
                                        value={data.user_id}
                                        onValueChange={(value) =>
                                            setData('user_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select employee" />
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
                                    {errors.user_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.user_id}
                                        </p>
                                    )}
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="amount">
                                        Amount{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
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
                                            onChange={(e) =>
                                                setData(
                                                    'amount',
                                                    e.target.value,
                                                )
                                            }
                                            className="pl-8"
                                        />
                                    </div>
                                    {errors.amount && (
                                        <p className="text-sm text-red-500">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">
                                        Category{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) =>
                                            setData('category', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fuel">
                                                Fuel
                                            </SelectItem>
                                            <SelectItem value="repair">
                                                Repair
                                            </SelectItem>
                                            <SelectItem value="supplies">
                                                Supplies
                                            </SelectItem>
                                            <SelectItem value="meal">
                                                Meal
                                            </SelectItem>
                                            <SelectItem value="emergency">
                                                Emergency
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-red-500">
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-2">
                                    <Label htmlFor="payment_method">
                                        Payment Method{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.payment_method}
                                        onValueChange={(value) =>
                                            setData('payment_method', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">
                                                Cash
                                            </SelectItem>
                                            <SelectItem value="credit_card">
                                                Credit Card
                                            </SelectItem>
                                            <SelectItem value="debit_card">
                                                Debit Card
                                            </SelectItem>
                                            <SelectItem value="bank_transfer">
                                                Bank Transfer
                                            </SelectItem>
                                            <SelectItem value="e_wallet">
                                                E-Wallet
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_method && (
                                        <p className="text-sm text-red-500">
                                            {errors.payment_method}
                                        </p>
                                    )}
                                </div>

                                {/* Reference Number */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="reference_number">
                                        Reference Number
                                    </Label>
                                    <Input
                                        id="reference_number"
                                        type="text"
                                        placeholder="Enter reference number"
                                        value={data.reference_number}
                                        onChange={(e) =>
                                            setData(
                                                'reference_number',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.reference_number && (
                                        <p className="text-sm text-red-500">
                                            {errors.reference_number}
                                        </p>
                                    )}
                                </div>

                                {/* Expense Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="expense_date">
                                        Expense Date
                                    </Label>
                                    <Input
                                        id="expense_date"
                                        type="date"
                                        value={data.expense_date}
                                        onChange={(e) =>
                                            setData(
                                                'expense_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.expense_date && (
                                        <p className="text-sm text-red-500">
                                            {errors.expense_date}
                                        </p>
                                    )}
                                </div>

                                {/* Branch */}
                                <div className="space-y-2">
                                    <Label htmlFor="expense_date">Branch</Label>
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
                                    {errors.branch_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.branch_id}
                                        </p>
                                    )}
                                </div>

                                {/* Remarks */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Textarea
                                        id="remarks"
                                        placeholder="Enter any additional remarks..."
                                        value={data.remarks}
                                        onChange={(e) =>
                                            setData('remarks', e.target.value)
                                        }
                                        rows={4}
                                    />
                                    {errors.remarks && (
                                        <p className="text-sm text-red-500">
                                            {errors.remarks}
                                        </p>
                                    )}
                                </div>

                                {/* Receipt Upload */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="receipt_path">
                                        Receipt Image
                                    </Label>
                                    {!imagePreview ? (
                                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
                                            <input
                                                id="receipt_path"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="receipt_path"
                                                className="flex cursor-pointer flex-col items-center"
                                            >
                                                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    Click to upload receipt
                                                    image
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
                                                onClick={removeImage}
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
                                    {errors.receipt_path && (
                                        <p className="text-sm text-red-500">
                                            {errors.receipt_path}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4 border-t pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Updating...'
                                        : 'Update Expense Record'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}