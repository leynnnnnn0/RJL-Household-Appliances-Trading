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
  console.log(allTransactions);
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
      <div className="min-h-screen ">
        <div className="space-y-6">
          <ModuleHeading title='RJL Household trading' description='   Daily Cash Collection Report'>
              <div className="flex items-center gap-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-3.5 rounded-xl shadow-md">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold text-sm">{formatDate(selectedDate)}</span>
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
      <div className="rounded-2xl bg-white shadow-xl p-8 border border-gray-200 text-gray-900">
  <div className="flex items-center gap-3 mb-6">
    <div className="p-3 rounded-xl bg-white shadow border border-gray-200">
      <Wallet className="h-7 w-7 text-gray-700" />
    </div>
    <div>
      <h2 className="text-2xl font-bold">Total Collection Summary</h2>
      <p className="text-sm text-gray-500">Comprehensive sales overview</p>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

    <div className="rounded-xl p-6 bg-white border border-gray-200 shadow hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-3">
        <Banknote className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-600">Cash Payment</span>
      </div>
      <div className="text-3xl font-bold">₱{totalCashOnHand.toLocaleString()}</div>
    </div>

    <div className="rounded-xl p-6 bg-white border border-gray-200 shadow hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-600">Other MOP</span>
      </div>
      <div className="text-3xl font-bold">₱{totalOtherMop.toLocaleString()}</div>
    </div>

    <div className="rounded-xl p-6 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-semibold">Total Collection</span>
      </div>
      <div className="text-4xl font-bold">₱{netCollection.toLocaleString()}</div>
    </div>

  </div>

  <div className="rounded-xl p-4 bg-white border border-gray-200 shadow">
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">Net Collection after Expenses</span>
      <span className="font-semibold text-lg text-gray-800">
        ₱{(netCollection - expenses).toLocaleString()}
      </span>
    </div>
  </div>
</div>

        {/* Collection Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-200 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">M.I Collection</CardTitle>
                <div className="bg-blue-500 p-2.5 rounded-xl shadow-md">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">₱{miCollection.toLocaleString()}</div>
              <p className="text-xs text-slate-600 mt-1.5 font-medium">Monthly Installment</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-200 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">D.P Collection</CardTitle>
                <div className="bg-emerald-500 p-2.5 rounded-xl shadow-md">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">₱{dpCollection.toLocaleString()}</div>
              <p className="text-xs text-slate-600 mt-1.5 font-medium">Down Payment</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-200 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Cash Collection</CardTitle>
                <div className="bg-amber-500 p-2.5 rounded-xl shadow-md">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">₱{cashCollection.toLocaleString()}</div>
              <p className="text-xs text-slate-600 mt-1.5 font-medium">Cash Payments</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-200 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Expenses</CardTitle>
                <div className="bg-rose-500 p-2.5 rounded-xl shadow-md">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600">₱{expenses.toLocaleString()}</div>
              <p className="text-xs text-slate-600 mt-1.5 font-medium">Total Expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Method Breakdown */}
        <Card className="shadow-lg border-slate-200 rounded-2xl">
          <CardHeader className="rounded-t-2xl">
            <CardTitle className="text-lg font-bold text-slate-900">Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(mops).map(([method, amount]) => (
                <div key={method} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-all duration-200">
                  <Badge 
                    variant="outline" 
                    className="mb-3 bg-white border-slate-300 text-slate-700 font-semibold px-3 py-1"
                  >
                    {method}
                  </Badge>
                  <div className="text-2xl font-bold text-slate-900">₱{amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="shadow-lg border-slate-200 rounded-2xl">
          <CardHeader className="rounded-t-2xl">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2 ">
                <FileText className="h-5 w-5" />
                Transaction Details
              </CardTitle>
              <Badge variant="secondary" className="text-sm font-semibold px-3 py-1 bg-slate-200 text-slate-700">
                {allTransactions.length} transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="p-4 text-left font-bold text-slate-700 text-sm">Date</th>
                    <th className="p-4 text-left font-bold text-slate-700 text-sm">OR/CSI #</th>
                    <th className="p-4 text-left font-bold text-slate-700 text-sm">Customer Name</th>
                    <th className="p-4 text-right font-bold text-slate-700 text-sm">M.I</th>
                    <th className="p-4 text-right font-bold text-slate-700 text-sm">D.P</th>
                    <th className="p-4 text-right font-bold text-slate-700 text-sm">Cash</th>
                    <th className="p-4 text-left font-bold text-slate-700 text-sm">Payment</th>
                    <th className="p-4 text-left font-bold text-slate-700 text-sm">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((txn, index) => (
                    <tr
                      key={index}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        false ? 'bg-rose-50' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="p-4 text-sm text-slate-600 font-medium">{txn.date}</td>
                      <td className="p-4 font-semibold text-sm text-slate-900">{txn.receipt_number}</td>
                      <td className="p-4 text-sm text-slate-700 font-medium">{txn.customer}</td>
                      <td className="p-4 text-right text-sm font-semibold text-slate-900">
                        {txn.m_i > 0 ? `₱${txn.m_i.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-slate-900">
                        {txn.d_p > 0 ? `₱${txn.d_p.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-slate-900">
                        {txn.amount_paid >0
                          ? `${txn.amount_paid < 0 ? '-' : ''}₱${Math.abs(txn.amount_paid).toLocaleString()}`
                          : '-'}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            false
                              ? 'destructive'
                              : txn.payment_method === 'cash'
                              ? 'default'
                              : 'secondary'
                          }
                          className="font-semibold"
                        >
                          {txn.payment_method}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-600 max-w-xs truncate">
                        {txn.remarks}
                      </td>
                    </tr>
                  ))}
                  {allTransactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="h-12 w-12 text-slate-300" />
                          <p className="font-semibold text-lg">No transactions found for the selected date</p>
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