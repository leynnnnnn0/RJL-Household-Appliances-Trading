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

// Sample data - replace with your actual data from props
const sampleCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Furniture' },
  { id: 3, name: 'Accessories' },
  { id: 4, name: 'Office Supplies' },
];

const sampleItem = {
  id: 1,
  category_id: 1,
  dr_no: 'DR-2024-001',
  supplier: 'Tech Solutions Inc.',
  model_brand: 'Dell XPS 15',
  serial: 'SN123456789',
  qty: 5,
  srp: 75000,
  unit_cost: 70000,
  date_of_purchase: '2024-01-15',
  date_out: '2024-02-01',
  location: 'Warehouse A - Shelf 3',
  remarks: 'High-performance laptops for the development team.',
};

export default function Edit({ item = sampleItem, categories = sampleCategories }) {
  const { data, setData, put, processing, errors, isDirty } = useForm({
    category_id: item.category_id?.toString() || '',
    dr_no: item.dr_no || '',
    supplier: item.supplier || '',
    model_brand: item.model_brand || '',
    serial: item.serial || '',
    qty: item.qty || '',
    srp: item.srp || '',
    unit_cost: item.unit_cost || '',
    date_of_purchase: item.date_of_purchase || '',
    date_out: item.date_out || '',
    location: item.location || '',
    remarks: item.remarks || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('items.update', item.id));
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
      <Head title={`Edit Item - ${item.model_brand}`} />

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
              Update the details for {item.model_brand}
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
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category_id">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.category_id}
                    onValueChange={(value) => setData('category_id', value)}
                  >
                    <SelectTrigger id="category_id">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-destructive">{errors.category_id}</p>
                  )}
                </div>

                {/* DR No */}
                <div className="space-y-2">
                  <Label htmlFor="dr_no">
                    DR Number <span className="text-destructive">*</span>
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
                    Supplier <span className="text-destructive">*</span>
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
                  <Label htmlFor="model_brand">
                    Model/Brand <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="model_brand"
                    value={data.model_brand}
                    onChange={(e) => setData('model_brand', e.target.value)}
                    placeholder="Enter model or brand"
                  />
                  {errors.model_brand && (
                    <p className="text-sm text-destructive">{errors.model_brand}</p>
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
                  <Label htmlFor="qty">
                    Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="qty"
                    type="number"
                    min="0"
                    value={data.qty}
                    onChange={(e) => setData('qty', e.target.value)}
                    placeholder="Enter quantity"
                  />
                  {errors.qty && (
                    <p className="text-sm text-destructive">{errors.qty}</p>
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
                    onChange={(e) => setData('unit_cost', e.target.value)}
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

                {/* Location */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    placeholder="Enter storage location"
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location}</p>
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
                  <Button type="submit" disabled={processing || !isDirty}>
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