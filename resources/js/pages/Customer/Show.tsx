import { useState } from 'react';
import ModuleHeading from '@/components/cards/module-heading';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    User, 
    MapPin, 
    Phone, 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    Package, 
    CreditCard,
    DollarSign,
    FileText,
    AlertCircle,
    Home,
    Briefcase,
    ShoppingCart,
    TrendingUp,
    Clock,
    Ban,
    Download,
    Eye,
    File
} from 'lucide-react';
import { CustomerWithRelation } from '@/types';
import { Button } from '@/components/ui/button';

interface AdditionalDocument {
    id: number;
    customer_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    created_at: string;
}

interface Props {
    customer: CustomerWithRelation & {
        additional_documents?: AdditionalDocument[];
    };
}

export default function Show({ customer }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('image')) return '🖼️';
        return '📎';
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-black text-white';
            case 'pending':
                return 'bg-gray-200 text-gray-800';
            case 'overdue':
                return 'bg-red-600 text-white';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const totalOrders = customer.orders?.length || 0;
    const totalInstallmentOrders = customer.installment_orders?.length || 0;
    const activeOrders = customer.orders?.filter(o => !o.is_void).length || 0;
    const activeInstallments = customer.installment_orders?.filter(i => !i.is_voided && !i.is_completed && !i.is_defaulted).length || 0;
    const totalRevenue = (customer.orders?.filter(o => !o.is_void).reduce((sum, order) => sum + order.total_price, 0) || 0) +
                        (customer.installment_orders?.filter(i => !i.is_voided).reduce((sum, order) => sum + order.total_amount_paid, 0) || 0);

    return (
        <AppLayout>
            <Head title={`${customer.first_name} ${customer.last_name} - Customer Details`} />

            <div className="space-y-4">
                <ModuleHeading
                    title="Customer Details"
                    description="Complete information about the customer"
                />

                {/* Compact Profile Header */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-black">
                                <AvatarFallback className="bg-black text-white text-xl font-bold">
                                    {getInitials(customer.first_name, customer.last_name)}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl font-bold text-gray-900 truncate">
                                    {customer.first_name} {customer.last_name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <User className="h-3.5 w-3.5" />
                                        ID #{customer.id}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" />
                                        {customer.phone_number}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {customer.address?.toUpperCase()} {customer.city?.toUpperCase()}, { customer.province?.toUpperCase()}, {customer.country?.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {/* Stats removed as per original */}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs Section */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-100 h-9">
                        <TabsTrigger value="overview" className="text-sm data-[state=active]:bg-black data-[state=active]:text-white">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="text-sm data-[state=active]:bg-black data-[state=active]:text-white">
                            Orders ({totalOrders})
                        </TabsTrigger>
                        <TabsTrigger value="installments" className="text-sm data-[state=active]:bg-black data-[state=active]:text-white">
                            Installments ({totalInstallmentOrders})
                        </TabsTrigger>
                        <TabsTrigger value="investigation" className="text-sm data-[state=active]:bg-black data-[state=active]:text-white">
                            Investigation
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="text-sm data-[state=active]:bg-black data-[state=active]:text-white">
                            Documents ({customer.additional_documents?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 mt-4">
                        <div className="grid grid-cols-3 gap-4">
                            {/* Reference Information */}
                            <Card className="col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Reference
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {customer.customer_reference ? (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-500">Name</p>
                                                <p className="font-semibold">{customer.customer_reference.full_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="font-semibold">{customer.customer_reference.phone_number}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">No customer_reference provided</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Investigation Summary */}
                            <Card className="col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Investigation Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {customer.investigation_detail ? (
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Employment</p>
                                                <Badge variant={customer.investigation_detail.is_employment_verified ? "default" : "secondary"}
                                                       className={customer.investigation_detail.is_employment_verified ? "bg-black text-xs" : "text-xs"}>
                                                    {customer.investigation_detail.is_employment_verified ? (
                                                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</>
                                                    ) : (
                                                        <><XCircle className="h-3 w-3 mr-1" /> Not Verified</>
                                                    )}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Visit Date</p>
                                                <p className="font-semibold flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(customer.investigation_detail.home_visit_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                                                <p className="font-semibold">#{customer.investigation_detail.employee_id}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No investigation data</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="mt-4">
                        <div>
                            <CardContent className="p-0">
                                {customer.orders && customer.orders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="text-left p-2 font-semibold text-gray-700">Order #</th>
                                                    <th className="text-left p-2 font-semibold text-gray-700">Date</th>
                                                    <th className="text-left p-2 font-semibold text-gray-700">Items</th>
                                                    <th className="text-left p-2 font-semibold text-gray-700">Payment</th>
                                                    <th className="text-left p-2 font-semibold text-gray-700">Status</th>
                                                    <th className="text-right p-2 font-semibold text-gray-700">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customer.orders.map((order) => (
                                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-2 font-medium">
                                                            <Link href={`/pos-cash-orders/${order.order_number}`} className='underline'>{order.order_number}</Link>
                                                        </td>
                                                        <td className="p-2 text-gray-600">{formatDate(order.transaction_date)}</td>
                                                        <td className="p-2">{order.order_items?.length || 0}</td>
                                                        
                                                        <td className="p-2">
                                                            <Badge variant="outline" className="capitalize text-xs">
                                                                {order.payment_method}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-2">
                                                            {order.is_void ? (
                                                                <Badge variant="destructive" className="bg-gray-800 text-xs">
                                                                    <Ban className="h-3 w-3 mr-1" /> Voided
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-black text-xs">
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="p-2 text-right font-bold">
                                                            {formatCurrency(order.total_price)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">No orders found</p>
                                    </div>
                                )}
                            </CardContent>
                        </div>
                    </TabsContent>

                    {/* Installments Tab */}
                    <TabsContent value="installments" className="space-y-4 mt-4">
                        {customer.installment_orders && customer.installment_orders.length > 0 ? (
                            customer.installment_orders.map((installment) => (
                                <Card key={installment.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base">
                                                    <Link className='underline' href={`/pos-installment-orders/${installment.order_number}`}>
                                                    {installment.order_number}</Link>
                                                </CardTitle>
                                                {installment.is_completed == true && (
                                                    <Badge className="bg-green-600 text-xs">Completed</Badge>
                                                )}
                                                {installment.is_voided == true && (
                                                    <Badge variant="destructive" className="bg-gray-800 text-xs">Voided</Badge>
                                                )}
                                                {installment.is_defaulted == true && (
                                                    <Badge variant="destructive" className="text-xs">Defaulted</Badge>
                                                )}
                                                {!installment.is_completed && !installment.is_voided && !installment.is_defaulted && (
                                                    <Badge className="bg-blue-600 text-xs">Active</Badge>
                                                )}
                                            </div>
                                            {!installment.is_voided && (
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Balance</p>
                                                    <p className="text-xl font-bold">{formatCurrency(installment.remaining_balance)}</p>
                                                </div>
                                            )}
                                        </div>
                                        <CardDescription className="text-xs">
                                            {formatDate(installment.transaction_date)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-5 gap-3 text-sm">
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">Contract</p>
                                                <p className="font-bold text-sm">{formatCurrency(installment.loan_contract_price)}</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">Down Payment</p>
                                                <p className="font-bold text-sm">{formatCurrency(installment.down_payment)}</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">Terms</p>
                                                <p className="font-bold text-sm">{installment.number_of_terms} months</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-500">Paid</p>
                                                <p className="font-bold text-sm text-green-600">{formatCurrency(installment.total_amount_paid)}</p>
                                            </div>
                                            <div className="bg-black text-white p-2 rounded">
                                                <p className="text-xs opacity-80">Balance</p>
                                                <p className="font-bold text-sm">{formatCurrency(installment.remaining_balance)}</p>
                                            </div>
                                        </div>

                                        {installment.installment_order_payments && installment.installment_order_payments.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Payments ({installment.installment_order_payments.length})
                                                </h4>
                                                <div className="space-y-1.5">
                                                    {installment.installment_order_payments.map((payment) => (
                                                        <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm hover:bg-gray-100">
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-black text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                                                                    {payment.installment_number}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-xs">Installment #{payment.installment_number}</p>
                                                                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                        <Clock className="h-2.5 w-2.5" />
                                                                        Due: {formatDate(payment.due_date)}
                                                                        {payment.paid_date && ` • Paid: ${formatDate(payment.paid_date)}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-right">
                                                                    <p className="font-bold text-xs">{formatCurrency(payment.amount_due)}</p>
                                                                    {payment.amount_paid > 0 && payment.amount_paid !== payment.amount_due && (
                                                                        <p className="text-[10px] text-green-600">
                                                                            Paid: {formatCurrency(payment.amount_paid)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <Badge className={`${getPaymentStatusColor(payment.status)} text-xs h-5`}>
                                                                    {payment.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <CreditCard className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">No installment orders found</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Investigation Tab */}
                    <TabsContent value="investigation" className="mt-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    Investigation Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {customer.investigation_detail ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-gray-50 p-3 rounded">
                                                <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                                                <p className="text-lg font-bold">#{customer.investigation_detail.employee_id}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded">
                                                <p className="text-xs text-gray-500 mb-1">Home Visit</p>
                                                <p className="text-sm font-semibold flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatDate(customer.investigation_detail.home_visit_date)}
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded ${customer.investigation_detail.is_employment_verified ? 'bg-black text-white' : 'bg-gray-100'}`}>
                                                <p className="text-xs mb-1 opacity-80">Employment Status</p>
                                                <p className="text-sm font-bold flex items-center gap-1">
                                                    {customer.investigation_detail.is_employment_verified ? (
                                                        <><CheckCircle2 className="h-4 w-4" /> Verified</>
                                                    ) : (
                                                        <><XCircle className="h-4 w-4" /> Not Verified</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold mb-2">Investigation Notes</p>
                                            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm">
                                                <p className="text-gray-700 whitespace-pre-wrap">
                                                    {customer.investigation_detail.investigation_notes || 'No investigation notes available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <AlertCircle className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">No investigation details available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="mt-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Additional Documents
                                </CardTitle>
                                <CardDescription>
                                    Supporting documents uploaded for this customer
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {customer.additional_documents && customer.additional_documents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {customer.additional_documents.map((doc) => (
                                            <div 
                                                key={doc.id} 
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="text-2xl">
                                                        {getFileIcon(doc.mime_type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {doc.file_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                            <span>{formatFileSize(doc.file_size)}</span>
                                                            <span>•</span>
                                                            <span>{formatDate(doc.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        asChild
                                                        className="h-8"
                                                    >
                                                        <a 
                                                            href={`/storage/${doc.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            View
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        asChild
                                                        className="h-8"
                                                    >
                                                        <a 
                                                            href={`/storage/${doc.file_path}`}
                                                            download={doc.file_name}
                                                        >
                                                            <Download className="h-3.5 w-3.5 mr-1" />
                                                            Download
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <File className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm text-gray-500 font-medium">No documents uploaded</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Documents will appear here once uploaded
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}