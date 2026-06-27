import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { CustomerWithRelation } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Ban,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    Eye,
    File,
    FileText,
    Home,
    MapPin,
    Package,
    Phone,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

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
    backUrl?: string | null;
    customer: CustomerWithRelation & {
        additional_documents?: AdditionalDocument[];
    };
}

export default function Show({ backUrl, customer }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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
    const activeOrders = customer.orders?.filter((o) => !o.is_void).length || 0;
    const activeInstallments =
        customer.installment_orders?.filter(
            (i) => !i.is_voided && !i.is_completed && !i.is_defaulted,
        ).length || 0;
    const totalRevenue =
        (customer.orders
            ?.filter((o) => !o.is_void)
            .reduce((sum, order) => sum + order.total_price, 0) || 0) +
        (customer.installment_orders
            ?.filter((i) => !i.is_voided)
            .reduce((sum, order) => sum + order.total_amount_paid, 0) || 0);

    return (
        <AppLayout>
            <Head
                title={`${customer.first_name} ${customer.last_name} - Customer Details`}
            />

            <div className="space-y-4">
                <ModuleHeading
                    title="Customer Details"
                    description="Complete information about the customer"
                >
                    <BackButton backUrl={backUrl} />
                </ModuleHeading>

                {/* Compact Profile Header */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Avatar className="h-16 w-16 border-2 border-black">
                                <AvatarFallback className="bg-black text-xl font-bold text-white">
                                    {getInitials(
                                        customer.first_name,
                                        customer.last_name,
                                    )}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <h2 className="truncate text-2xl font-bold text-gray-900">
                                    {customer.first_name} {customer.last_name}
                                </h2>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm break-words text-gray-600">
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
                                        {customer.address?.toUpperCase()}{' '}
                                        {customer.city?.toUpperCase()},{' '}
                                        {customer.province?.toUpperCase()},{' '}
                                        {customer.country?.toUpperCase()}
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
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
                        <TabsTrigger
                            value="overview"
                            className="min-h-10 min-w-max flex-none px-4 text-xs focus-visible:ring-0 focus-visible:outline-none data-[state=active]:bg-background sm:text-sm lg:min-w-0 lg:flex-1"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="orders"
                            className="min-h-10 min-w-max flex-none px-4 text-xs focus-visible:ring-0 focus-visible:outline-none data-[state=active]:bg-background sm:text-sm lg:min-w-0 lg:flex-1"
                        >
                            Orders ({totalOrders})
                        </TabsTrigger>
                        <TabsTrigger
                            value="installments"
                            className="min-h-10 min-w-max flex-none px-4 text-xs focus-visible:ring-0 focus-visible:outline-none data-[state=active]:bg-background sm:text-sm lg:min-w-0 lg:flex-1"
                        >
                            Installments ({totalInstallmentOrders})
                        </TabsTrigger>
                        <TabsTrigger
                            value="investigation"
                            className="min-h-10 min-w-max flex-none px-4 text-xs focus-visible:ring-0 focus-visible:outline-none data-[state=active]:bg-background sm:text-sm lg:min-w-0 lg:flex-1"
                        >
                            Investigation
                        </TabsTrigger>
                        <TabsTrigger
                            value="documents"
                            className="min-h-10 min-w-max flex-none px-4 text-xs focus-visible:ring-0 focus-visible:outline-none data-[state=active]:bg-background sm:text-sm lg:min-w-0 lg:flex-1"
                        >
                            Documents (
                            {customer.additional_documents?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {/* Reference Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-4 w-4" />
                                        Reference
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {customer.customer_reference ? (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Name
                                                </p>
                                                <p className="font-semibold">
                                                    {
                                                        customer
                                                            .customer_reference
                                                            .full_name
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Phone
                                                </p>
                                                <p className="font-semibold">
                                                    {
                                                        customer
                                                            .customer_reference
                                                            .phone_number
                                                    }
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">
                                            No customer_reference provided
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Investigation Summary */}
                            <Card className="lg:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Briefcase className="h-4 w-4" />
                                        Investigation Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {customer.investigation_detail ? (
                                        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500">
                                                    Employment
                                                </p>
                                                <Badge
                                                    variant={
                                                        customer
                                                            .investigation_detail
                                                            .is_employment_verified
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className={
                                                        customer
                                                            .investigation_detail
                                                            .is_employment_verified
                                                            ? 'bg-black text-xs'
                                                            : 'text-xs'
                                                    }
                                                >
                                                    {customer
                                                        .investigation_detail
                                                        .is_employment_verified ? (
                                                        <>
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                                                            Verified
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="mr-1 h-3 w-3" />{' '}
                                                            Not Verified
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500">
                                                    Visit Date
                                                </p>
                                                <p className="flex items-center gap-1 font-semibold">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(
                                                        customer
                                                            .investigation_detail
                                                            .home_visit_date,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500">
                                                    Employee ID
                                                </p>
                                                <p className="font-semibold">
                                                    #
                                                    {
                                                        customer
                                                            .investigation_detail
                                                            .employee_id
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            No investigation data
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="mt-4">
                        <div>
                            <CardContent className="p-0">
                                {customer.orders &&
                                customer.orders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b bg-gray-50">
                                                <tr>
                                                    <th className="p-2 text-left font-semibold text-gray-700">
                                                        Order #
                                                    </th>
                                                    <th className="p-2 text-left font-semibold text-gray-700">
                                                        Date
                                                    </th>
                                                    <th className="p-2 text-left font-semibold text-gray-700">
                                                        Items
                                                    </th>
                                                    <th className="p-2 text-left font-semibold text-gray-700">
                                                        Payment
                                                    </th>
                                                    <th className="p-2 text-left font-semibold text-gray-700">
                                                        Status
                                                    </th>
                                                    <th className="p-2 text-right font-semibold text-gray-700">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customer.orders.map(
                                                    (order) => (
                                                        <tr
                                                            key={order.id}
                                                            className="border-b hover:bg-gray-50"
                                                        >
                                                            <td className="p-2 font-medium">
                                                                <Link
                                                                    href={`/pos-cash-orders/${order.order_number}`}
                                                                    className="underline"
                                                                >
                                                                    {
                                                                        order.order_number
                                                                    }
                                                                </Link>
                                                            </td>
                                                            <td className="p-2 text-gray-600">
                                                                {formatDate(
                                                                    order.transaction_date,
                                                                )}
                                                            </td>
                                                            <td className="p-2">
                                                                {order
                                                                    .order_items
                                                                    ?.length ||
                                                                    0}
                                                            </td>

                                                            <td className="p-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs capitalize"
                                                                >
                                                                    {
                                                                        order.payment_method
                                                                    }
                                                                </Badge>
                                                            </td>
                                                            <td className="p-2">
                                                                {order.is_void ? (
                                                                    <Badge
                                                                        variant="destructive"
                                                                        className="bg-gray-800 text-xs"
                                                                    >
                                                                        <Ban className="mr-1 h-3 w-3" />{' '}
                                                                        Voided
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-black text-xs">
                                                                        <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                                                                        Paid
                                                                    </Badge>
                                                                )}
                                                            </td>
                                                            <td className="p-2 text-right font-bold">
                                                                {formatCurrency(
                                                                    order.total_price,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Package className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                                        <p className="text-sm text-gray-500">
                                            No orders found
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </div>
                    </TabsContent>

                    {/* Installments Tab */}
                    <TabsContent
                        value="installments"
                        className="mt-4 space-y-4"
                    >
                        {customer.installment_orders &&
                        customer.installment_orders.length > 0 ? (
                            customer.installment_orders.map((installment) => (
                                <Card key={installment.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <CardTitle className="text-base">
                                                    <Link
                                                        className="underline"
                                                        href={`/pos-installment-orders/${installment.order_number}`}
                                                    >
                                                        {
                                                            installment.order_number
                                                        }
                                                    </Link>
                                                </CardTitle>
                                                {installment.is_completed ==
                                                    true && (
                                                    <Badge className="bg-green-600 text-xs">
                                                        Completed
                                                    </Badge>
                                                )}
                                                {installment.is_voided ==
                                                    true && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="bg-gray-800 text-xs"
                                                    >
                                                        Voided
                                                    </Badge>
                                                )}
                                                {installment.is_defaulted ==
                                                    true && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                    >
                                                        Defaulted
                                                    </Badge>
                                                )}
                                                {!installment.is_completed &&
                                                    !installment.is_voided &&
                                                    !installment.is_defaulted && (
                                                        <Badge className="bg-blue-600 text-xs">
                                                            Active
                                                        </Badge>
                                                    )}
                                            </div>
                                            {!installment.is_voided && (
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">
                                                        Balance
                                                    </p>
                                                    <p className="text-xl font-bold">
                                                        {formatCurrency(
                                                            installment.remaining_balance,
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <CardDescription className="text-xs">
                                            {formatDate(
                                                installment.transaction_date,
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
                                            <div className="rounded bg-gray-50 p-2">
                                                <p className="text-xs text-gray-500">
                                                    Contract
                                                </p>
                                                <p className="text-sm font-bold">
                                                    {formatCurrency(
                                                        installment.loan_contract_price,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="rounded bg-gray-50 p-2">
                                                <p className="text-xs text-gray-500">
                                                    Down Payment
                                                </p>
                                                <p className="text-sm font-bold">
                                                    {formatCurrency(
                                                        installment.down_payment,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="rounded bg-gray-50 p-2">
                                                <p className="text-xs text-gray-500">
                                                    Terms
                                                </p>
                                                <p className="text-sm font-bold">
                                                    {
                                                        installment.number_of_terms
                                                    }{' '}
                                                    months
                                                </p>
                                            </div>
                                            <div className="rounded bg-gray-50 p-2">
                                                <p className="text-xs text-gray-500">
                                                    Paid
                                                </p>
                                                <p className="text-sm font-bold text-green-600">
                                                    {formatCurrency(
                                                        installment.total_amount_paid,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="rounded bg-black p-2 text-white">
                                                <p className="text-xs opacity-80">
                                                    Balance
                                                </p>
                                                <p className="text-sm font-bold">
                                                    {formatCurrency(
                                                        installment.remaining_balance,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {installment.installment_order_payments &&
                                            installment
                                                .installment_order_payments
                                                .length > 0 && (
                                                <div>
                                                    <h4 className="mb-2 flex items-center gap-1 text-sm font-semibold">
                                                        <FileText className="h-3.5 w-3.5" />
                                                        Payments (
                                                        {
                                                            installment
                                                                .installment_order_payments
                                                                .length
                                                        }
                                                        )
                                                    </h4>
                                                    <div className="space-y-1.5">
                                                        {installment.installment_order_payments.map(
                                                            (payment) => (
                                                                <div
                                                                    key={
                                                                        payment.id
                                                                    }
                                                                    className="flex flex-col gap-2 rounded bg-gray-50 p-2 text-sm hover:bg-gray-100 sm:flex-row sm:items-center sm:justify-between"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                                                                            {
                                                                                payment.installment_number
                                                                            }
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-medium">
                                                                                Installment
                                                                                #
                                                                                {
                                                                                    payment.installment_number
                                                                                }
                                                                            </p>
                                                                            <p className="flex items-center gap-1 text-[10px] text-gray-500">
                                                                                <Clock className="h-2.5 w-2.5" />
                                                                                Due:{' '}
                                                                                {formatDate(
                                                                                    payment.due_date,
                                                                                )}
                                                                                {payment.paid_date &&
                                                                                    ` • Paid: ${formatDate(payment.paid_date)}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-right">
                                                                            <p className="text-xs font-bold">
                                                                                {formatCurrency(
                                                                                    payment.amount_due,
                                                                                )}
                                                                            </p>
                                                                            {payment.amount_paid >
                                                                                0 &&
                                                                                payment.amount_paid !==
                                                                                    payment.amount_due && (
                                                                                    <p className="text-[10px] text-green-600">
                                                                                        Paid:{' '}
                                                                                        {formatCurrency(
                                                                                            payment.amount_paid,
                                                                                        )}
                                                                                    </p>
                                                                                )}
                                                                        </div>
                                                                        <Badge
                                                                            className={`${getPaymentStatusColor(payment.status)} h-5 text-xs`}
                                                                        >
                                                                            {
                                                                                payment.status
                                                                            }
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <CreditCard className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                                    <p className="text-sm text-gray-500">
                                        No installment orders found
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Investigation Tab */}
                    <TabsContent value="investigation" className="mt-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Home className="h-4 w-4" />
                                    Investigation Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {customer.investigation_detail ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="rounded bg-gray-50 p-3">
                                                <p className="mb-1 text-xs text-gray-500">
                                                    Employee ID
                                                </p>
                                                <p className="text-lg font-bold">
                                                    #
                                                    {
                                                        customer
                                                            .investigation_detail
                                                            .employee_id
                                                    }
                                                </p>
                                            </div>
                                            <div className="rounded bg-gray-50 p-3">
                                                <p className="mb-1 text-xs text-gray-500">
                                                    Home Visit
                                                </p>
                                                <p className="flex items-center gap-1 text-sm font-semibold">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatDate(
                                                        customer
                                                            .investigation_detail
                                                            .home_visit_date,
                                                    )}
                                                </p>
                                            </div>
                                            <div
                                                className={`rounded p-3 ${customer.investigation_detail.is_employment_verified ? 'bg-black text-white' : 'bg-gray-100'}`}
                                            >
                                                <p className="mb-1 text-xs opacity-80">
                                                    Employment Status
                                                </p>
                                                <p className="flex items-center gap-1 text-sm font-bold">
                                                    {customer
                                                        .investigation_detail
                                                        .is_employment_verified ? (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4" />{' '}
                                                            Verified
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4" />{' '}
                                                            Not Verified
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Add this new section for ID and Civil Status */}
                                        <Separator />

                                        <div>
                                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                                <User className="h-4 w-4" />
                                                Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="rounded bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">
                                                        ID Presented
                                                    </p>
                                                    <p className="text-sm font-semibold">
                                                        {customer
                                                            .investigation_detail
                                                            .id_presented ||
                                                            'Not provided'}
                                                    </p>
                                                </div>
                                                <div className="rounded bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">
                                                        ID Number
                                                    </p>
                                                    <p className="text-sm font-semibold">
                                                        {customer
                                                            .investigation_detail
                                                            .id_number ||
                                                            'Not provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Add Civil Status and Spouse Information */}
                                        <div>
                                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                                <Home className="h-4 w-4" />
                                                Civil Status
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div className="rounded bg-gray-50 p-3">
                                                    <p className="mb-1 text-xs text-gray-500">
                                                        Status
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {customer
                                                            .investigation_detail
                                                            .civil_status ||
                                                            'Not provided'}
                                                    </Badge>
                                                </div>
                                                {customer.investigation_detail
                                                    .civil_status ===
                                                    'Married' && (
                                                    <>
                                                        <div className="rounded bg-gray-50 p-3">
                                                            <p className="mb-1 text-xs text-gray-500">
                                                                Spouse Name
                                                            </p>
                                                            <p className="text-sm font-semibold">
                                                                {customer
                                                                    .investigation_detail
                                                                    .spouse_name ||
                                                                    'Not provided'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded bg-gray-50 p-3">
                                                            <p className="mb-1 text-xs text-gray-500">
                                                                Spouse Contact
                                                            </p>
                                                            <p className="flex items-center gap-1 text-sm font-semibold">
                                                                <Phone className="h-3.5 w-3.5" />
                                                                {customer
                                                                    .investigation_detail
                                                                    .spouse_contact_number ||
                                                                    'Not provided'}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <p className="mb-2 text-sm font-semibold">
                                                Investigation Notes
                                            </p>
                                            <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
                                                <p className="whitespace-pre-wrap text-gray-700">
                                                    {customer
                                                        .investigation_detail
                                                        .investigation_notes ||
                                                        'No investigation notes available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <AlertCircle className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                                        <p className="text-sm text-gray-500">
                                            No investigation details available
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="mt-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4" />
                                    Additional Documents
                                </CardTitle>
                                <CardDescription>
                                    Supporting documents uploaded for this
                                    customer
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {customer.additional_documents &&
                                customer.additional_documents.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {customer.additional_documents.map(
                                            (doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                                        <div className="text-2xl">
                                                            {getFileIcon(
                                                                doc.mime_type,
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium">
                                                                {doc.file_name}
                                                            </p>
                                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                                <span>
                                                                    {formatFileSize(
                                                                        doc.file_size,
                                                                    )}
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    {formatDate(
                                                                        doc.created_at,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                            className="min-h-11 w-full sm:h-9 sm:min-h-0 sm:w-auto"
                                                        >
                                                            <a
                                                                href={`/storage/${doc.file_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Eye className="mr-1 h-3.5 w-3.5" />
                                                                View
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                            className="min-h-11 w-full sm:h-9 sm:min-h-0 sm:w-auto"
                                                        >
                                                            <a
                                                                href={`/storage/${doc.file_path}`}
                                                                download={
                                                                    doc.file_name
                                                                }
                                                            >
                                                                <Download className="mr-1 h-3.5 w-3.5" />
                                                                Download
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <File className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                        <p className="text-sm font-medium text-gray-500">
                                            No documents uploaded
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            Documents will appear here once
                                            uploaded
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
