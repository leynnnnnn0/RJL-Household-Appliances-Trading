import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import ItemForm, { ItemFormData } from '@/components/items/item-form';
import AppLayout from '@/layouts/app-layout';
import { Location, Supplier } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface PageProps {
    suppliers: Supplier[];
    locations: Location[];
}

export default function Create({ suppliers, locations }: PageProps) {
    const { data, setData, post, processing, errors } = useForm<ItemFormData>({
        item_type: '',
        supplier: '',
        dr_no: '',
        description: '',
        model: '',
        serial: '',
        quantity: 1,
        srp: 0,
        unit_cost: 0,
        date_of_purchase: '',
        location_id: '',
        size: '',
        remarks: '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        post('/items', {
            onProgress: () => {
                toast.loading('Creating item...');
            },
            onSuccess: () => {
                toast.success('Item created successfully!');
            },
            onError: () => {
                toast.error(
                    'Failed to create item. Please check the form for errors.',
                );
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create Item" />
            <ModuleHeading
                title="Create New Item"
                description="Add a new item to your inventory"
            >
                <BackButton />
            </ModuleHeading>

            <ItemForm
                data={data}
                errors={errors}
                suppliers={suppliers}
                locations={locations}
                processing={processing}
                submitLabel="Create Item"
                processingLabel="Creating..."
                description="Fill in the details for the new item"
                onSubmit={handleSubmit}
                onCancel={() => window.history.back()}
                setData={setData}
            />
        </AppLayout>
    );
}
