import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import ItemForm, { ItemFormData } from '@/components/items/item-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { ItemWithRelations, Location, Supplier } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
    item: ItemWithRelations;
    suppliers: Supplier[];
    locations: Location[];
}

export default function Edit({ item, suppliers, locations }: PageProps) {
    const { previousUrl } = usePage().props as any;
    const { data, setData, put, processing, errors, isDirty } =
        useForm<ItemFormData>({
            supplier: item.supplier?.slug || '',
            item_type: item.item_type || '',
            dr_no: item.dr_no || '',
            description: item.description || '',
            model: item.model || '',
            serial: item.serial || '',
            quantity: item.quantity || '',
            srp: item.srp || '',
            unit_cost: item.unit_cost || '',
            size: item.size || '',
            date_of_purchase: item.date_of_purchase || '',
            date_out: item.date_out || '',
            location_id: item.location_id || '',
            remarks: item.remarks || '',
        });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        put(`/items/${item.id}`, {
            onProgress: () => {
                toast.loading('Updating item...');
            },
            onSuccess: () => {
                toast.success('Item updated successfully!');
            },
            onError: () => {
                toast.error(
                    'Failed to update item. Please check the form for errors.',
                );
            },
        });
    };

    const handleCancel = () => {
        if (
            isDirty &&
            !confirm(
                'You have unsaved changes. Are you sure you want to leave?',
            )
        ) {
            return;
        }

        window.history.back();
    };

    return (
        <AppLayout>
            <Head title={`Edit Item - ${item.description}`} />
            <ModuleHeading
                title="Edit Item"
                description={`Update the details for ${item.description}`}
            >
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button variant="outline" asChild>
                        <Link href={previousUrl}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </Link>
                    </Button>
                    <BackButton />
                </div>
            </ModuleHeading>

            <div className="mb-4">
                {isDirty && <Badge variant="secondary">Unsaved Changes</Badge>}
            </div>

            <ItemForm
                data={data}
                errors={errors}
                suppliers={suppliers}
                locations={locations}
                processing={processing}
                submitLabel="Save Changes"
                processingLabel="Saving..."
                description="Update the item details below"
                isDirty={isDirty}
                showDateOut
                showLocation={false}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                setData={setData}
            />
        </AppLayout>
    );
}
