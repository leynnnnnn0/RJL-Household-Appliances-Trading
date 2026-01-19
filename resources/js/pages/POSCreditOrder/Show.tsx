import React, { useState, useEffect } from 'react';
import { InstallmentOrderWithRelations, InstallmentOrderPayment, InstallmentOrderPaymentHistory, Branch } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CreditCard, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Check,
  ArrowRight,
  MoreVertical,
  Ban,
  AlertTriangle,
  ArrowLeft,
  Percent,
  CloudLightning,
  Download,
  AlertCircleIcon,
  InfoIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ModuleHeading from '@/components/cards/module-heading';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { IconTopologyStarRing3 } from '@tabler/icons-react';
import InstallmentOrderRemarksSection from './InstallmentOrderRemarkSection';


interface InstallmentOrderRemark {
  id: number;
  installment_order_id: number;
  user_id: number;
  remarks: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    full_name: string;
  };
}


interface PageProps {
    transaction: InstallmentOrderWithRelations,
    paymentHistory: InstallmentOrderPaymentHistory[],
    remarks: InstallmentOrderRemark[],
    branches: Branch[]
}

export default function Show({transaction, paymentHistory, branches} : PageProps){
    const {previousUrl} = usePage().props as any;
    const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const [showDefaultDialog, setShowDefaultDialog] = useState(false);
     const [showAccelerateDialog, setAcceleratetDialog] = useState(false);
    const [showRebateDialog, setShowRebateDialog] = useState(false);
        const [showReactivateDialog, setShowReactivateDialog] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<InstallmentOrderPayment | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isOverdue = (dueDate: string, status: string) => {
        if (status === 'paid' || status === 'completed') return false;
        return new Date(dueDate) < new Date();
    };

    // Find the next payment to be made (first unpaid/partial payment in order)
    const nextPayment = transaction.installment_order_payments
        ?.sort((a, b) => a.installment_number - b.installment_number)
        .find(p => p.status !== 'paid' && p.status !== 'completed') || null;

    const { data, setData, post, processing, errors, reset } = useForm({
        installment_order_payment_id: nextPayment?.id.toString() || '',
        installment_order_id: transaction.id,
        installment_number: nextPayment?.installment_number || 0,
        amount_due: nextPayment?.amount_due || 0,
        amount_paid: '',
        payment_method: 'cash',
        reference_number: '',
        paid_date: new Date().toISOString().split('T')[0],
        collection_receipt_number: '',
        branch_id: branches[0].id.toString() // Default to the only branch if there's just one
    });

    // Void transaction form
    const voidForm = useForm({
        installment_order_id: transaction.id,
        reason_for_cancellation: ''
    });

    // Default transaction form
    const defaultForm = useForm({
        installment_order_id: transaction.id,
        default_reason: ''
    });

      // Reactivate transaction form
    const reactivateForm = useForm({
        installment_order_id: transaction.id,
        reactivation_reason: ''
    });


    // Rebate form
    const rebateForm = useForm({
        installment_order_payment_id: '',
        rebate_amount: '',
        rebate_reason: '',
    });



    // Update form when nextPayment changes
    useEffect(() => {
        if (nextPayment) {
            const alreadyPaid = Number(nextPayment.amount_paid || 0);
            const remainingAmount = Number(nextPayment.amount_due) - alreadyPaid - nextPayment.rebate_amount;
            
            setData({
                installment_order_payment_id: nextPayment.id.toString(),
                installment_order_id: transaction.id,
                installment_number: nextPayment.installment_number,
                amount_due: Number(nextPayment.amount_due),
                amount_paid: remainingAmount.toString(),
                payment_method: 'cash',
                reference_number: '',
                paid_date: new Date().toISOString().split('T')[0],
                collection_receipt_number: ''
            });
        }
    }, [nextPayment?.id]);

    const totalPaid = transaction.total_amount_paid;

    const lcp = transaction.loan_contract_price;
    const down = transaction.down_payment;
    const pnv = lcp - down;
    const pnvAdditionalCharge = Number(transaction.promisory_note_value_interest_additional_charge);
    let final_pnv = pnv * transaction.promisory_note_value_interest + pnvAdditionalCharge;
    if(final_pnv == 0) final_pnv = transaction.loan_contract_price;

    
    const totalToPay = final_pnv;
    const remainingBalance = transaction.remaining_balance - transaction.total_rebate_amount;
    let paymentProgress = 0;
    if(totalPaid > 0 && final_pnv > 0){
        paymentProgress = (totalPaid / final_pnv) * 100
    }

        // Acceleration form
    const accelerationForm = useForm({
       installment_order_id: transaction.id,
       acceleration_discount: "",
       amount_paid: remainingBalance.toFixed(2),
               reason_for_acceleration: '',
                       payment_method: 'cash',
        reference_number: '',
        paid_date: new Date().toISOString().split('T')[0],
        collection_receipt_number: ''
        
    });

    const pendingPayments = transaction.installment_order_payments?.filter(p => 
        p.status === 'pending' || p.status === 'overdue' || p.status === 'partial'
    ).length || 0;

    const overduePayments = transaction.installment_order_payments?.filter(p => 
        isOverdue(p.due_date, p.status)
    ).length || 0;

    const handlePaymentSubmit = () => {
        if(!window.can('can record installment order payment')){
            toast.info("You do not have an access for this action.");
            return;
        }
        setShowPaymentConfirmation(false);
        
        post(`/pos-installment-orders/record-payment`, {
            onSuccess: () => {
                reset('amount_paid', 'reference_number', 'collection_receipt_number');
                toast.success("Payment Recorded Successfully");
            },
            onError: (e) => {
                toast.error("An error occurred while recording payment");

            }
        });
    };

    const handleVoidSubmit = () => {
        voidForm.post(`/pos-installment-orders/${transaction.id}/void`, {
            onSuccess: () => {
                setShowVoidDialog(false);
                toast.success("Transaction voided successfully");
            },
            onError: (e) => {
                toast.error("An error occurred while voiding transaction");

            }
        });
    };

     const handleReactivateSubmit = () => {
        reactivateForm.post(`/pos-installment-orders/${transaction.id}/reactivate`, {
            onSuccess: () => {
                setShowReactivateDialog(false);
                toast.success("Transaction reactivated.");
            },
            onError: (e) => {
                toast.error("An error occurred while marking reactivating");

            }
        });
    };

    const handleDefaultSubmit = () => {
        defaultForm.post(`/pos-installment-orders/${transaction.id}/default`, {
            onSuccess: () => {
                setShowDefaultDialog(false);
                toast.success("Transaction marked as defaulted");
            },
            onError: (e) => {
                toast.error("An error occurred while marking as default");
   
            }
        });
    };

    const handleAccelerationSubmit = () => {

         accelerationForm.post(`/pos-installment-orders/${transaction.id}/accelerate`, {
            onSuccess: () => {
                setAcceleratetDialog(false);
                toast.success("Transaction marked as accelerated");
            },
            onError: (e) => {
                toast.error("An error occurred while marking as accelerated");

            }
        });
    }

    const handleRebateClick = (payment: InstallmentOrderPayment) => {
        if(!window.can('can add rebate')){
            return;
        }
        const amountPaid = Number(payment.amount_paid || 0);
        const amountDue = Number(payment.amount_due);
        const remaining = amountDue - amountPaid;
        
        // Only allow rebate if there's a remaining balance
        if (remaining > 0) {
            setSelectedPayment(payment);
            rebateForm.setData({
                installment_order_payment_id: payment.id.toString(),
                rebate_amount: '',
                rebate_reason: ''
            });
            setShowRebateDialog(true);
        }
    };

    const handleRebateSubmit = () => {
        rebateForm.put(`/pos-installment-orders/${transaction.id}/rebate`, {
            onSuccess: () => {
                setShowRebateDialog(false);
                setSelectedPayment(null);
                rebateForm.reset();
                toast.success("Rebate added successfully");
            },
            onError: (e) => {
                toast.error("An error occurred while adding rebate");
  
            }
        });
    };

    const getPaymentStatusBadge = (payment: InstallmentOrderPayment) => {
        if (payment.status === 'paid' || payment.status === 'completed') {
            return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>;
        }
        if (payment.status === 'partial') {
            return <Badge className="bg-blue-600"><Clock className="w-3 h-3 mr-1" />Partial</Badge>;
        }
        if (isOverdue(payment.due_date, payment.status)) {
            return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
        }
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    };

    // Calculate remaining amount for next payment
    const nextPaymentRemaining = nextPayment 
        ? Number(nextPayment.amount_due) - Number(nextPayment.amount_paid || 0)
        : 0;

    // Validate payment amount
    const isValidAmount = () => {
        const amount = Number(data.amount_paid);
        return amount > 0 && amount <= nextPaymentRemaining;
    };


    return (
        <AppLayout>
            <Head title="Installment Order Details" />

            <div className="mx-auto max-w-[1800px]">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content - Left Side */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <ModuleHeading
                                title={`Order #${transaction.order_number}`}
                                description="Installment order details and payment schedule"
                            />
                            <div className="flex items-center gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={previousUrl}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to List
                                    </Link>
                                </Button>
                                {transaction.is_voided == true && (
                                    <Badge
                                        variant="destructive"
                                        className="h-8"
                                    >
                                        <XCircle className="mr-1 h-4 w-4" />
                                        Voided
                                    </Badge>
                                )}
                                {transaction.is_completed == true && (
                                    <Badge className="h-8 bg-green-600">
                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                        Completed
                                    </Badge>
                                )}
                                {transaction.is_defaulted == true && (
                                    <Badge
                                        variant="destructive"
                                        className="h-8"
                                    >
                                        <AlertCircle className="mr-1 h-4 w-4" />
                                        Defaulted
                                    </Badge>
                                )}
                                {!transaction.is_completed &&
                                    !transaction.is_voided &&
                                    !transaction.is_defaulted && (
                                        <Badge
                                            variant="secondary"
                                            className="h-8"
                                        >
                                            Active
                                        </Badge>
                                    )}

                                {/* Actions Menu */}
                                {!transaction.is_voided &&
                                    !transaction.is_completed && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            {!transaction.is_defaulted ? (
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            window.open(
                                                                `/promisory-note/${transaction.id}`,
                                                                '_blank',
                                                            )
                                                        }
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Promisorry Note
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            window.open(
                                                                `/installmentContract/${transaction.id}`,
                                                                '_blank',
                                                            )
                                                        }
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Installment Contract
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            window.open(
                                                                `/depositAgreement/${transaction.id}`,
                                                                '_blank',
                                                            )
                                                        }
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Deposit Agreement
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            window.open(
                                                                `/demandLetter/${transaction.id}`,
                                                                '_blank',
                                                            )
                                                        }
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Demand Letter
                                                    </DropdownMenuItem>

                                                    {window.can(
                                                        'can accelerate',
                                                    ) && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setAcceleratetDialog(
                                                                    true,
                                                                )
                                                            }
                                                            className="text-green-600 focus:text-green-600"
                                                        >
                                                            <CloudLightning className="mr-2 h-4 w-4" />
                                                            Accelerate
                                                            Transaction
                                                        </DropdownMenuItem>
                                                    )}
                                                    {!transaction.is_defaulted &&
                                                        window.can(
                                                            'can default',
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setShowDefaultDialog(
                                                                        true,
                                                                    )
                                                                }
                                                                className="text-orange-600 focus:text-orange-600"
                                                            >
                                                                <AlertTriangle className="mr-2 h-4 w-4" />
                                                                Mark as Default
                                                            </DropdownMenuItem>
                                                        )}
                                                    {window.can('can void') && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setShowVoidDialog(
                                                                    true,
                                                                )
                                                            }
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            Void Transaction
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            ) : (
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setShowReactivateDialog(
                                                                true,
                                                            )
                                                        }
                                                        className="text-orange-600 focus:text-orange-600"
                                                    >
                                                        <AlertCircleIcon className="h-4 w-4 text-orange-600" />
                                                        Reactivate
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            )}
                                        </DropdownMenu>
                                    )}
                            </div>
                        </div>

                        {/* Status Alerts */}
                        {transaction.is_voided == true && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This order was voided on{' '}
                                    {formatDate(transaction.void_date || '')}.
                                    Reason:{' '}
                                    {transaction.reason_for_cancellation}
                                </AlertDescription>
                            </Alert>
                        )}

                        {transaction.is_accelerated == true && (
                            <Alert>
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This order was accelerated on{' '}
                                    {formatDate(
                                        transaction.acceleration_date || '',
                                    )}
                                    . Reason:{' '}
                                    {transaction.reason_for_acceleration}
                                </AlertDescription>
                            </Alert>
                        )}

                        {transaction.is_defaulted == true && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This order is in default status. Reason:{' '}
                                    {transaction.default_reason}
                                </AlertDescription>
                            </Alert>
                        )}

                        {transaction.is_reactivated == true && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This order was defaulted. | Reason:{' '}
                                    {transaction.default_reason} | Date:{' '}
                                    {transaction.default_date}
                                </AlertDescription>
                            </Alert>
                        )}

                        {overduePayments > 0 && !transaction.is_voided && (
                            <Alert variant="info">
                                <InfoIcon className="h-4 w-4" />
                                <AlertDescription>
                                    This account has {overduePayments} overdue
                                    payment{overduePayments > 1 ? 's' : ''}.
                                    Please settle immediately.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Payments
                                        </p>
                                        <p className="mt-2 text-3xl font-bold">
                                            {transaction
                                                .installment_order_payments
                                                ?.length || 0}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Paid
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-green-600">
                                            {transaction.installment_order_payments?.filter(
                                                (p) =>
                                                    p.status === 'paid' ||
                                                    p.status === 'completed',
                                            ).length || 0}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Pending
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-orange-600">
                                            {pendingPayments}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Overdue
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-red-600">
                                            {overduePayments}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconTopologyStarRing3 className="h-5 w-5" />
                                    Item Details
                                </CardTitle>
                                <CardDescription>
                                    Items included in this installment order
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {transaction.installment_order_items &&
                                transaction.installment_order_items.length >
                                    0 ? (
                                    <div className="space-y-4">
                                        {transaction.installment_order_items.map(
                                            (orderItem, index) => (
                                                <div
                                                    key={orderItem.id}
                                                    className={`rounded-lg border p-4 ${
                                                        orderItem.discount_amount >
                                                            0 &&
                                                        orderItem.sale_amount ===
                                                            0
                                                            ? 'border-green-200 bg-green-50'
                                                            : 'bg-muted/30'
                                                    }`}
                                                >
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <h4 className="text-base font-semibold">
                                                                    {
                                                                        orderItem
                                                                            .item
                                                                            .description
                                                                    }
                                                                </h4>
                                                                {orderItem.discount_amount >
                                                                    0 &&
                                                                    orderItem.sale_amount ===
                                                                        0 && (
                                                                        <Badge className="bg-green-600">
                                                                            FREE
                                                                            ITEM
                                                                        </Badge>
                                                                    )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Item #
                                                                {index + 1}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                                        <div>
                                                            <p className="mb-1 text-xs text-muted-foreground">
                                                                Model
                                                            </p>
                                                            <p className="font-medium">
                                                                {
                                                                    orderItem
                                                                        .item
                                                                        .model
                                                                }
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-xs text-muted-foreground">
                                                                Serial
                                                            </p>
                                                            <p className="font-medium">
                                                                {orderItem.item
                                                                    .serial ||
                                                                    orderItem.serial}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-xs text-muted-foreground">
                                                                Sale Amount
                                                            </p>
                                                            <p className="font-medium text-green-600">
                                                                {formatCurrency(
                                                                    Number(
                                                                        orderItem.sale_amount,
                                                                    ),
                                                                )}
                                                            </p>
                                                        </div>
                                                        {orderItem.discount_amount >
                                                            0 && (
                                                            <div>
                                                                <p className="mb-1 text-xs text-muted-foreground">
                                                                    Discount
                                                                </p>
                                                                <p className="font-medium text-blue-600">
                                                                    {formatCurrency(
                                                                        Number(
                                                                            orderItem.discount_amount,
                                                                        ),
                                                                    )}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-muted-foreground">
                                            No items found
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Name
                                        </p>
                                        <p className="font-medium">
                                            {transaction.customer?.first_name}{' '}
                                            {transaction.customer?.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Address
                                        </p>
                                        <p className="font-medium">
                                            {transaction.customer?.address}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Phone Number
                                        </p>
                                        <p className="font-medium">
                                            {transaction.customer?.phone_number}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transaction Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Transaction Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Transaction Date
                                        </span>
                                        <span className="flex items-center gap-1 font-medium">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(
                                                transaction.transaction_date,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Location
                                        </span>
                                        <span className="flex items-center gap-1 font-medium">
                                            <MapPin className="h-4 w-4" />
                                            {transaction.location?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Processed By
                                        </span>
                                        <span className="font-medium">
                                            {transaction.user?.full_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Terms
                                        </span>
                                        <span className="font-medium">
                                            {transaction.number_of_terms} months
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Financial Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Financial Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Loan Contract Price
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(
                                                transaction.loan_contract_price,
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            +{transaction.lcp_markup_rate}%
                                            markup{' '}
                                            {transaction.lcp_additional_charge >
                                            0
                                                ? `+ ${transaction.lcp_additional_charge} charge`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Down Payment
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(
                                                transaction.down_payment,
                                            )}
                                        </p>
                                        {transaction.payment_method && (
                                            <p className="text-xs text-muted-foreground capitalize">
                                                via {transaction.payment_method}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Total PNV
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(final_pnv)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            +
                                            {
                                                transaction.promisory_note_value_interest
                                            }
                                            % markup{' '}
                                            {pnvAdditionalCharge > 0
                                                ? `+ ${pnvAdditionalCharge} charge`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Remaining Balance
                                        </p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {formatCurrency(remainingBalance)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {paymentProgress.toFixed(1)}% paid
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Total Rebate
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(
                                                transaction.total_rebate_amount,
                                            )}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            Total Advanced Payment
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(
                                                transaction.total_advanced_payment,
                                            )}
                                        </p>
                                    </div>

                                    {transaction.is_accelerated == true && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">
                                                Total Acceleration Discount
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(
                                                    transaction.acceleration_discount,
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-4" />

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Payment Progress
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(totalPaid)} of{' '}
                                            {formatCurrency(final_pnv)}
                                        </span>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-secondary">
                                        <div
                                            className="h-3 rounded-full bg-primary transition-all"
                                            style={{
                                                width: `${Math.min(paymentProgress, 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Payment Schedule
                                </CardTitle>
                                <CardDescription>
                                    Complete payment history and schedule. Click
                                    on a row to add rebate.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {transaction.installment_order_payments &&
                                transaction.installment_order_payments.length >
                                    0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                        #
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                        Due Date
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                        Amount Due
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                        Amount Paid
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                        Remaining
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                        Rebate
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                        Payment Date
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transaction.installment_order_payments
                                                    .sort(
                                                        (a, b) =>
                                                            a.installment_number -
                                                            b.installment_number,
                                                    )
                                                    .map((payment) => {
                                                        const isPaid =
                                                            payment.status ===
                                                                'paid' ||
                                                            payment.status ===
                                                                'completed';
                                                        const isNext =
                                                            nextPayment?.id ===
                                                            payment.id;
                                                        const amountPaid =
                                                            Number(
                                                                payment.amount_paid ||
                                                                    0,
                                                            );
                                                        const amountDue =
                                                            Number(
                                                                payment.amount_due,
                                                            ) -
                                                            payment.rebate_amount;
                                                        let remaining =
                                                            amountDue -
                                                            amountPaid;
                                                        const hasBalance =
                                                            remaining > 0;

                                                        if (
                                                            transaction.is_accelerated ==
                                                            true
                                                        )
                                                            remaining = 0;

                                                        return (
                                                            <tr
                                                                key={payment.id}
                                                                onClick={() =>
                                                                    transaction.is_accelerated ==
                                                                        false &&
                                                                    hasBalance &&
                                                                    handleRebateClick(
                                                                        payment,
                                                                    )
                                                                }
                                                                className={`border-b transition-colors ${
                                                                    isNext
                                                                        ? 'bg-primary/10'
                                                                        : ''
                                                                } ${hasBalance && transaction.is_accelerated == false ? 'cursor-pointer hover:bg-muted/50' : 'cursor-not-allowed opacity-60'}`}
                                                            >
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        {isPaid && (
                                                                            <Check className="h-4 w-4 text-green-600" />
                                                                        )}
                                                                        {isNext && (
                                                                            <ArrowRight className="h-4 w-4 text-primary" />
                                                                        )}
                                                                        <span className="font-medium">
                                                                            #
                                                                            {
                                                                                payment.installment_number
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    {formatDate(
                                                                        payment.due_date,
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm font-medium">
                                                                    {formatCurrency(
                                                                        amountDue,
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm font-medium text-green-600">
                                                                    {amountPaid >
                                                                    0
                                                                        ? formatCurrency(
                                                                              amountPaid,
                                                                          )
                                                                        : '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm font-medium text-orange-600">
                                                                    {remaining >
                                                                    0
                                                                        ? formatCurrency(
                                                                              remaining,
                                                                          )
                                                                        : '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm font-medium text-blue-600">
                                                                    {payment.rebate_amount >
                                                                    0
                                                                        ? formatCurrency(
                                                                              payment.rebate_amount,
                                                                          )
                                                                        : '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                                    {payment.paid_date
                                                                        ? formatDate(
                                                                              payment.paid_date,
                                                                          )
                                                                        : '-'}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {getPaymentStatusBadge(
                                                                        payment,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No payment schedule generated
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Form - Right Side (Sticky)s */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            {!transaction.is_voided &&
                            !transaction.is_completed &&
                            !transaction.is_defaulted &&
                            nextPayment ? (
                                <>
                                    <Card className="border-primary shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CreditCard className="h-5 w-5" />
                                                Record Payment
                                            </CardTitle>
                                            <CardDescription>
                                                Next payment in sequence
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Next Payment Info */}
                                            <div className="mb-6 space-y-4">
                                                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">
                                                            Installment
                                                        </span>
                                                        <span className="text-lg font-bold">
                                                            #
                                                            {
                                                                nextPayment.installment_number
                                                            }
                                                        </span>
                                                    </div>
                                                    <Separator />
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">
                                                            Due Date
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {formatDate(
                                                                nextPayment.due_date,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">
                                                            Amount Due
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {formatCurrency(
                                                                nextPayment.amount_due -
                                                                    nextPayment.rebate_amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {Number(
                                                        nextPayment.amount_paid ||
                                                            0,
                                                    ) > 0 && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-muted-foreground">
                                                                    Already Paid
                                                                </span>
                                                                <span className="text-sm font-medium text-green-600">
                                                                    {formatCurrency(
                                                                        Number(
                                                                            nextPayment.amount_paid,
                                                                        ),
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <Separator />
                                                        </>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium">
                                                            Remaining
                                                        </span>
                                                        <span className="text-lg font-bold text-primary">
                                                            {formatCurrency(
                                                                nextPaymentRemaining -
                                                                    nextPayment.rebate_amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isOverdue(
                                                    nextPayment.due_date,
                                                    nextPayment.status,
                                                ) && (
                                                    <Alert variant="destructive">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription className="text-xs">
                                                            This payment is
                                                            overdue!
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>

                                            <Separator className="my-4" />

                                            {/* Payment Form */}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="amount_paid">
                                                        Payment Amount *
                                                    </Label>
                                                    <Input
                                                        id="amount_paid"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={data.amount_paid}
                                                        onChange={(e) =>
                                                            setData(
                                                                'amount_paid',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={
                                                            errors.amount_paid
                                                                ? 'border-red-500'
                                                                : ''
                                                        }
                                                    />
                                                    {errors.amount_paid && (
                                                        <p className="text-xs text-red-500">
                                                            {errors.amount_paid}
                                                        </p>
                                                    )}
                                                    {/* {data.amount_paid && Number(data.amount_paid) < nextPaymentRemaining && Number(data.amount_paid) > 0 && (
                                                        <Alert className="mt-2">
                                                            <AlertDescription className="text-xs">
                                                                Partial payment: {formatCurrency(nextPaymentRemaining - Number(data.amount_paid))} will remain
                                                            </AlertDescription>
                                                        </Alert>
                                                    )} */}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="payment_method">
                                                        Payment Method *
                                                    </Label>
                                                    <Select
                                                        value={
                                                            data.payment_method
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setData(
                                                                'payment_method',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cash">
                                                                Cash
                                                            </SelectItem>
                                                            <SelectItem value="gcash">
                                                                GCash
                                                            </SelectItem>
                                                            <SelectItem value="bank_transfer">
                                                                Bank Transfer
                                                            </SelectItem>
                                                            <SelectItem value="credit_card">
                                                                Credit Card
                                                            </SelectItem>
                                                            <SelectItem value="debit_card">
                                                                Debit Card
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.payment_method && (
                                                        <p className="text-xs text-red-500">
                                                            {
                                                                errors.payment_method
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="reference_number">
                                                        Reference Number
                                                    </Label>
                                                    <Input
                                                        id="reference_number"
                                                        type="text"
                                                        placeholder="Required for non cash payments"
                                                        value={
                                                            data.reference_number
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'reference_number',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="paid_date">
                                                        Payment Date *
                                                    </Label>
                                                    <Input
                                                        id="paid_date"
                                                        type="date"
                                                        value={data.paid_date}
                                                        onChange={(e) =>
                                                            setData(
                                                                'paid_date',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={
                                                            errors.paid_date
                                                                ? 'border-red-500'
                                                                : ''
                                                        }
                                                    />
                                                    {errors.paid_date && (
                                                        <p className="text-xs text-red-500">
                                                            {errors.paid_date}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="collection_receipt_number">
                                                        Collection Receipt
                                                        Number *
                                                    </Label>
                                                    <Input
                                                        id="collection_receipt_number"
                                                        type="text"
                                                        value={
                                                            data.collection_receipt_number
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'collection_receipt_number',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={
                                                            errors.collection_receipt_number
                                                                ? 'border-red-500'
                                                                : ''
                                                        }
                                                    />
                                                    {errors.collection_receipt_number && (
                                                        <p className="text-xs text-red-500">
                                                            {
                                                                errors.collection_receipt_number
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="branch">
                                                        Branch *
                                                    </Label>
                                                    <Select
                                                        value={data.branch_id}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setData(
                                                                'branch_id',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {branches.map(
                                                                (branch) => (
                                                                    <SelectItem
                                                                        key={
                                                                            branch.id
                                                                        }
                                                                        value={branch.id.toString()}
                                                                    >
                                                                        {
                                                                            branch.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>

                                                    {errors.branch_id && (
                                                        <p className="text-xs text-red-500">
                                                            {errors.branch_id}
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPaymentConfirmation(
                                                            true,
                                                        )
                                                    }
                                                    disabled={processing}
                                                    className="w-full"
                                                    size="lg"
                                                >
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Record{' '}
                                                    {formatCurrency(
                                                        Number(
                                                            data.amount_paid ||
                                                                0,
                                                        ),
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : transaction.is_completed ? (
                                <Card className="border-green-600">
                                    <CardContent className="pt-6 text-center">
                                        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
                                        <h3 className="mb-2 text-xl font-bold">
                                            All Paid!
                                        </h3>
                                        <p className="text-muted-foreground">
                                            This installment order has been
                                            completed.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <XCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                        <h3 className="mb-2 text-xl font-bold">
                                            No Payments Available
                                        </h3>
                                        <p className="text-muted-foreground">
                                            This order cannot accept payments.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            <InstallmentOrderRemarksSection
                                transactionId={transaction.id}
                                remarks={transaction.remarks}
                            />

                            {/* Complete Payment History */}
                            {paymentHistory && paymentHistory.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <TrendingUp className="h-4 w-4" />
                                            All Payment Transactions
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Complete payment transaction history
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                                            {paymentHistory
                                                .sort(
                                                    (a, b) =>
                                                        new Date(
                                                            b.paid_date,
                                                        ).getTime() -
                                                        new Date(
                                                            a.paid_date,
                                                        ).getTime(),
                                                )
                                                .map((history) => {
                                                    const payment =
                                                        transaction.installment_order_payments?.find(
                                                            (p) =>
                                                                p.id ===
                                                                history.payment_id,
                                                        );
                                                    return (
                                                        <div
                                                            key={history.id}
                                                            className="rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                                                        >
                                                            <div className="mb-2 flex items-start justify-between">
                                                                <div>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="mb-1 text-xs"
                                                                    >
                                                                        Installment
                                                                        #
                                                                        {
                                                                            payment?.installment_number
                                                                        }
                                                                    </Badge>
                                                                    <p className="text-lg font-bold text-green-600">
                                                                        {formatCurrency(
                                                                            history.amount,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right text-xs text-muted-foreground">
                                                                    {formatDate(
                                                                        history.paid_date,
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Separator className="my-2" />
                                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        Method:
                                                                    </span>
                                                                    <p className="font-medium capitalize">
                                                                        {
                                                                            history.payment_method
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        Recorded
                                                                        by:
                                                                    </span>
                                                                    <p className="font-medium">
                                                                        {
                                                                            history
                                                                                .user
                                                                                .full_name
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">
                                                                        CR No.:
                                                                    </span>
                                                                    <p className="font-medium">
                                                                        {
                                                                            history.collection_receipt_number
                                                                        }
                                                                    </p>
                                                                </div>
                                                                {history.reference_number && (
                                                                    <div className="col-span-2">
                                                                        <span className="text-muted-foreground">
                                                                            Reference:
                                                                        </span>
                                                                        <p className="font-medium">
                                                                            {
                                                                                history.reference_number
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                        <Separator className="my-3" />
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">
                                                    Total Transactions:
                                                </span>
                                                <span className="font-bold">
                                                    {paymentHistory.length}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">
                                                    Total Amount:
                                                </span>
                                                <span className="font-bold text-green-600">
                                                    {formatCurrency(
                                                        paymentHistory.reduce(
                                                            (sum, h) =>
                                                                sum +
                                                                Number(
                                                                    h.amount,
                                                                ),
                                                            0,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Confirmation Dialog */}
            <Dialog
                open={showPaymentConfirmation}
                onOpenChange={setShowPaymentConfirmation}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Please review the payment details before confirming.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Installment Number
                                </span>
                                <span className="font-bold">
                                    #{data.installment_number}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Payment Amount
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                    {formatCurrency(Number(data.amount_paid))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Payment Method
                                </span>
                                <span className="font-medium capitalize">
                                    {data.payment_method}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Payment Date
                                </span>
                                <span className="font-medium">
                                    {formatDate(data.paid_date)}
                                </span>
                            </div>
                            {data.reference_number && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Reference Number
                                    </span>
                                    <span className="font-medium">
                                        {data.reference_number}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Collection Receipt Number
                                </span>
                                <span className="font-medium">
                                    {data.collection_receipt_number ?? 'N/a'}
                                </span>
                            </div>
                        </div>
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                This action will record the payment and update
                                the installment status.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowPaymentConfirmation(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePaymentSubmit}
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Confirm Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Void Transaction Dialog */}
            <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Ban className="h-5 w-5" />
                            Void Transaction
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently void this installment order.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Warning:</strong> Voiding this
                                transaction will mark it as cancelled and
                                prevent any further payments.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label htmlFor="void_reason">
                                Reason for Voiding *
                            </Label>
                            <Textarea
                                id="void_reason"
                                placeholder="Please provide a reason for voiding this transaction..."
                                value={voidForm.data.reason_for_cancellation}
                                onChange={(e) =>
                                    voidForm.setData(
                                        'reason_for_cancellation',
                                        e.target.value,
                                    )
                                }
                                rows={4}
                                className={
                                    voidForm.errors.reason_for_cancellation
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {voidForm.errors.reason_for_cancellation && (
                                <p className="text-xs text-red-500">
                                    {voidForm.errors.reason_for_cancellation}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowVoidDialog(false)}
                            disabled={voidForm.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleVoidSubmit}
                            disabled={
                                voidForm.processing ||
                                !voidForm.data.reason_for_cancellation.trim()
                            }
                        >
                            {voidForm.processing
                                ? 'Processing...'
                                : 'Void Transaction'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reactivate Transaction Dialog */}
            <Dialog
                open={showReactivateDialog}
                onOpenChange={setShowReactivateDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-5 w-5" />
                            Reactive Installment Account
                        </DialogTitle>
                        <DialogDescription>
                            Mark this installment order as active again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Warning:</strong> This will mark the
                                account as active again.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label htmlFor="reactivateForm">
                                Reason for Reactivation *
                            </Label>
                            <Textarea
                                id="reactivateForm"
                                placeholder="Please provide a reason for marking as active (e.g., customer paid, etc.)..."
                                value={reactivateForm.data.reactivation_reason}
                                onChange={(e) =>
                                    reactivateForm.setData(
                                        'reactivation_reason',
                                        e.target.value,
                                    )
                                }
                                rows={4}
                                className={
                                    reactivateForm.errors.reactivation_reason
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {reactivateForm.errors.reactivation_reason && (
                                <p className="text-xs text-red-500">
                                    {reactivateForm.errors.reactivation_reason}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowReactivateDialog(false)}
                            disabled={reactivateForm.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReactivateSubmit}
                            disabled={
                                reactivateForm.processing ||
                                !reactivateForm.data.reactivation_reason.trim()
                            }
                        >
                            {reactivateForm.processing
                                ? 'Processing...'
                                : 'Reactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Default Transaction Dialog */}
            <Dialog
                open={showDefaultDialog}
                onOpenChange={setShowDefaultDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-5 w-5" />
                            Mark as Default
                        </DialogTitle>
                        <DialogDescription>
                            Mark this installment order as defaulted due to
                            non-payment or other issues.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Warning:</strong> This will mark the
                                account as defaulted. This change is permanent
                                and cannot be reverted.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label htmlFor="default_reason">
                                Reason for Default *
                            </Label>
                            <Textarea
                                id="default_reason"
                                placeholder="Please provide a reason for marking as default (e.g., consecutive missed payments, customer unreachable, etc.)..."
                                value={defaultForm.data.default_reason}
                                onChange={(e) =>
                                    defaultForm.setData(
                                        'default_reason',
                                        e.target.value,
                                    )
                                }
                                rows={4}
                                className={
                                    defaultForm.errors.default_reason
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {defaultForm.errors.default_reason && (
                                <p className="text-xs text-red-500">
                                    {defaultForm.errors.default_reason}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDefaultDialog(false)}
                            disabled={defaultForm.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDefaultSubmit}
                            disabled={
                                defaultForm.processing ||
                                !defaultForm.data.default_reason.trim()
                            }
                        >
                            {defaultForm.processing
                                ? 'Processing...'
                                : 'Mark as Default'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Accelerate Loan Dialog */}
            <Dialog
                open={showAccelerateDialog}
                onOpenChange={setAcceleratetDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CloudLightning className="h-5 w-5" />
                            Loan Acceleration
                        </DialogTitle>
                        <DialogDescription>
                            Accelerate the payment for this loan and give
                            discount.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Warning:</strong> This will mark the
                                account as accelerated. This change is permanent
                                and cannot be reverted.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label>
                                Discount Amount
                                <span className="text-red-500">*</span>{' '}
                            </Label>
                            <Input
                                step="0.01"
                                value={
                                    accelerationForm.data.acceleration_discount
                                }
                                onChange={(e) => {
                                    const discount = e.target.value
                                        ? Number(e.target.value)
                                        : 0;
                                    accelerationForm.setData(
                                        'acceleration_discount',
                                        discount,
                                    );
                                    const amountPaid = (
                                        Number(transaction.remaining_balance) -
                                        discount
                                    ).toFixed(2);
                                    accelerationForm.setData(
                                        'amount_paid',
                                        amountPaid,
                                    );
                                }}
                                placeholder="0.00"
                                type="number"
                            />
                            {accelerationForm.errors.acceleration_discount && (
                                <p className="text-xs text-red-500">
                                    {
                                        accelerationForm.errors
                                            .acceleration_discount
                                    }
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>
                                Amount Paid
                                <span className="text-red-500">*</span>{' '}
                            </Label>
                            <Input
                                step="0.01"
                                value={accelerationForm.data.amount_paid}
                                onChange={(e) =>
                                    accelerationForm.setData(
                                        'amount_paid',
                                        e.target.value,
                                    )
                                }
                                disabled
                                placeholder="0.00"
                                type="number"
                            />
                            {accelerationForm.errors.amount_paid && (
                                <p className="text-xs text-red-500">
                                    {accelerationForm.errors.amount_paid}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason_for_acceleration">
                                Reason for Acceleration *
                            </Label>
                            <Textarea
                                id="reason_for_acceleration"
                                placeholder="Please provide a reason for marking as accelerated (e.g., customer's choice, etc.)..."
                                value={
                                    accelerationForm.data
                                        .reason_for_acceleration
                                }
                                onChange={(e) =>
                                    accelerationForm.setData(
                                        'reason_for_acceleration',
                                        e.target.value,
                                    )
                                }
                                rows={4}
                                className={
                                    accelerationForm.errors
                                        .reason_for_acceleration
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {accelerationForm.errors
                                .reason_for_acceleration && (
                                <p className="text-xs text-red-500">
                                    {
                                        accelerationForm.errors
                                            .reason_for_acceleration
                                    }
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment_method">
                                Payment Method *
                            </Label>
                            <Select
                                value={accelerationForm.data.payment_method}
                                onValueChange={(value) =>
                                    accelerationForm.setData(
                                        'payment_method',
                                        value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="gcash">GCash</SelectItem>
                                    <SelectItem value="bank_transfer">
                                        Bank Transfer
                                    </SelectItem>
                                    <SelectItem value="credit_card">
                                        Credit Card
                                    </SelectItem>
                                    <SelectItem value="debit_card">
                                        Debit Card
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {accelerationForm.errors.payment_method && (
                                <p className="text-xs text-red-500">
                                    {accelerationForm.errors.payment_method}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference_number">
                                Reference Number
                            </Label>
                            <Input
                                id="reference_number"
                                type="text"
                                placeholder="Optional"
                                value={accelerationForm.data.reference_number}
                                onChange={(e) =>
                                    accelerationForm.setData(
                                        'reference_number',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paid_date">Payment Date *</Label>
                            <Input
                                id="paid_date"
                                type="date"
                                value={accelerationForm.data.paid_date}
                                onChange={(e) =>
                                    accelerationForm.setData(
                                        'paid_date',
                                        e.target.value,
                                    )
                                }
                                className={
                                    accelerationForm.errors.paid_date
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            {accelerationForm.errors.paid_date && (
                                <p className="text-xs text-red-500">
                                    {accelerationForm.errors.paid_date}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDefaultDialog(false)}
                            disabled={defaultForm.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-500"
                            onClick={handleAccelerationSubmit}
                            disabled={
                                accelerationForm.processing ||
                                !accelerationForm.data.reason_for_acceleration.trim() ||
                                !accelerationForm.data.amount_paid ||
                                !accelerationForm.data.acceleration_discount
                            }
                        >
                            {defaultForm.processing
                                ? 'Processing...'
                                : 'Accelerate Loan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rebate Dialog */}
            <Dialog open={showRebateDialog} onOpenChange={setShowRebateDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Percent className="h-5 w-5 text-blue-600" />
                            Add Rebate
                        </DialogTitle>
                        <DialogDescription>
                            Add a rebate discount to this installment payment
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4 py-4">
                            {/* Payment Info Summary */}
                            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Installment
                                    </span>
                                    <span className="font-bold">
                                        #{selectedPayment.installment_number}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Amount Due
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            Number(selectedPayment.amount_due),
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Amount Paid
                                    </span>
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(
                                            Number(
                                                selectedPayment.amount_paid ||
                                                    0,
                                            ),
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Current Rebate
                                    </span>
                                    <span className="font-medium text-blue-600">
                                        {selectedPayment.rebate_amount > 0
                                            ? formatCurrency(
                                                  Number(
                                                      selectedPayment.rebate_amount,
                                                  ),
                                              )
                                            : '-'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">
                                        Remaining Balance
                                    </span>
                                    <span className="text-lg font-bold text-orange-600">
                                        {formatCurrency(
                                            Number(selectedPayment.amount_due) -
                                                Number(
                                                    selectedPayment.amount_paid ||
                                                        0,
                                                ),
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Rebate Form Fields */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rebate_amount">
                                        Rebate Amount *
                                    </Label>
                                    <Input
                                        id="rebate_amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={rebateForm.data.rebate_amount}
                                        onChange={(e) =>
                                            rebateForm.setData(
                                                'rebate_amount',
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            rebateForm.errors.rebate_amount
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {rebateForm.errors.rebate_amount && (
                                        <p className="text-xs text-red-500">
                                            {rebateForm.errors.rebate_amount}
                                        </p>
                                    )}
                                    {rebateForm.data.rebate_amount &&
                                        Number(rebateForm.data.rebate_amount) >
                                            0 && (
                                            <p className="text-xs text-muted-foreground">
                                                New balance after rebate:{' '}
                                                {formatCurrency(
                                                    Number(
                                                        selectedPayment.amount_due,
                                                    ) -
                                                        Number(
                                                            selectedPayment.amount_paid ||
                                                                0,
                                                        ) -
                                                        Number(
                                                            rebateForm.data
                                                                .rebate_amount,
                                                        ),
                                                )}
                                            </p>
                                        )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rebate_reason">
                                        Reason for Rebate *
                                    </Label>
                                    <Textarea
                                        id="rebate_reason"
                                        placeholder="e.g., Early payment discount, promotional offer, customer loyalty, etc."
                                        value={rebateForm.data.rebate_reason}
                                        onChange={(e) =>
                                            rebateForm.setData(
                                                'rebate_reason',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        className={
                                            rebateForm.errors.rebate_reason
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {rebateForm.errors.rebate_reason && (
                                        <p className="text-xs text-red-500">
                                            {rebateForm.errors.rebate_reason}
                                        </p>
                                    )}
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        This rebate will be deducted from the
                                        remaining balance of this installment.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRebateDialog(false);
                                setSelectedPayment(null);
                                rebateForm.reset();
                            }}
                            disabled={rebateForm.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRebateSubmit}
                            disabled={
                                rebateForm.processing ||
                                !rebateForm.data.rebate_amount ||
                                !rebateForm.data.rebate_reason.trim() ||
                                Number(rebateForm.data.rebate_amount) <= 0
                            }
                        >
                            {rebateForm.processing
                                ? 'Processing...'
                                : 'Add Rebate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}