import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {ItemWithRelations, Category, Location} from '@/types';


interface PageProps {
  item: ItemWithRelations;
  categories: Category[];
  locations: Location[];
}

export default function Edit({ item, categories, locations }: PageProps) {
  const { data, setData, put, processing, errors, isDirty } = useForm({
    category: item.category?.slug || '',
    item_type: item.item_type || '',
    dr_no: item.dr_no || '',
    supplier: item.supplier || '',
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


  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('items.update', item.id),{
      onProgress: () => {
        toast.loading('Updating item...');
      },
      onSuccess: () => {
        toast.success('Item updated successfully!');
      },
      onError: () => {
        toast.error('Failed to update item. Please check the form for errors.');
      },
    });
  };

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  return (
    <AppLayout>
      <Head title={`Edit Item - ${item.description}`} />
      

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Edit Item</h1>
              {isDirty && (
                <Badge variant="secondary">Unsaved Changes</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Update the details for {item.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/items/${item.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              Please fix the errors below before submitting.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
              <CardDescription>
                Update the item details below
              </CardDescription>
            </CardHeader>
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
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.item_type}</p>
                  )}
                </div>


                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category_id">
                    Category
                  </Label>
                  <Select
                    value={data.category}
                    onValueChange={(value) => setData('category', value)}
                  >
                    <SelectTrigger id="category_id">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category}</p>
                  )}
                </div>

                {/* DR No */}
                <div className="space-y-2">
                  <Label htmlFor="dr_no">
                    DR Number
                  </Label>
                  <Input
                    id="dr_no"
                    value={data.dr_no}
                    onChange={(e) => setData('dr_no', e.target.value)}
                    placeholder="Enter DR number"
                  />
                  {errors.dr_no && (
                    <p className="text-sm text-destructive">{errors.dr_no}</p>
                  )}
                </div>

                {/* Supplier */}
                <div className="space-y-2">
                  <Label htmlFor="supplier">
                    Supplier
                  </Label>
                  <Input
                    id="supplier"
                    value={data.supplier}
                    onChange={(e) => setData('supplier', e.target.value)}
                    placeholder="Enter supplier name"
                  />
                  {errors.supplier && (
                    <p className="text-sm text-destructive">{errors.supplier}</p>
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
                    id="quantity"
                    type="number"
                    min="0"
                    value={data.quantity}
                    onChange={(e) => setData('quantity', parseInt(e.target.value))}
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
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.srp}
                    onChange={(e) => setData('srp', e.target.value)}
                    placeholder="0.00"
                  />
                  {errors.srp && (
                    <p className="text-sm text-destructive">{parseFloat(errors.srp)}</p>
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

                {/* Date Out */}
                <div className="space-y-2">
                  <Label htmlFor="date_out">Date Out</Label>
                  <Input
                    id="date_out"
                    type="date"
                    value={data.date_out}
                    onChange={(e) => setData('date_out', e.target.value)}
                  />
                  {errors.date_out && (
                    <p className="text-sm text-destructive">{errors.date_out}</p>
                  )}
                </div>

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
                    value={data.location_id.toString()}
                    onValueChange={(value) => setData('location_id', value.toString())}
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

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {isDirty ? (
                    <span className="text-amber-600 font-medium">
                      You have unsaved changes
                    </span>
                  ) : (
                    <span>No changes made</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button className='cursor-pointer' type="submit" disabled={processing || !isDirty}>
                    <Save className="h-4 w-4 mr-2" />
                    {processing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}