import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
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

interface ShowProps {
  transaction: OrderWithrelations;
}

export default function Show({ transaction }: ShowProps) {
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

  return (
    <AppLayout>
      <Head title={`Order ${transaction.order_number}`} />
      
      <div className="space-y-6 p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.visit("/pos-cash-orders")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Order #{transaction.order_number}
              </h1>
              <p className="text-muted-foreground mt-1 text-xs">
                {formatDate(transaction.transaction_date)} • Location: {transaction.location.name} • Employee: {transaction.employee.full_name}
              </p>
            </div>
          </div>
        </div>

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
      </div>
    </AppLayout>
  );
}