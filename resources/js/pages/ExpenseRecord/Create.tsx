import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import ExpenseRecordForm, {
    ExpenseRecordFormData,
} from '@/components/expense-records/expense-record-form';
import AppLayout from '@/layouts/app-layout';
import { Branch } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

type DropdownUser = {
    id: number;
    full_name: string;
};

interface PageProps {
    users: DropdownUser[];
    branches: Branch[];
}

export default function Create({ users, branches }: PageProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { auth } = usePage().props as any;

    const { data, setData, post, processing, errors, reset } =
        useForm<ExpenseRecordFormData>({
            user_id: auth.user?.id.toString(),
            amount: '',
            category: '',
            payment_method: '',
            reference_number: '',
            remarks: '',
            receipt_path: null,
            expense_date: '',
            branch_id: branches[0]?.id.toString(),
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

        post('/expense-record', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
                toast.success('Record Created.');
            },
            onError: () => {
                toast.error('An error occured while trying to create a record');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create Expense Record" />
            <ModuleHeading
                title="Create Expense Record"
                description="Add a new expense record"
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
                    submitLabel="Create Expense Record"
                    processingLabel="Saving..."
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
