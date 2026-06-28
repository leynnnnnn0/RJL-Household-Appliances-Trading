import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import ExpenseRecordForm, {
    ExpenseRecordFormData,
} from '@/components/expense-records/expense-record-form';
import AppLayout from '@/layouts/app-layout';
import { Branch, ExpenseRecord } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

type DropdownUser = {
    id: number;
    full_name: string;
};

interface PageProps {
    users: DropdownUser[];
    expense_record: ExpenseRecord;
    branches: Branch[];
}

export default function Edit({ users, expense_record, branches }: PageProps) {
    const { auth } = usePage().props as any;
    const [imagePreview, setImagePreview] = useState<string | null>(
        expense_record.receipt_path
            ? `/storage/${expense_record.receipt_path}`
            : null,
    );

    const { data, setData, post, processing, errors } =
        useForm<ExpenseRecordFormData>({
            user_id: expense_record.user_id?.toString() || '',
            amount: expense_record.amount.toString(),
            category: expense_record.category,
            payment_method: expense_record.payment_method,
            reference_number: expense_record.reference_number || '',
            remarks: expense_record.remarks || '',
            receipt_path: null,
            expense_date: expense_record.expense_date || '',
            _method: 'PUT',
            branch_id: expense_record.branch_id?.toString() || '',
        });

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setData('receipt_path', file);

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setData('receipt_path', null);
        setImagePreview(null);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        post(`/expense-record/${expense_record.id}`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Record Updated.');
            },
            onError: () => {
                toast.error('Failed to update record. Please try again.');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Edit Expense Record" />
            <ModuleHeading
                title="Edit Expense Record"
                description="Update expense record information"
            >
                <BackButton />
            </ModuleHeading>

            <div className="mt-6">
                <ExpenseRecordForm
                    users={users}
                    branches={branches}
                    data={data}
                    errors={errors}
                    processing={processing}
                    imagePreview={imagePreview}
                    isSuperAdmin={auth.roles?.includes('super admin')}
                    submitLabel="Update Expense Record"
                    processingLabel="Updating..."
                    onSubmit={handleSubmit}
                    onCancel={() => window.history.back()}
                    onImageChange={handleImageChange}
                    onRemoveImage={removeImage}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
