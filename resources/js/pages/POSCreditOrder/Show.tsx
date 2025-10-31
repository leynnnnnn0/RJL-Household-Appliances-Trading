import React, { useState } from 'react';
import { InstallmentOrderWithRelations } from "@/types";
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
  AlertCircle
} from 'lucide-react';
import ModuleHeading from '@/components/cards/module-heading';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Head } from '@inertiajs/react';

interface PageProps {
    transaction: InstallmentOrderWithRelations
}

export default function Show({transaction} : PageProps){
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        transaction_date: new Date().toISOString().split('T')[0]
    });

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

    const totalPaid = transaction.installment_order_paymets?.reduce((sum, payment) => {
        return payment.status === 'completed' ? sum + Number(payment.amount) : sum;
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


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission with Inertia
        console.log('Payment form data:', paymentForm);
    };

    return (
        <AppLayout>
            <Head title='Installment Order Details'/>

             <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <ModuleHeading title={`Order #${transaction.order_number}`} description='Installment order details and payment history'/>


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
                                    +{transaction.lcp_markup_rate}% markup {transaction.lcp_additional_charge > 0 ? `+ ${transaction.lcp_additional_charge} charge` : ''}
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
                                <p className="text-sm text-muted-foreground">Total PNV</p>
                                <p className="text-2xl font-bold">{formatCurrency(final_pnv)}</p>
                                <p className="text-xs text-muted-foreground">
                                    +{transaction.promisory_note_value_interest}% markup {pnvAdditionalCharge > 0 ? `+ ${pnvAdditionalCharge} charge` : ''}
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
                            <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all" 
                                    style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Payment History
                        </CardTitle>
                        <CardDescription>
                            All payments made towards this installment order
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transaction.installment_order_paymets && transaction.installment_order_paymets.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment Method</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transaction.installment_order_paymets.map((payment, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="py-3 px-4 text-sm">{formatDate(payment.transaction_date)}</td>
                                                <td className="py-3 px-4 text-sm font-medium">{formatCurrency(payment.amount)}</td>
                                                <td className="py-3 px-4 text-sm capitalize">{payment.payment_method}</td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {payment.reference_number || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                                        {payment.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No payments recorded yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Add Payment Form */}
                {!transaction.is_void && !transaction.is_completed && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Add Payment
                            </CardTitle>
                            <CardDescription>
                                Record a new payment for this installment order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Payment Amount *</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={paymentForm.amount}
                                            onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">Payment Method *</Label>
                                        <Select 
                                            value={paymentForm.payment_method}
                                            onValueChange={(value) => setPaymentForm({...paymentForm, payment_method: value})}
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
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reference_number">Reference Number</Label>
                                        <Input
                                            id="reference_number"
                                            type="text"
                                            placeholder="Optional"
                                            value={paymentForm.reference_number}
                                            onChange={(e) => setPaymentForm({...paymentForm, reference_number: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="transaction_date">Transaction Date *</Label>
                                        <Input
                                            id="transaction_date"
                                            type="date"
                                            value={paymentForm.transaction_date}
                                            onChange={(e) => setPaymentForm({...paymentForm, transaction_date: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline">Cancel</Button>
                                    <Button type="button" onClick={handleSubmit}>
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Record Payment
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}