import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, Banknote, Receipt, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { all } from 'axios';
import ModuleHeading from '@/components/cards/module-heading';
import { IconFileExport } from '@tabler/icons-react';



interface PageProps {
  allTransactions: {date: string
                receipt_number: string
                customer: string
                m_i: number
                d_p: number
                amount_paid: number
                payment_method: string
                reference_number: string
                is_voided: boolean
                remarks: string
  }[];
  mops: Record<string, number>;
  miCollection: number;
  dpCollection: number;
  cashCollection: number;
  netCollection: number;
  totalCashOnHand: number;
  totalOtherMop: number;
  expenses: number;
}

export default function CashierDashboard({expenses, totalCashOnHand, totalOtherMop, allTransactions, mops, miCollection, dpCollection, cashCollection, netCollection} : PageProps) {

     const getTodayDate = () => new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(getTodayDate);


  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
      <AppLayout>
          <Head title="Cashier Dashboard" />
          <div className="min-h-screen">
              <div className="space-y-6">
                  <ModuleHeading
                      title="RJL Household trading"
                      description="   Daily Cash Collection Report"
                  >
                      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-3.5 text-white shadow-md">
                          <Calendar className="h-5 w-5" />
                          <span className="text-sm font-semibold">
                              {formatDate(selectedDate)}
                          </span>
                      </div>
                  </ModuleHeading>

                  {/* Date Filter */}
                  {/* <Card className="shadow-lg border-slate-200 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="selectedDate" className="text-slate-700 font-semibold mb-2 block">
                  Select Date
                </Label>
                <Input
                  id="selectedDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-lg border-slate-300 focus:border-slate-600 focus:ring-slate-600 rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card> */}

                  {/* Remittance Summary - Featured */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-900 shadow-xl">
                      <div className="mb-6 flex items-center gap-3">
                          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow">
                              <Wallet className="h-7 w-7 text-gray-700" />
                          </div>
                          <div>
                              <h2 className="text-2xl font-bold">
                                  Total Collection Summary
                              </h2>
                              <p className="text-sm text-gray-500">
                                  Comprehensive sales overview
                              </p>
                          </div>
                      </div>

                      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow transition-all hover:shadow-md">
                              <div className="mb-3 flex items-center gap-2">
                                  <Banknote className="h-5 w-5 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-600">
                                      Cash Payment
                                  </span>
                              </div>
                              <div className="text-3xl font-bold">
                                  ₱{totalCashOnHand.toLocaleString()}
                              </div>
                          </div>

                          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow transition-all hover:shadow-md">
                              <div className="mb-3 flex items-center gap-2">
                                  <CreditCard className="h-5 w-5 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-600">
                                      Other MOP
                                  </span>
                              </div>
                              <div className="text-3xl font-bold">
                                  ₱{totalOtherMop.toLocaleString()}
                              </div>
                          </div>

                          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                              <div className="mb-3 flex items-center gap-2">
                                  <Receipt className="h-5 w-5 text-gray-700" />
                                  <span className="text-sm font-semibold">
                                      Total Collection
                                  </span>
                              </div>
                              <div className="text-4xl font-bold">
                                  ₱{netCollection.toLocaleString()}
                              </div>
                          </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow">
                          <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                  Net Collection after Expenses
                              </span>
                              <span className="text-lg font-semibold text-gray-800">
                                  ₱{(netCollection - expenses).toLocaleString()}
                              </span>
                          </div>
                      </div>
                  </div>

                  {/* Collection Summary Cards */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                      <Card className="rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transition-all duration-200 hover:shadow-xl">
                          <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm font-semibold text-slate-700">
                                      M.I Collection
                                  </CardTitle>
                                  <div className="rounded-xl bg-blue-500 p-2.5 shadow-md">
                                      <TrendingUp className="h-5 w-5 text-white" />
                                  </div>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <div className="text-3xl font-bold text-slate-900">
                                  ₱{miCollection.toLocaleString()}
                              </div>
                              <p className="mt-1.5 text-xs font-medium text-slate-600">
                                  Monthly Installment
                              </p>
                          </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg transition-all duration-200 hover:shadow-xl">
                          <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm font-semibold text-slate-700">
                                      D.P Collection
                                  </CardTitle>
                                  <div className="rounded-xl bg-emerald-500 p-2.5 shadow-md">
                                      <Wallet className="h-5 w-5 text-white" />
                                  </div>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <div className="text-3xl font-bold text-slate-900">
                                  ₱{dpCollection.toLocaleString()}
                              </div>
                              <p className="mt-1.5 text-xs font-medium text-slate-600">
                                  Down Payment
                              </p>
                          </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-0 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg transition-all duration-200 hover:shadow-xl">
                          <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm font-semibold text-slate-700">
                                      Cash Collection
                                  </CardTitle>
                                  <div className="rounded-xl bg-amber-500 p-2.5 shadow-md">
                                      <DollarSign className="h-5 w-5 text-white" />
                                  </div>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <div className="text-3xl font-bold text-slate-900">
                                  ₱{cashCollection.toLocaleString()}
                              </div>
                              <p className="mt-1.5 text-xs font-medium text-slate-600">
                                  Cash Payments
                              </p>
                          </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-0 bg-gradient-to-br from-rose-50 to-rose-100 shadow-lg transition-all duration-200 hover:shadow-xl">
                          <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm font-semibold text-slate-700">
                                      Expenses
                                  </CardTitle>
                                  <div className="rounded-xl bg-rose-500 p-2.5 shadow-md">
                                      <TrendingDown className="h-5 w-5 text-white" />
                                  </div>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <div className="text-3xl font-bold text-rose-600">
                                  ₱{expenses.toLocaleString()}
                              </div>
                              <p className="mt-1.5 text-xs font-medium text-slate-600">
                                  Total Expenses
                              </p>
                          </CardContent>
                      </Card>
                  </div>

                  {/* Payment Method Breakdown */}
                  <Card className="rounded-2xl border-slate-200 shadow-lg">
                      <CardHeader className="rounded-t-2xl">
                          <CardTitle className="text-lg font-bold text-slate-900">
                              Payment Method Breakdown
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                              {Object.entries(mops).map(([method, amount]) => (
                                  <div
                                      key={method}
                                      className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 transition-all duration-200 hover:shadow-md"
                                  >
                                      <Badge
                                          variant="outline"
                                          className="mb-3 border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700"
                                      >
                                          {method}
                                      </Badge>
                                      <div className="text-2xl font-bold text-slate-900">
                                          ₱{amount.toLocaleString()}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </CardContent>
                  </Card>

                  {/* Transactions Table */}
                  <Card className="rounded-2xl border-slate-200 shadow-lg">
                      <CardHeader className="rounded-t-2xl">
                          <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                  <FileText className="h-5 w-5" />
                                  Transaction Details
                              </CardTitle>
                              <Button variant="link">
                                  <IconFileExport />
                                  <a
                                      href={`/transactions/download-pdf`}
                                      className="btn btn-primary"
                                      target="_blank"
                                  >
                                      Download PDF
                                  </a>
                              </Button>
                          </div>
                      </CardHeader>
                      <CardContent className="p-0">
                          <div className="overflow-x-auto">
                              <table className="w-full">
                                  <thead>
                                      <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                                          <th className="p-4 text-left text-sm font-bold text-slate-700">
                                              Date
                                          </th>
                                          <th className="p-4 text-left text-sm font-bold text-slate-700">
                                              OR/CSI #
                                          </th>
                                          <th className="p-4 text-left text-sm font-bold text-slate-700">
                                              Customer Name
                                          </th>
                                          <th className="p-4 text-right text-sm font-bold text-slate-700">
                                              M.I
                                          </th>
                                          <th className="p-4 text-right text-sm font-bold text-slate-700">
                                              D.P
                                          </th>
                                          <th className="p-4 text-right text-sm font-bold text-slate-700">
                                              Cash
                                          </th>
                                          <th className="p-4 text-left text-sm font-bold text-slate-700">
                                              Payment
                                          </th>
                                          <th className="p-4 text-left text-sm font-bold text-slate-700">
                                              Remarks
                                          </th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {allTransactions.map((txn, index) => (
                                          <tr
                                              key={index}
                                              className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                                                  txn.is_voided
                                                      ? 'bg-rose-50'
                                                      : index % 2 === 0
                                                        ? 'bg-white'
                                                        : 'bg-slate-50/50'
                                              }`}
                                          >
                                              <td className="p-4 text-sm font-medium text-slate-600">
                                                  {txn.date}
                                              </td>
                                              <td className="p-4 text-sm font-semibold text-slate-900">
                                                  {txn.receipt_number}
                                              </td>
                                              <td className="p-4 text-sm font-medium text-slate-700">
                                                  {txn.customer}
                                              </td>
                                              <td className="p-4 text-right text-sm font-semibold text-slate-900">
                                                  {txn.m_i > 0
                                                      ? `₱${txn.m_i.toLocaleString()}`
                                                      : '-'}
                                              </td>
                                              <td className="p-4 text-right text-sm font-semibold text-slate-900">
                                                  {txn.d_p > 0
                                                      ? `₱${txn.d_p.toLocaleString()}`
                                                      : '-'}
                                              </td>
                                              <td className="p-4 text-right text-sm font-semibold text-slate-900">
                                                  {txn.amount_paid > 0
                                                      ? `${txn.amount_paid < 0 ? '-' : ''}₱${Math.abs(txn.amount_paid).toLocaleString()}`
                                                      : '-'}
                                              </td>
                                              <td className="p-4">
                                                  <Badge
                                                      variant={
                                                          false
                                                              ? 'destructive'
                                                              : txn.payment_method ===
                                                                  'cash'
                                                                ? 'default'
                                                                : 'secondary'
                                                      }
                                                      className="font-semibold"
                                                  >
                                                      {txn.payment_method}
                                                  </Badge>
                                              </td>
                                              <td className="max-w-xs truncate p-4 text-sm text-slate-600">
                                                  {txn.remarks}
                                              </td>
                                          </tr>
                                      ))}
                                      {allTransactions.length === 0 && (
                                          <tr>
                                              <td
                                                  colSpan={8}
                                                  className="py-12 text-center text-slate-500"
                                              >
                                                  <div className="flex flex-col items-center gap-3">
                                                      <FileText className="h-12 w-12 text-slate-300" />
                                                      <p className="text-lg font-semibold">
                                                          No transactions found
                                                          for the selected date
                                                      </p>
                                                  </div>
                                              </td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </CardContent>
                  </Card>

                  {/* Collection Summary */}
                  {/* <Card className="shadow-lg border-slate-200 rounded-2xl">
          <CardHeader className="border-b border-slate-200 rounded-t-2xl">
            <CardTitle className="text-lg font-bold text-slate-900">Daily Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Total M.I Collection</span>
                <span className="text-xl font-bold text-slate-900">₱{miCollection.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Total D.P Collection</span>
                <span className="text-xl font-bold text-slate-900">₱{dpCollection.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Total Cash Collection</span>
                <span className="text-xl font-bold text-slate-900">₱{cashCollection.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Less: Direct Expenses</span>
                <span className="text-xl font-bold text-rose-600">-₱{summary.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-5 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 rounded-xl border-2 border-indigo-200 mt-4 shadow-md">
                <span className="font-bold text-lg text-slate-900">Net Collection</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ₱{netCollection.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card> */}
              </div>
          </div>
      </AppLayout>
  );
}