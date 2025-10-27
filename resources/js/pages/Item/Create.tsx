import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from "@/components/ui/sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

type Supplier = {
  slug: string;
  name: string;
};

type Location = {
  id: number;
  name: string;
};

interface PageProps {
  suppliers: Supplier[];
  locations: Location[];
}

export default function Create({ suppliers, locations } : PageProps) {
  const { data, setData, post, processing, errors } = useForm({
    item_type: '',
    supplier: '',
    dr_no: '',
    description: '',
    model: '',
    serial: '',
    quantity: 1,
    srp: '',
    unit_cost: '',
    date_of_purchase: '',
    location_id: '',
    size: '',
    remarks: '',
  });

  const itemTypes = [
    {
      id: 'appliances',
      name: 'Appliances',
    },
    {
      id: 'gadgets',
      name: 'Gadgets',
    },
    {
      id: 'furniture',
      name: 'Furniture',
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/items', {
      onProgress: () => {
        toast.loading('Creating item...');
      },
      onSuccess: () => {
        toast.success('Item created successfully!');
      },
      onError: () => {
        toast.error('Failed to create item. Please check the form for errors.');
      },
    });

  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <AppLayout>
      <Head title="Create Item" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Item</h1>
            <p className="text-muted-foreground mt-1">
              Add a new item to your inventory
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

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
              <CardDescription>
                Fill in the details for the new item
              </CardDescription>
            </CardHeader>
            <form>
                <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Item type */}
                <div className="space-y-2">
                  <Label htmlFor="item_type">
                    Item type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.item_type}
                    onValueChange={(value) => setData('item_type', value)}
                  >
                    <SelectTrigger id="item_type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map((item_type) => (
                        <SelectItem key={item_type.id} value={item_type.id.toString()}>
                          {item_type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplier && (
                    <p className="text-sm text-destructive">{errors.item_type}</p>
                  )}
                </div>

                {/* Supplier */}
                <div className="space-y-2">
                  <Label htmlFor="supplier">
                    Supplier <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.supplier}
                    onValueChange={(value) => setData('supplier', value)}
                  >
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.slug} value={supplier.slug.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplier && (
                    <p className="text-sm text-destructive">{errors.supplier}</p>
                  )}
                </div>

                {/* DR No */}
                <div className="space-y-2">
                  <Label htmlFor="dr_no">
                    DR Number
                  </Label>
                  <Input
                  autoFocus
                    id="dr_no"
                    value={data.dr_no}
                    onChange={(e) => setData('dr_no', e.target.value)}
                    placeholder="Enter DR number"
                  />
                  {errors.dr_no && (
                    <p className="text-sm text-destructive">{errors.dr_no}</p>
                  )}
                </div>

                {/* Model/Brand */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Enter model or brand"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                  {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model">
                    Model
                  </Label>
                  <Input
                    id="model"
                    value={data.model}
                    onChange={(e) => setData('model', e.target.value)}
                    placeholder="Enter model"
                  />
                  {errors.model && (
                    <p className="text-sm text-destructive">{errors.model}</p>
                  )}
                </div>

                {/* Serial */}
                <div className="space-y-2">
                  <Label htmlFor="serial">Serial Number</Label>
                  <Input
                    id="serial"
                    value={data.serial}
                    onChange={(e) => setData('serial', e.target.value)}
                    placeholder="Enter serial number"
                  />
                  {errors.serial && (
                    <p className="text-sm text-destructive">{errors.serial}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="qty"
                    type="number"
                    min="0"
                    value={data.quantity}
                    onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                    placeholder="Enter quantity"
                  />
                  {errors.quantity && (
                    <p className="text-sm text-destructive">{errors.quantity}</p>
                  )}
                </div>

                {/* SRP */}
                <div className="space-y-2">
                  <Label htmlFor="srp">
                    SRP <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="srp"
                   type='number'
                    step="0.01"
                    min="0"
                    value={data.srp}
                    onChange={(e) => setData('srp', parseFloat(e.target.value))}

                    placeholder="0.00"
                  />
                  {errors.srp && (
                    <p className="text-sm text-destructive">{errors.srp}</p>
                  )}
                </div>

                {/* Unit Cost */}
                <div className="space-y-2">
                  <Label htmlFor="unit_cost">
                    Unit Cost <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.unit_cost}
                    onChange={(e) => setData('unit_cost', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                  {errors.unit_cost && (
                    <p className="text-sm text-destructive">{errors.unit_cost}</p>
                  )}
                </div>

                {/* Date of Purchase */}
                <div className="space-y-2">
                  <Label htmlFor="date_of_purchase">
                    Date of Purchase <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date_of_purchase"
                    type="date"
                    value={data.date_of_purchase}
                    onChange={(e) => setData('date_of_purchase', e.target.value)}
                  />
                  {errors.date_of_purchase && (
                    <p className="text-sm text-destructive">{errors.date_of_purchase}</p>
                  )}
                </div>

                {/* DR No */}
                <div className="space-y-2">
                  <Label htmlFor="size">
                    Size
                  </Label>
                  <Input
                  autoFocus
                    id="size"
                    value={data.size}
                    onChange={(e) => setData('size', e.target.value)}
                    placeholder="Enter Size"
                  />
                  {errors.size && (
                    <p className="text-sm text-destructive">{errors.size}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                    <Select
                    value={data.location_id}
                    onValueChange={(value) => setData('location_id', value)}
                  >
                    <SelectTrigger id="location_id">
                      <SelectValue placeholder="Select a loaction" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location_id && (
                    <p className="text-sm text-destructive">{errors.location_id}</p>
                  )}
                </div>

                {/* Remarks */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={data.remarks}
                    onChange={(e) => setData('remarks', e.target.value)}
                    placeholder="Enter any additional notes or remarks"
                    rows={4}
                  />
                  {errors.remarks && (
                    <p className="text-sm text-destructive">{errors.remarks}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className='cursor-pointer' type="submit" disabled={processing}>
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? 'Creating...' : 'Create Item'}
                </Button>
              </div>
            </CardContent>
            </form>
          </Card>

      </div>
    </AppLayout>
  );
}