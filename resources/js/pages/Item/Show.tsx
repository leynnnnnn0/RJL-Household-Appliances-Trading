import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';

import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatItemCurrency, formatLongItemDate } from '@/lib/items';
import { ItemWithRelations } from '@/types';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    FileText,
    Hash,
    MapPin,
    Package,
    Pencil,
    Search,
    Tag,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
    item: ItemWithRelations;
    purchaseHistory: {
        order_number: string;
        customer: string;
        transaction_date: string;
        transaction_by: string;
        created_at: string;
    }[];
    transferHistory: {
        from_location: string;
        to_location: string;
        remarks: string;
        transferred_at: string;
    }[];
}
export default function View({
    item,
    purchaseHistory,
    transferHistory,
}: PageProps) {
    const { previousUrl } = usePage().props as any;

    const handleDelete = () => {
        router.delete(`/items/${item.id}`, {
            onSuccess: () => {
                toast.success('Item Archived Successfully');
            },
            onError: () => {
                toast.error('Failed to Archive Item');
            },
        });
    };

    const isAvailable = !item.date_out;
    const canArchiveItem = isAvailable && purchaseHistory.length === 0;
    const totalValue = item.quantity * item.unit_cost;

    return (
        <AppLayout>
            <Head title={`View Item - ${item.description}`} />

            <div className="space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <h1 className="text-2xl font-bold break-words sm:text-3xl">
                                {item.description}
                            </h1>
                            <Badge
                                variant={
                                    isAvailable ? 'default' : 'destructive'
                                }
                            >
                                {isAvailable ? 'Available' : 'Out of Stock'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">Item Details</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button variant="outline" asChild>
                            <Link href={previousUrl}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Link>
                        </Button>

                        {isAvailable && window.can('can edit item') && (
                            <Button variant="outline" asChild>
                                <Link href={`/items/${item.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}

                        {canArchiveItem && window.can('can archive item') && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Archive
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will remove the item from thee
                                            inventory list.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                        >
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>

                {/* Main Info Cards */}
                {window.can('can manage roles') && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Quantity Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Quantity
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {item.quantity}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    units in stock
                                </p>
                            </CardContent>
                        </Card>

                        {/* SRP Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    SRP
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatItemCurrency(item.srp)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    suggested retail price
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Value Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Value
                                </CardTitle>
                                <Tag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatItemCurrency(totalValue)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    unit cost × quantity
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Detailed Information */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Basic Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Core item details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Tag className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        Supplier
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.supplier?.name || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        Item Type
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.item_type}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">Model</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.model ?? 'Not Available'}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        DR Number
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.dr_no ?? 'Not Available'}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <Hash className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        Serial Number
                                    </p>
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
                            <CardDescription>
                                Pricing and storage details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">SRP</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatItemCurrency(item.srp)}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        Date of Purchase
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatLongItemDate(
                                            item.date_of_purchase,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        Date Out
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatLongItemDate(item.date_out)}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        Location
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.location?.name || 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transfer History */}
                <Card className="overflow-hidden">
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle>Transfer History</CardTitle>
                        <CardDescription>
                            Item location transfer records
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        {transferHistory.length === 0 ? (
                            <HistoryEmptyState />
                        ) : (
                            <>
                                <div className="space-y-3 md:hidden">
                                    {transferHistory.map((transfer, index) => (
                                        <TransferHistoryCard
                                            key={index}
                                            transfer={transfer}
                                        />
                                    ))}
                                </div>

                                <div className="hidden md:block">
                                    <Table className="min-w-[680px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    From Location
                                                </TableHead>
                                                <TableHead>
                                                    To Location
                                                </TableHead>
                                                <TableHead>Remarks</TableHead>
                                                <TableHead>
                                                    Transferred At
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transferHistory.map(
                                                (transfer, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {
                                                                transfer.from_location
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                transfer.to_location
                                                            }
                                                        </TableCell>
                                                        <TableCell className="whitespace-normal">
                                                            {transfer.remarks ||
                                                                'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                transfer.transferred_at
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle>Purchase History</CardTitle>
                        <CardDescription>
                            Additional information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        {purchaseHistory.length === 0 ? (
                            <HistoryEmptyState />
                        ) : (
                            <>
                                <div className="space-y-3 md:hidden">
                                    {purchaseHistory.map((item) => (
                                        <PurchaseHistoryCard
                                            key={item.order_number}
                                            item={item}
                                        />
                                    ))}
                                </div>

                                <div className="hidden md:block">
                                    <Table className="min-w-[760px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    Order Number
                                                </TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>
                                                    Transaction By
                                                </TableHead>
                                                <TableHead>
                                                    Transaction Date
                                                </TableHead>
                                                <TableHead>
                                                    Created at
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {purchaseHistory.map((item) => (
                                                <TableRow
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                    {
                                                        if(item.order_number.startsWith('ORD'))
                                                        {
                                                            router.visit(`/pos-cash-orders/${item.order_number}`);
                                                        } else {
                                                            router.visit(`/pos-installment-orders/${item.order_number}`);
                                                        }
                                                    }
                                                    }
                                                    key={item.order_number}
                                                >
                                                    <TableCell>
                                                        {item.order_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.customer}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.transaction_by}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.transaction_date}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.created_at}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Remarks */}
                {item.remarks && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Remarks</CardTitle>
                            <CardDescription>
                                Additional notes and information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
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
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="mb-1 text-sm font-medium">
                                Created At
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {formatLongItemDate(item.created_at)}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-medium">
                                Last Updated
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {formatLongItemDate(item.updated_at)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function HistoryEmptyState() {
    return (
        <div className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-center text-muted-foreground">
            <Search className="mb-1 h-8 w-8" />
            <p className="font-medium">No data found</p>
            <p className="max-w-xs text-sm">
                There is no data to show for this.
            </p>
        </div>
    );
}

function TransferHistoryCard({
    transfer,
}: {
    transfer: PageProps['transferHistory'][number];
}) {
    return (
        <dl className="space-y-3 rounded-md border p-3">
            <HistoryField
                label="From Location"
                value={transfer.from_location}
            />
            <HistoryField label="To Location" value={transfer.to_location} />
            <HistoryField label="Remarks" value={transfer.remarks || 'N/A'} />
            <HistoryField
                label="Transferred At"
                value={transfer.transferred_at}
            />
        </dl>
    );
}

function PurchaseHistoryCard({
    item,
}: {
    item: PageProps['purchaseHistory'][number];
}) {
    return (
        <dl className="space-y-3 rounded-md border p-3">
            <HistoryField label="Order Number" value={item.order_number} />
            <HistoryField label="Customer" value={item.customer} />
            <HistoryField label="Transaction By" value={item.transaction_by} />
            <HistoryField
                label="Transaction Date"
                value={item.transaction_date}
            />
            <HistoryField label="Created At" value={item.created_at} />
        </dl>
    );
}

function HistoryField({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[7rem_1fr] gap-3 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 font-medium break-words">{value}</dd>
        </div>
    );
}
