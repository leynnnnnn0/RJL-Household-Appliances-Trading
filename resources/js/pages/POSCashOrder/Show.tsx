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
import { ArrowLeft, Package } from "lucide-react";
import { OrderWithrelations } from "@/types";
import ModuleHeading from "@/components/cards/module-heading";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

interface ShowProps {
  transaction: OrderWithrelations;
}

export default function Show({ transaction }: ShowProps) {
    const {previousUrl} = usePage().props as any;
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

  const { data, setData, post, processing, errors } = useForm({
    reason_for_cancellation: ''
  })

  const voidOrder = () => {
    post(`/pos-cash-orders/void/${transaction.id}`,{
      onSuccess: () => {
        toast.success("Order Void");
        setIsDialogOpen(false);
        setData('reason_for_cancellation', '');
      },
      onError: () => {
        toast.success("An error occured");
      }
    })
  }
  
  const headingSub = formatDate(transaction.transaction_date) + "• Location:" + transaction.location.name + "• Employee:" + transaction.employee.full_name;

  return (
    <AppLayout>
      <Head title={`Order ${transaction.order_number}`} />

      <ModuleHeading title={"Order #" + transaction.order_number} description={headingSub}>
         <Button variant="outline" asChild>
              <Link href={previousUrl}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={open => {
              setIsDialogOpen(open);
              if(!open) setData('reason_for_cancellation', '');
            }}>
  <DialogTrigger asChild>
    <Button disabled={transaction.is_void} variant="destructive">
      {transaction.is_void ? "Order Voided" : "Void Order"}
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="text-red-500">Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently void the order.
      </DialogDescription>
    </DialogHeader>
            <div className="grid gap-3">
              <Label>Reason for cancellation <span className="text-red-500">*</span> </Label>
              <Textarea  value={data.reason_for_cancellation} onChange={(e) => setData('reason_for_cancellation', e.target.value)}/>
                 {errors.reason_for_cancellation && (
                    <p className="text-sm text-destructive">{errors.reason_for_cancellation}</p>
                  )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => voidOrder()} variant="destructive">Void Order</Button>
            </div>
    
  </DialogContent>
</Dialog>

            
      </ModuleHeading>
      


        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
            <CardDescription>
              {transaction.order_items?.length || 0} item(s) in this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Item ID</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Model</TableHead>
                    <TableHead className="font-semibold">Serial</TableHead>
                    <TableHead className="font-semibold text-right">Sale Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.order_items && transaction.order_items.length > 0 ? (
                    transaction.order_items.map((orderItem, index) => (
                      <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          {orderItem.item_id}
                        </TableCell>
                        <TableCell>{orderItem.item?.description || "N/A"}</TableCell>
                        <TableCell>{orderItem.item?.model || "N/A"}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {orderItem.serial}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(orderItem.sale_amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No items in this order
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Total Summary at bottom of table */}
            <div className="mt-4 flex justify-end">
              <div className="bg-muted/50 rounded-lg px-6 py-4 min-w-64">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
                  <span className="text-2xl font-bold">{formatCurrency(transaction.total_price)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

    </AppLayout>
  );
}