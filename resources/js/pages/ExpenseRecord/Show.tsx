import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Download } from "lucide-react";
import { ExpenseRecord } from "@/types";
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
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PageProps {
  expense_record: ExpenseRecord;
}

export default function Show({ expense_record }: PageProps) {
  const { data, setData, patch, processing } = useForm({
    status: expense_record.status,
  });

  const handleDelete = () => {
    router.delete(route("expense-record.destroy", expense_record.id), {
      onSuccess: () => {
        router.visit(route("expense-record.index"));
      },
    });
  };

  const handleStatusUpdate = () => {
    patch(route("expense-record.update-status", expense_record.id), {
      preserveScroll: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fuel":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "repair":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "supplies":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "meal":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "emergency":
        return "bg-rose-100 text-rose-800 hover:bg-rose-100";
      case "other":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <AppLayout>
      <Head title="Expense Record Details" />
      <ModuleHeading
        title="Expense Record Details"
        description={`Viewing expense record #${expense_record.id}`}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.visit(route("expense-record.edit", expense_record.id))
            }
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  expense record from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </ModuleHeading>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={data.status}
                    onValueChange={(value) => setData("status", value)}
                    disabled={processing}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={processing || data.status === expense_record.status}
                  className="mb-0.5"
                >
                  {processing ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="font-medium">
                    {expense_record.user?.full_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-lg">
                    ₱
                    {Number(expense_record.amount).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <Badge className={getCategoryColor(expense_record.category)}>
                    {expense_record.category.charAt(0).toUpperCase() +
                      expense_record.category.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusColor(expense_record.status)}>
                    {expense_record.status.charAt(0).toUpperCase() +
                      expense_record.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">
                    {expense_record.payment_method.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="font-medium">
                    {expense_record.reference_number || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Remarks</p>
                  <p className="font-medium">
                    {expense_record.remarks || "No remarks provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Information */}
          {(expense_record.approved_by || expense_record.approved_at) && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Approved By</p>
                    <p className="font-medium">
                      {expense_record.approved_by?.full_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Approved At</p>
                    <p className="font-medium">
                      {expense_record.approved_at
                        ? new Date(
                            expense_record.approved_at
                          ).toLocaleString("en-PH")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {new Date(expense_record.created_at).toLocaleString(
                      "en-PH"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {new Date(expense_record.updated_at).toLocaleString(
                      "en-PH"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receipt Image */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              {expense_record.receipt_path ? (
                <div className="space-y-4">
                  <img
                    src={`/storage/${expense_record.receipt_path}`}
                    alt="Receipt"
                    className="w-full rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        `/storage/${expense_record.receipt_path}`,
                        "_blank"
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No receipt uploaded
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}