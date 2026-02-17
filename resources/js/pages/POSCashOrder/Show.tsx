import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Package, Calendar, CreditCard, MapPin, User, Phone, Home, AlertCircle, Receipt } from "lucide-react";
import { OrderWithrelations } from "@/types";
import ModuleHeading from "@/components/cards/module-heading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ShowProps {
  transaction: OrderWithrelations;
}

export default function Show({ transaction }: ShowProps) {
  const { previousUrl } = usePage().props as any;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { data, setData, put, processing, errors } = useForm({
    reason_for_cancellation: "",
  });

  const voidOrder = () => {
    put(`/pos-cash-orders/void/${transaction.id}`, {
      onSuccess: () => {
        toast.success("Order Void");
        setIsDialogOpen(false);
        setData("reason_for_cancellation", "");
      },
      onError: () => {
        toast.error("An error occurred");
      },
    });
  };

  const totalDiscount = transaction.order_items?.reduce(
    (sum, item) => sum + (item.discount_amount || 0),
    0
  ) || 0;

  return (
    <AppLayout>
      <Head title={`Order ${transaction.order_number}`} />

      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Order #{transaction.order_number}
              </h1>
              {transaction.is_void && (
                <Badge variant="destructive" className="h-5">
                  VOIDED
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(transaction.transaction_date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={previousUrl}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Link>
            </Button>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setData("reason_for_cancellation", "");
              }}
            >
              <DialogTrigger asChild>
                {(window.can('can void cash order') || transaction.is_void) &&  <Button size="sm" disabled={transaction.is_void} variant="destructive">
                  {transaction.is_void ? "Order Voided" : "Void Order"}
                </Button> }
               
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-500">
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently void the
                    order.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                  <Label>
                    Reason for cancellation{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={data.reason_for_cancellation}
                    onChange={(e) =>
                      setData("reason_for_cancellation", e.target.value)
                    }
                    placeholder="Enter reason for voiding this order..."
                    rows={4}
                  />
                  {errors.reason_for_cancellation && (
                    <p className="text-sm text-destructive">
                      {errors.reason_for_cancellation}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => voidOrder()}
                    variant="destructive"
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Void Order"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Void Alert */}
        {transaction.is_void == true && (
          <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <span className="font-semibold">This order has been voided</span> on {transaction.void_date ? formatDate(transaction.void_date) : "N/A"}
              {transaction.reason_for_cancellation && ` - ${transaction.reason_for_cancellation}`}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Transaction & Customer Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Combined Transaction and Customer Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {/* Transaction Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Payment Method</p>
                        <p className="font-medium text-sm truncate">
                          {transaction.payment_method || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Reference Number</p>
                        <p className="font-mono text-sm font-medium truncate">
                          {transaction.reference_number || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Branch</p>
                        <p className="font-medium text-sm truncate">
                          {transaction.branch?.name || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Employee</p>
                        <p className="font-medium text-sm truncate">
                          {transaction.employee?.full_name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Customer Name</p>
                        <p className="font-medium text-sm truncate">
                          {transaction.customer
                            ? `${transaction.customer.first_name} ${transaction.customer.last_name}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                        <p className="font-mono text-sm font-medium truncate">
                          {transaction.customer?.phone_number || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm leading-snug">
                          {transaction.customer?.address || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items ({transaction.order_items?.length || 0})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-md overflow-hidden border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="h-9 text-xs">Item ID</TableHead>
                        <TableHead className="h-9 text-xs">Description</TableHead>
                        <TableHead className="h-9 text-xs">Model</TableHead>
                        <TableHead className="h-9 text-xs">Serial</TableHead>
                        <TableHead className="h-9 text-xs text-right">Discount</TableHead>
                        <TableHead className="h-9 text-xs text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transaction.order_items && transaction.order_items.length > 0 ? (
                        transaction.order_items.map((orderItem, index) => (
                          <TableRow key={index} className="hover:bg-muted/30">
                            <TableCell className="py-2 text-sm font-medium">
                              {orderItem.item_id}
                            </TableCell>
                            <TableCell className="py-2 text-sm">{orderItem.item?.description || "N/A"}</TableCell>
                            <TableCell className="py-2 text-sm">{orderItem.item?.model || "N/A"}</TableCell>
                            <TableCell className="py-2 font-mono text-xs">
                              {orderItem.serial}
                            </TableCell>
                            <TableCell className="py-2 text-sm text-right text-red-600">
                              {orderItem.discount_amount ? formatCurrency(orderItem.discount_amount) : "-"}
                            </TableCell>
                            <TableCell className="py-2 text-sm text-right font-semibold">
                              {formatCurrency(orderItem.sale_amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">
                            No items in this order
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">
                      {transaction.order_items?.length || 0}
                    </span>
                  </div>
                  
                  {totalDiscount > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          {formatCurrency(transaction.total_price + totalDiscount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(totalDiscount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(transaction.total_price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}