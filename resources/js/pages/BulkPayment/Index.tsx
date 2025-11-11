import { useState, useEffect } from "react";
import { Trash2, Plus, Save, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import ModuleHeading from "@/components/cards/module-heading";
import axios from "axios";
import { toast } from "sonner";

export default function BulkPayments() {
  const [rows, setRows] = useState([{ id: 1 }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [openPopovers, setOpenPopovers] = useState({});
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [payments, setPayments] = useState([
    {
      installment_order_id: "",
      installment_order_payment_id: "",
      installment_number: "",
      amount_due: "",
      amount_paid: "",
      payment_method: "cash",
      reference_number: "",
      paid_date: new Date().toISOString().split("T")[0],
      collection_receipt_number: "",
      selected_order: null,
      available_installments: [],
    },
  ]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      axios.get(`/api/installment-orders?search=${searchQuery}`)
      .then(res => {
        console.log(res.data.data);
        setSearchResults(res.data.data || []);
        console.log(searchResults);
      })
      .catch(err => {
        console.error("Search error:", err);
        setSearchResults([]);
      })
      .finally(() => {
        setIsSearching(false);
      })
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows([...rows, { id: newId }]);
    setPayments([
      ...payments,
      {
        installment_order_id: "",
        installment_order_payment_id: "",
        installment_number: "",
        amount_due: "",
        amount_paid: "",
        payment_method: "cash",
        reference_number: "",
        paid_date: new Date().toISOString().split("T")[0],
        collection_receipt_number: "",
        selected_order: null,
        available_installments: [],
      },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    const newRows = rows.filter((_, i) => i !== index);
    const newPayments = payments.filter((_, i) => i !== index);
    setRows(newRows);
    setPayments(newPayments);
    
    // Clear validation errors for removed row
    const newErrors = { ...validationErrors };
    delete newErrors[index];
    // Reindex remaining errors
    const reindexedErrors = {};
    Object.keys(newErrors).forEach(key => {
      const idx = parseInt(key);
      if (idx > index) {
        reindexedErrors[idx - 1] = newErrors[key];
      } else {
        reindexedErrors[idx] = newErrors[key];
      }
    });
    setValidationErrors(reindexedErrors);
  };

  const selectOrder = (index, order) => {
    const newPayments = [...payments];
    
    // Handle installment_payments whether it's an object or array
    let installments = [];
    if (order.installment_payments) {
      if (Array.isArray(order.installment_payments)) {
        installments = order.installment_payments;
      } else {
        // Convert object to array
        installments = Object.entries(order.installment_payments).map(([id, details]) => ({
          id,
          ...details,
        }));
      }
    }
    
    newPayments[index] = {
      ...newPayments[index],
      installment_order_id: order.id,
      selected_order: order,
      available_installments: installments,
      installment_order_payment_id: "",
      installment_number: "",
      amount_due: "",
    };
    
    setPayments(newPayments);
    setOpenPopovers({ ...openPopovers, [index]: false });
    setSearchQuery(""); // Reset search query after selection
  };

  const selectInstallment = (index, installmentId) => {
    const newPayments = [...payments];
    const currentOrderId = newPayments[index].installment_order_id;
    
    // Check if this installment is already selected for the same order
    const isDuplicate = newPayments.some((payment, idx) => 
      idx !== index && 
      payment.installment_order_id === currentOrderId && 
      payment.installment_order_payment_id === installmentId
    );
    
    if (isDuplicate) {
      toast.error("This installment has already been selected for this customer in another row.");
      return;
    }
    
    const selectedInstallment = newPayments[index].available_installments.find(
      (inst) => inst.id === installmentId
    );
    
    if (selectedInstallment) {
      // Check if installment is already paid
      if (selectedInstallment.status?.toLowerCase() === 'paid') {
        toast.error("This installment has already been paid and cannot be selected.");
        return;
      }
      
      const installmentNumber = newPayments[index].available_installments.findIndex(
        (inst) => inst.id === installmentId
      ) + 1;
      
      // Check sequence - all previous installments must be paid or selected
      const allInstallments = newPayments[index].available_installments;
      const currentOrderPayments = newPayments.filter(p => p.installment_order_id === currentOrderId);
      
      for (let i = 0; i < installmentNumber - 1; i++) {
        const prevInstallment = allInstallments[i];
        const isPaid = prevInstallment.status?.toLowerCase() === 'paid';
        const isSelected = currentOrderPayments.some(p => p.installment_order_payment_id === prevInstallment.id);
        
        if (!isPaid && !isSelected) {
          toast.error(`You must select installment #${i + 1} before selecting #${installmentNumber}.`);
          return;
        }
      }
      
      newPayments[index] = {
        ...newPayments[index],
        installment_order_payment_id: installmentId,
        installment_number: installmentNumber.toString(),
        amount_due: selectedInstallment.amount_due,
        amount_paid: selectedInstallment.amount_due,
      };
      
      setPayments(newPayments);
    }
  };

  const updatePayment = (index, field, value) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
    
    // Clear validation error when user starts typing
    if (validationErrors[index]?.[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[index][field];
      if (Object.keys(newErrors[index] || {}).length === 0) {
        delete newErrors[index];
      }
      setValidationErrors(newErrors);
    }
  };

  const validatePayments = () => {
    const errors = {};
    let isValid = true;
    
    payments.forEach((payment, index) => {
      const rowErrors = {};
      
      // Validate amount paid
      if (!payment.amount_paid || parseFloat(payment.amount_paid) <= 0) {
        rowErrors.amount_paid = true;
        isValid = false;
      }
      
      // Validate receipt number
      if (!payment.collection_receipt_number || payment.collection_receipt_number.trim() === '') {
        rowErrors.collection_receipt_number = true;
        isValid = false;
      }
      
      if (Object.keys(rowErrors).length > 0) {
        errors[index] = rowErrors;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    // Validate all required fields
    if (!validatePayments()) {
      toast.error("Please fill in all required fields (Amount Paid and Receipt #).");
      return;
    }
    
    // Check if all payments have order and installment selected
    const validPayments = payments.filter(p => 
      p.installment_order_id && 
      p.installment_order_payment_id && 
      p.amount_paid
    );
    
    if (validPayments.length !== payments.length) {
      toast.error("Please make sure that all rows have order and installment selected.");
      return;
    }
    
    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setProcessing(true);

    router.post(route('bulk-payments.store'), {
      payments: payments
    },{
      onSuccess: () => {
        toast.success("Payments Recorded Successfully.");
        resetForm();
      },
      onError: (e) => {
        console.error("Submission error:", e);
        toast.error("Failed to save payments. Please try again.");
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  const resetForm = () => {
    setRows([{ id: 1 }]);
    setPayments([
      {
        installment_order_id: "",
        installment_order_payment_id: "",
        installment_number: "",
        amount_due: "",
        amount_paid: "",
        payment_method: "cash",
        reference_number: "",
        paid_date: new Date().toISOString().split("T")[0],
        collection_receipt_number: "",
        selected_order: null,
        available_installments: [],
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
    setValidationErrors({});
  };

  return (
    <AppLayout>
      <Head title="Bulk Payments"/>
      <ModuleHeading title="Bulk Payments" description="Process multiple installment payments at once"/>
      
      <div className="min-h-screen bg-background">
        <div className="space-y-6">
          {/* Instructions */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Instructions:</strong> Search for an order or customer, select the installment number, 
              and fill in the payment details. You can add multiple payments at once.
            </AlertDescription>
          </Alert>

        {/* Table Container */}
        <div className="bg-card border rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-2 py-3 text-left font-medium w-8">#</th>
                  <th className="px-2 py-3 text-left font-medium min-w-[200px]">Model / Customer</th>
                  <th className="px-2 py-3 text-left font-medium w-32">Installment</th>
                  <th className="px-2 py-3 text-left font-medium w-28">Amount Due</th>
                  <th className="px-2 py-3 text-left font-medium w-28">Amount Paid *</th>
                  <th className="px-2 py-3 text-left font-medium w-32">Payment Method</th>
                  <th className="px-2 py-3 text-left font-medium w-32">Reference #</th>
                  <th className="px-2 py-3 text-left font-medium w-32">Paid Date</th>
                  <th className="px-2 py-3 text-left font-medium w-32">Receipt # *</th>
                  <th className="px-2 py-3 text-center font-medium w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    <td className="px-2 py-2 text-center text-muted-foreground">
                      {index + 1}
                    </td>
                    
                    {/* Order Search */}
                    <td className="px-2 py-2">
                      <Popover 
                        open={openPopovers[index]} 
                        onOpenChange={(open) => {
                          setOpenPopovers({ ...openPopovers, [index]: open });
                          if (!open) {
                            setSearchQuery("");
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-8 text-xs font-normal"
                          >
                            {payments[index]?.selected_order
                              ? `${payments[index].selected_order.item_model} - ${payments[index].selected_order.customer}`
                              : "Search order..."}
                            <Search className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Search by order # or name..."
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                              className="text-xs"
                            />
                            <CommandEmpty className="text-xs py-6 text-center">
                              {isSearching ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span>Searching...</span>
                                </div>
                              ) : searchQuery.length < 2 ? (
                                "Type at least 2 characters to search"
                              ) : (
                                "No orders found"
                              )}
                            </CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {searchResults.map((order) => (
                                <CommandItem
                                  key={order.id}
                                  value={`${order.id}-${order.order_number}`}
                                  onSelect={() => selectOrder(index, order)}
                                  className="text-xs"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{order.item_model}</span>
                                    <span className="text-muted-foreground">{order.customer}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </td>

                    {/* Installment Number Select */}
                    <td className="px-2 py-2">
                      <Select
                        value={payments[index]?.installment_order_payment_id || ""}
                        onValueChange={(value) => selectInstallment(index, value)}
                        disabled={!payments[index]?.selected_order}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {payments[index]?.available_installments?.map((inst, idx) => {
                            const isPaid = inst.status?.toLowerCase() === 'paid';
                            return (
                              <SelectItem 
                                key={inst.id} 
                                value={inst.id} 
                                className="text-xs"
                                disabled={isPaid}
                              >
                                {inst.due_date} - {inst.status} {isPaid ? '(Paid)' : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Amount Due */}
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        disabled
                        className="h-8 text-xs"
                        value={payments[index]?.amount_due || ""}
                        onChange={(e) => updatePayment(index, "amount_due", e.target.value)}
                        readOnly
                      />
                    </td>

                    {/* Amount Paid */}
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={`h-8 text-xs ${
                          validationErrors[index]?.amount_paid 
                            ? 'border-red-500 focus-visible:ring-red-500' 
                            : ''
                        }`}
                        value={payments[index]?.amount_paid || ""}
                        onChange={(e) => updatePayment(index, "amount_paid", e.target.value)}
                      />
                    </td>

                    {/* Payment Method */}
                    <td className="px-2 py-2">
                      <Select
                        value={payments[index]?.payment_method || "cash"}
                        onValueChange={(value) => updatePayment(index, "payment_method", value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash" className="text-xs">Cash</SelectItem>
                          <SelectItem value="gcash" className="text-xs">GCash</SelectItem>
                          <SelectItem value="bank_transfer" className="text-xs">Bank Transfer</SelectItem>
                          <SelectItem value="credit_card" className="text-xs">Credit Card</SelectItem>
                          <SelectItem value="debit_card" className="text-xs">Debit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Reference Number */}
                    <td className="px-2 py-2">
                      <Input
                        type="text"
                        placeholder="REF-123"
                        className="h-8 text-xs"
                        value={payments[index]?.reference_number || ""}
                        onChange={(e) => updatePayment(index, "reference_number", e.target.value)}
                      />
                    </td>

                    {/* Paid Date */}
                    <td className="px-2 py-2">
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={payments[index]?.paid_date || ""}
                        onChange={(e) => updatePayment(index, "paid_date", e.target.value)}
                      />
                    </td>

                    {/* Receipt Number */}
                    <td className="px-2 py-2">
                      <Input
                        type="text"
                        placeholder="CR-123"
                        className={`h-8 text-xs ${
                          validationErrors[index]?.collection_receipt_number 
                            ? 'border-red-500 focus-visible:ring-red-500' 
                            : ''
                        }`}
                        value={payments[index]?.collection_receipt_number || ""}
                        onChange={(e) => updatePayment(index, "collection_receipt_number", e.target.value)}
                      />
                    </td>

                    {/* Delete Button */}
                    <td className="px-2 py-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(index)}
                        disabled={rows.length === 1}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Actions */}
          <div className="p-4 flex items-center justify-between border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-2" />
              Add Row
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="text-xs"
              >
                Reset
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={processing}
                className="text-xs"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-2" />
                    Save Payments
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment Submission</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to save {payments.length} payment{payments.length > 1 ? 's' : ''}. 
              This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              Confirm & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}