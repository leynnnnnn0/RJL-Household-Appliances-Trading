import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { itemTypeOptions } from '@/lib/items';
import { Location, Supplier } from '@/types';
import { Save } from 'lucide-react';

export type ItemFormData = {
    item_type: string;
    supplier: string;
    dr_no: string;
    description: string;
    model: string;
    serial: string;
    quantity: number | string;
    srp: number | string;
    unit_cost: number | string;
    date_of_purchase: string;
    date_out?: string;
    location_id: number | string;
    size: string;
    remarks: string;
};

interface ItemFormProps {
    data: ItemFormData;
    errors: Partial<Record<keyof ItemFormData, string>>;
    suppliers: Supplier[];
    locations: Location[];
    processing: boolean;
    submitLabel: string;
    processingLabel: string;
    description: string;
    isDirty?: boolean;
    showDateOut?: boolean;
    showLocation?: boolean;
    onSubmit: (event: React.FormEvent) => void;
    onCancel: () => void;
    setData: (key: keyof ItemFormData, value: string | number) => void;
}

export default function ItemForm({
    data,
    errors,
    suppliers,
    locations,
    processing,
    submitLabel,
    processingLabel,
    description,
    isDirty,
    showDateOut = false,
    showLocation = true,
    onSubmit,
    onCancel,
    setData,
}: ItemFormProps) {
    return (
        <form onSubmit={onSubmit}>
            <div className="space-y-6">
                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            Please fix the errors below before submitting.
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Item Information</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <SelectField
                                label="Item type"
                                name="item_type"
                                value={data.item_type}
                                error={errors.item_type}
                                placeholder="Select a type"
                                required
                                onValueChange={(value) =>
                                    setData('item_type', value)
                                }
                                options={itemTypeOptions}
                            />

                            <SelectField
                                label="Supplier"
                                name="supplier"
                                value={data.supplier}
                                error={errors.supplier}
                                placeholder="Select a supplier"
                                required
                                onValueChange={(value) =>
                                    setData('supplier', value)
                                }
                                options={suppliers.map((supplier) => ({
                                    value: supplier.slug,
                                    label: supplier.name,
                                }))}
                            />

                            <TextField
                                label="DR Number"
                                name="dr_no"
                                value={data.dr_no}
                                error={errors.dr_no}
                                placeholder="Enter DR number"
                                onChange={(value) => setData('dr_no', value)}
                            />

                            <TextField
                                label="Description"
                                name="description"
                                value={data.description}
                                error={errors.description}
                                placeholder="Enter description"
                                required
                                onChange={(value) =>
                                    setData('description', value)
                                }
                            />

                            <TextField
                                label="Model"
                                name="model"
                                value={data.model}
                                error={errors.model}
                                placeholder="Enter model"
                                required
                                onChange={(value) => setData('model', value)}
                            />

                            <TextField
                                label="Serial Number"
                                name="serial"
                                value={data.serial}
                                error={errors.serial}
                                placeholder="Enter serial number"
                                required
                                onChange={(value) => setData('serial', value)}
                            />

                            <TextField
                                label="Quantity"
                                name="quantity"
                                type="number"
                                min="0"
                                value={data.quantity}
                                error={errors.quantity}
                                placeholder="Enter quantity"
                                required
                                onChange={(value) =>
                                    setData('quantity', numberInput(value))
                                }
                            />

                            <TextField
                                label="SRP"
                                name="srp"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.srp}
                                error={errors.srp}
                                placeholder="0.00"
                                required
                                onChange={(value) =>
                                    setData('srp', numberInput(value))
                                }
                            />

                            <TextField
                                label="Unit Cost"
                                name="unit_cost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.unit_cost}
                                error={errors.unit_cost}
                                placeholder="0.00"
                                required
                                onChange={(value) =>
                                    setData('unit_cost', numberInput(value))
                                }
                            />

                            <TextField
                                label="Date of Purchase"
                                name="date_of_purchase"
                                type="date"
                                value={data.date_of_purchase}
                                error={errors.date_of_purchase}
                                required
                                onChange={(value) =>
                                    setData('date_of_purchase', value)
                                }
                            />

                            {showDateOut && (
                                <TextField
                                    label="Date Out"
                                    name="date_out"
                                    type="date"
                                    value={data.date_out || ''}
                                    error={errors.date_out}
                                    onChange={(value) =>
                                        setData('date_out', value)
                                    }
                                />
                            )}

                            <TextField
                                label="Size"
                                name="size"
                                value={data.size}
                                error={errors.size}
                                placeholder="Enter size"
                                onChange={(value) => setData('size', value)}
                            />

                            {showLocation && (
                                <SelectField
                                    label="Location"
                                    name="location_id"
                                    value={data.location_id?.toString() || ''}
                                    error={errors.location_id}
                                    placeholder="Select a location"
                                    required
                                    onValueChange={(value) =>
                                        setData('location_id', value)
                                    }
                                    options={locations.map((location) => ({
                                        value: location.id.toString(),
                                        label: location.name,
                                    }))}
                                />
                            )}

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(event) =>
                                        setData('remarks', event.target.value)
                                    }
                                    placeholder="Enter any additional notes or remarks"
                                    rows={4}
                                />
                                <FieldError message={errors.remarks} />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                {typeof isDirty === 'boolean' &&
                                    (isDirty ? (
                                        <span className="font-medium text-amber-600">
                                            You have unsaved changes
                                        </span>
                                    ) : (
                                        <span>No changes made</span>
                                    ))}
                            </div>
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        (typeof isDirty === 'boolean' &&
                                            !isDirty)
                                    }
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? processingLabel : submitLabel}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}

function TextField({
    label,
    name,
    value,
    error,
    placeholder,
    required = false,
    type = 'text',
    min,
    step,
    onChange,
}: {
    label: string;
    name: keyof ItemFormData;
    value: string | number;
    error?: string;
    placeholder?: string;
    required?: boolean;
    type?: string;
    min?: string;
    step?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <FieldLabel htmlFor={name} required={required}>
                {label}
            </FieldLabel>
            <Input
                id={name}
                type={type}
                min={min}
                step={step}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
            />
            <FieldError message={error} />
        </div>
    );
}

function SelectField({
    label,
    name,
    value,
    error,
    placeholder,
    required = false,
    options,
    onValueChange,
}: {
    label: string;
    name: keyof ItemFormData;
    value: string;
    error?: string;
    placeholder: string;
    required?: boolean;
    options: Array<{ value: string; label: string }>;
    onValueChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <FieldLabel htmlFor={name} required={required}>
                {label}
            </FieldLabel>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger id={name}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FieldError message={error} />
        </div>
    );
}

function FieldLabel({
    htmlFor,
    required,
    children,
}: {
    htmlFor: string;
    required: boolean;
    children: React.ReactNode;
}) {
    return (
        <Label htmlFor={htmlFor}>
            {children} {required && <span className="text-destructive">*</span>}
        </Label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-sm text-destructive">{message}</p>;
}

function numberInput(value: string) {
    return value === '' ? '' : Number(value);
}
