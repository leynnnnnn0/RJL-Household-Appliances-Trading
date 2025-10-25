import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  Calendar,
  MapPin,
  DollarSign,
  Hash,
  FileText,
  Truck,
  Tag,
} from 'lucide-react';
import {ItemWithRelations} from '@/types';

interface PageProps {
  item: ItemWithRelations;
}
export default function View({ item } : PageProps) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item?')) {
      // Perform deletion logic here
    }
  };

  const isAvailable = !item.date_out;
  const totalValue = item.quantity * item.unit_cost;

  return (
    <AppLayout>
      <Head title={`View Item - ${item.description}`} />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold max-w-96">{item.description}</h1>
              <Badge variant={isAvailable ? 'default' : 'destructive'}>
                {isAvailable ? 'Available' : 'Out of Stock'}
              </Badge>
            </div>
            <p className="text-muted-foreground">Item Details</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/items">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/items/${item.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quantity Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quantity</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.quantity}</div>
              <p className="text-xs text-muted-foreground">units in stock</p>
            </CardContent>
          </Card>

          {/* SRP Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SRP</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(item.srp)}</div>
              <p className="text-xs text-muted-foreground">suggested retail price</p>
            </CardContent>
          </Card>

          {/* Total Value Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">unit cost × quantity</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core item details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">
                    {item.category?.name || 'N/A'}
                  </p>
                </div>
              </div>

              <Separator />

               <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Model</p>
                  <p className="text-sm text-muted-foreground">{item.model ?? 'Not Available'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">DR Number</p>
                  <p className="text-sm text-muted-foreground">{item.dr_no ?? 'Not Available'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Supplier</p>
                  <p className="text-sm text-muted-foreground">{item.supplier ?? 'Not Available'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Serial Number</p>
                  <p className="text-sm text-muted-foreground">
                    {item.serial || 'Not provided'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Financial & Location</CardTitle>
              <CardDescription>Pricing and storage details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Unit Cost</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.unit_cost)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Date of Purchase</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.date_of_purchase)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Date Out</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.date_out)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {item.location?.name|| 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Remarks */}
        {item.remarks && (
          <Card>
            <CardHeader>
              <CardTitle>Remarks</CardTitle>
              <CardDescription>Additional notes and information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {item.remarks}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Created At</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(item.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(item.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}