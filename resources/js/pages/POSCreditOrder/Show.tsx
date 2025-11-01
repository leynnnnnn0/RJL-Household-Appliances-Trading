import React, { useState, useEffect } from 'react';
import { InstallmentOrderWithRelations, InstallmentOrderPayment, InstallmentOrderPaymentHistory } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  ArrowRight
} from 'lucide-react';
import ModuleHeading from '@/components/cards/module-heading';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface PageProps {
    transaction: InstallmentOrderWithRelations,
    paymentHistory: InstallmentOrderPaymentHistory[]
}

export default function Show({transaction, paymentHistory} : PageProps){
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
        paid_date: new Date().toISOString().split('T')[0]
    });

    // Update form when nextPayment changes
    useEffect(() => {
        if (nextPayment) {
            const alreadyPaid = Number(nextPayment.amount_paid || 0);
            const remainingAmount = Number(nextPayment.amount_due) - alreadyPaid;
            
            setData({
                installment_order_payment_id: nextPayment.id.toString(),
                installment_order_id: transaction.id,
                installment_number: nextPayment.installment_number,
                amount_due: Number(nextPayment.amount_due),
                amount_paid: remainingAmount.toString(),
                payment_method: 'cash',
                reference_number: '',
                paid_date: new Date().toISOString().split('T')[0]
            });
        }
    }, [nextPayment?.id]);

    const totalPaid = transaction.installment_order_payments?.reduce((sum, payment) => {
        return (payment.status === 'completed' || payment.status === 'paid') 
            ? sum + Number(payment.amount_paid || 0) 
            : sum;
    }, 0) || 0;

    const lcp = transaction.loan_contract_price;
    const down = transaction.down_payment;
    const pnv = lcp - down;
    const pnvAdditionalCharge = Number(transaction.promisory_note_value_interest_additional_charge);
    const final_pnv = pnv * transaction.promisory_note_value_interest + pnvAdditionalCharge;

    const totalToPay = final_pnv;
    const remainingBalance = totalToPay - totalPaid;
    let paymentProgress = 0;
    if(totalPaid > 0 && final_pnv > 0){
        paymentProgress = (totalPaid / final_pnv) * 100
    }

    const pendingPayments = transaction.installment_order_payments?.filter(p => 
        p.status === 'pending' || p.status === 'overdue' || p.status === 'partial'
    ).length || 0;

    const overduePayments = transaction.installment_order_payments?.filter(p => 
        isOverdue(p.due_date, p.status)
    ).length || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(`/pos-installment-orders/record-payment`, {
            onSuccess: () => {
                reset('amount_paid', 'reference_number');
                toast.success("Payment Recorded");
            },
            onError: (e) => {
                toast.error("An error occured");
                console.log(e);
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
            <Head title='Installment Order Details'/>

             <div className="max-w-[1800px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <ModuleHeading 
                                title={`Order #${transaction.order_number}`} 
                                description='Installment order details and payment schedule'
                            />
                            <div className="flex gap-2">
                                {transaction.is_void && (
                                    <Badge variant="destructive" className="h-8">
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Voided
                                    </Badge>
                                )}
                                {transaction.is_completed == true && (
                                    <Badge className="h-8 bg-green-600">
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Completed
                                    </Badge>
                                )}
                                {transaction.is_defaulted == true && (
                                    <Badge variant="destructive" className="h-8">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        Defaulted
                                    </Badge>
                                )}
                                {!transaction.is_completed && !transaction.is_void && !transaction.is_defaulted && (
                                    <Badge variant="secondary" className="h-8">
                                        Active
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* // Status Alerts
                        {transaction.is_void && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This order was voided on {formatDate(transaction.void_date || '')}. 
                                    Reason: {transaction.reason_for_cancellation}
                                </AlertDescription>
                            </Alert>
                        )}

                        {transaction.is_defaulted && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This order is in default status. Reason: {transaction.default_reason}
                                </AlertDescription>
                            </Alert>
                        )} */}

                        {overduePayments > 0 && !transaction.is_void && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This account has {overduePayments} overdue payment{overduePayments > 1 ? 's' : ''}. Please settle immediately.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Quick Stats */}
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                                        <p className="text-3xl font-bold mt-2">{transaction.installment_order_payments?.length || 0}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Paid</p>
                                        <p className="text-3xl font-bold mt-2 text-green-600">
                                            {transaction.installment_order_payments?.filter(p => p.status === 'paid' || p.status === 'completed').length || 0}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                        <p className="text-3xl font-bold mt-2 text-orange-600">{pendingPayments}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                                        <p className="text-3xl font-bold mt-2 text-red-600">{overduePayments}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{transaction.customer?.first_name} {transaction.customer?.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-medium">{transaction.customer?.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone Number</p>
                                        <p className="font-medium">{transaction.customer?.phone_number}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transaction Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Transaction Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Transaction Date</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(transaction.transaction_date)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Location</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {transaction.location?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Processed By</span>
                                        <span className="font-medium">{transaction.user?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Terms</span>
                                        <span className="font-medium">{transaction.number_of_terms} months</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Financial Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Financial Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Loan Contract Price</p>
                                        <p className="text-2xl font-bold">{formatCurrency(transaction.loan_contract_price)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            +{transaction.lcp_markup_rate}% markup
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Down Payment</p>
                                        <p className="text-2xl font-bold">{formatCurrency(transaction.down_payment)}</p>
                                        {transaction.payment_method && (
                                            <p className="text-xs text-muted-foreground capitalize">
                                                via {transaction.payment_method}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Total Amount Due</p>
                                        <p className="text-2xl font-bold">{formatCurrency(final_pnv)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {transaction.number_of_terms} monthly payments
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Remaining Balance</p>
                                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(remainingBalance)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {paymentProgress.toFixed(1)}% paid
                                        </p>
                                    </div>
                                </div>
                                
                                <Separator className="my-4" />
                                
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Payment Progress</span>
                                        <span className="font-medium">{formatCurrency(totalPaid)} of {formatCurrency(final_pnv)}</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-3">
                                        <div 
                                            className="bg-primary h-3 rounded-full transition-all" 
                                            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Payment Schedule
                                </CardTitle>
                                <CardDescription>
                                    Complete payment history and schedule
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {transaction.installment_order_payments && transaction.installment_order_payments.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">#</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Due Date</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount Due</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount Paid</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Remaining</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment Date</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transaction.installment_order_payments
                                                    .sort((a, b) => a.installment_number - b.installment_number)
                                                    .map((payment) => {
                                                        const isPaid = payment.status === 'paid' || payment.status === 'completed';
                                                        const isNext = nextPayment?.id === payment.id;
                                                        const amountPaid = Number(payment.amount_paid || 0);
                                                        const amountDue = Number(payment.amount_due);
                                                        const remaining = amountDue - amountPaid;
                                                        
                                                        return (
                                                            <tr 
                                                                key={payment.id} 
                                                                className={`border-b transition-colors ${
                                                                    isNext ? 'bg-primary/10' : ''
                                                                }`}
                                                            >
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-2">
                                                                        {isPaid && <Check className="w-4 h-4 text-green-600" />}
                                                                        {isNext && <ArrowRight className="w-4 h-4 text-primary" />}
                                                                        <span className="font-medium">#{payment.installment_number}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 text-sm">
                                                                    {formatDate(payment.due_date)}
                                                                </td>
                                                                <td className="py-3 px-4 text-sm font-medium">
                                                                    {formatCurrency(amountDue)}
                                                                </td>
                                                                <td className="py-3 px-4 text-sm font-medium text-green-600">
                                                                    {amountPaid > 0 ? formatCurrency(amountPaid) : '-'}
                                                                </td>
                                                                <td className="py-3 px-4 text-sm font-medium text-orange-600">
                                                                    {remaining > 0 ? formatCurrency(remaining) : '-'}
                                                                </td>
                                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                                    {payment.paid_date ? formatDate(payment.paid_date) : '-'}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    {getPaymentStatusBadge(payment)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No payment schedule generated</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Form - Right Side (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            {!transaction.is_void && !transaction.is_completed && nextPayment ? (
                                <>
                                    <Card className="border-primary shadow-lg">
                                        <CardHeader className="bg-primary/5">
                                            <CardTitle className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5" />
                                                Record Payment
                                            </CardTitle>
                                            <CardDescription>
                                                Next payment in sequence
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {/* Next Payment Info */}
                                            <div className="space-y-4 mb-6">
                                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">Installment</span>
                                                        <span className="font-bold text-lg">#{nextPayment.installment_number}</span>
                                                    </div>
                                                    <Separator />
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Due Date</span>
                                                        <span className="font-medium text-sm">{formatDate(nextPayment.due_date)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Amount Due</span>
                                                        <span className="font-medium text-sm">{formatCurrency(nextPayment.amount_due)}</span>
                                                    </div>
                                                    {Number(nextPayment.amount_paid || 0) > 0 && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-muted-foreground">Already Paid</span>
                                                                <span className="font-medium text-sm text-green-600">{formatCurrency(Number(nextPayment.amount_paid))}</span>
                                                            </div>
                                                            <Separator />
                                                        </>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium">Remaining</span>
                                                        <span className="font-bold text-lg text-primary">{formatCurrency(nextPaymentRemaining)}</span>
                                                    </div>
                                                </div>

                                                {isOverdue(nextPayment.due_date, nextPayment.status) && (
                                                    <Alert variant="destructive">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription className="text-xs">
                                                            This payment is overdue!
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>

                                            <Separator className="my-4" />

                                            {/* Payment Form */}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="amount_paid">Payment Amount *</Label>
                                                    <Input
                                                        id="amount_paid"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={data.amount_paid}
                                                        onChange={(e) => setData('amount_paid', e.target.value)}
                                                        max={nextPaymentRemaining}
                                                        className={errors.amount_paid ? 'border-red-500' : ''}
                                                    />
                                                    {errors.amount_paid && (
                                                        <p className="text-xs text-red-500">{errors.amount_paid}</p>
                                                    )}
                                                    {data.amount_paid && Number(data.amount_paid) > nextPaymentRemaining && (
                                                        <p className="text-xs text-red-500">Amount exceeds remaining balance</p>
                                                    )}
                                                    {data.amount_paid && Number(data.amount_paid) < nextPaymentRemaining && Number(data.amount_paid) > 0 && (
                                                        <Alert className="mt-2">
                                                            <AlertDescription className="text-xs">
                                                                Partial payment: {formatCurrency(nextPaymentRemaining - Number(data.amount_paid))} will remain
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="payment_method">Payment Method *</Label>
                                                    <Select 
                                                        value={data.payment_method}
                                                        onValueChange={(value) => setData('payment_method', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cash">Cash</SelectItem>
                                                            <SelectItem value="gcash">GCash</SelectItem>
                                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                            <SelectItem value="credit_card">Credit Card</SelectItem>
                                                            <SelectItem value="debit_card">Debit Card</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.payment_method && (
                                                        <p className="text-xs text-red-500">{errors.payment_method}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="reference_number">Reference Number</Label>
                                                    <Input
                                                        id="reference_number"
                                                        type="text"
                                                        placeholder="Optional"
                                                        value={data.reference_number}
                                                        onChange={(e) => setData('reference_number', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="paid_date">Payment Date *</Label>
                                                    <Input
                                                        id="paid_date"
                                                        type="date"
                                                        value={data.paid_date}
                                                        onChange={(e) => setData('paid_date', e.target.value)}
                                                        className={errors.paid_date ? 'border-red-500' : ''}
                                                    />
                                                    {errors.paid_date && (
                                                        <p className="text-xs text-red-500">{errors.paid_date}</p>
                                                    )}
                                                </div>

                                                <Button 
                                                    type="button" 
                                                    onClick={handleSubmit}
                                                    disabled={processing || !isValidAmount()}
                                                    className="w-full"
                                                    size="lg"
                                                >
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    {processing ? 'Processing...' : `Record ${formatCurrency(Number(data.amount_paid || 0))}`}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                  
                                </>
                            
                            ) : transaction.is_completed ? (
                                <Card className="border-green-600">
                                    <CardContent className="pt-6 text-center">
                                        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold mb-2">All Paid!</h3>
                                        <p className="text-muted-foreground">This installment order has been completed.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-bold mb-2">No Payments Available</h3>
                                        <p className="text-muted-foreground">This order cannot accept payments.</p>
                                    </CardContent>
                                </Card>
                            )}

                              {/* Complete Payment History */}
                                    {paymentHistory && paymentHistory.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4" />
                                                    All Payment Transactions
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Complete payment transaction history
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                                    {paymentHistory
                                                        .sort((a, b) => new Date(b.paid_date).getTime() - new Date(a.paid_date).getTime())
                                                        .map((history) => {
                                                            const payment = transaction.installment_order_payments?.find(
                                                                p => p.id === history.payment_id
                                                            );
                                                            return (
                                                                <div 
                                                                    key={history.id} 
                                                                    className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                                                                >
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div>
                                                                            <Badge variant="outline" className="text-xs mb-1">
                                                                                Installment #{payment?.installment_number}
                                                                            </Badge>
                                                                            <p className="font-bold text-lg text-green-600">
                                                                                {formatCurrency(history.amount)}
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right text-xs text-muted-foreground">
                                                                            {formatDate(history.paid_date)}
                                                                        </div>
                                                                    </div>
                                                                    <Separator className="my-2" />
                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                        <div>
                                                                            <span className="text-muted-foreground">Method:</span>
                                                                            <p className="font-medium capitalize">{history.payment_method}</p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted-foreground">Recorded by:</span>
                                                                            <p className="font-medium">{history.user.full_name}</p>
                                                                        </div>
                                                                        {history.reference_number && (
                                                                            <div className="col-span-2">
                                                                                <span className="text-muted-foreground">Reference:</span>
                                                                                <p className="font-medium">{history.reference_number}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                                <Separator className="my-3" />
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-medium">Total Transactions:</span>
                                                        <span className="font-bold">{paymentHistory.length}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-medium">Total Amount:</span>
                                                        <span className="font-bold text-green-600">
                                                            {formatCurrency(
                                                                paymentHistory.reduce((sum, h) => sum + Number(h.amount), 0)
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
        </AppLayout>
    );
}