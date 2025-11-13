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

// Sample data structure matching your report
const sampleTransactions = [
  {
    id: 1,
    date: '2024-11-08',
    orCsi: 'C-018537',
    customerName: 'MACASPAC WALTER',
    mi: 2028,
    dp: 0,
    cash: 0,
    paymentMethod: 'MI',
    remarks: 'MI-APPL/ SAMSUNG REF RT-20FARVDSA',
  },
  {
    id: 2,
    date: '2024-11-08',
    orCsi: 'C-018538',
    customerName: 'MALLARI JIMMY',
    mi: 2123,
    dp: 0,
    cash: 0,
    paymentMethod: 'MI',
    remarks: 'MI-APPL/ LG REF GR-B202SQBB',
  },
  {
    id: 3,
    date: '2024-11-08',
    orCsi: 'C-018540',
    customerName: 'CRUZ LESTER, CRUZ LOLITO',
    mi: 0,
    dp: 1500,
    cash: 0,
    paymentMethod: 'DP',
    remarks: 'DP-REAL ME C71 6/128',
  },
  {
    id: 4,
    date: '2024-11-08',
    orCsi: 'C-018541',
    customerName: 'DELA TORRE KATE PRINCESS',
    mi: 0,
    dp: 0,
    cash: 18500,
    paymentMethod: 'Cash',
    remarks: 'PANASONIC REF NR-BQ222VB',
  },
  {
    id: 5,
    date: '2024-11-08',
    orCsi: 'C-018542',
    customerName: 'CITRA MARIA ELAINE MAY',
    mi: 0,
    dp: 0,
    cash: 20000,
    paymentMethod: 'Cash',
    remarks: 'OUR HOME SOFA SET L-SHAPED CHRISTIAN',
  },
  {
    id: 6,
    date: '2024-11-08',
    orCsi: 'RJL SI000066',
    customerName: 'PARDILLO JUANCHO',
    mi: 0,
    dp: 0,
    cash: 1880,
    paymentMethod: 'GCash',
    remarks: 'ASAHI DOUBLE BURNER GAS STOVE GS-117',
  },
  {
    id: 7,
    date: '2024-11-08',
    orCsi: 'RJL SI000067',
    customerName: 'CABALIC NESETTA',
    mi: 0,
    dp: 0,
    cash: 740,
    paymentMethod: 'Cash',
    remarks: 'ASAHI FLAT IRON CI-2605',
  },
  {
    id: 8,
    date: '2024-11-08',
    orCsi: 'CSD-018461',
    customerName: 'CUBACUB ANGELITO',
    mi: 1543,
    dp: 0,
    cash: 0,
    paymentMethod: 'MI',
    remarks: 'MI-APPL/ ASTRON LED-4277 TV',
  },
  {
    id: 9,
    date: '2024-11-08',
    orCsi: 'EXP-001',
    customerName: 'Gas Emergency',
    mi: 0,
    dp: 0,
    cash: -500,
    paymentMethod: 'Expense',
    remarks: 'Emergency gas payment',
    isExpense: true,
  },
  {
    id: 10,
    date: '2024-11-09',
    orCsi: 'C-018543',
    customerName: 'SANTOS MARIA',
    mi: 1850,
    dp: 0,
    cash: 0,
    paymentMethod: 'MI',
    remarks: 'MI-APPL/ FUJIDENZO REF RDD-70S',
  },
  {
    id: 11,
    date: '2024-11-09',
    orCsi: 'C-018544',
    customerName: 'REYES JUAN',
    mi: 0,
    dp: 2000,
    cash: 0,
    paymentMethod: 'Card',
    remarks: 'DP-LAPTOP ACER ASPIRE',
  },
];

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
}

export default function CashierDashboard({totalCashOnHand, totalOtherMop, allTransactions, mops, miCollection, dpCollection, cashCollection, netCollection} : PageProps) {
  console.log(allTransactions);
     const getTodayDate = () => new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(getTodayDate);


  const filteredTransactions = useMemo(() => {
    return sampleTransactions.filter((txn) => {
      return txn.date === selectedDate;
    });
  }, [selectedDate]);

  const summary = useMemo(() => {
    const totals = filteredTransactions.reduce(
      (acc, txn) => {
        if (txn.isExpense) {
          acc.expenses += Math.abs(txn.cash);
        } else {
          acc.mi += txn.mi;
          acc.dp += txn.dp;
          acc.cash += txn.cash;
          acc.total += txn.mi + txn.dp + txn.cash;
          
          if (txn.paymentMethod === 'Cash') {
            acc.cashRemittance += txn.cash;
          } else {
            acc.otherMopRemittance += txn.mi + txn.dp + txn.cash;
          }
        }
        return acc;
      },
      { mi: 0, dp: 0, cash: 0, total: 0, expenses: 0, cashRemittance: 0, otherMopRemittance: 0 }
    );

    totals.netCollection = totals.total - totals.expenses;
    totals.totalRemittance = totals.cashRemittance + totals.otherMopRemittance;

    return totals;
  }, [filteredTransactions]);

  const paymentMethodBreakdown = useMemo(() => {
    const breakdown = {};
    filteredTransactions
      .filter((txn) => !txn.isExpense)
      .forEach((txn) => {
        const method = txn.paymentMethod;
        if (!breakdown[method]) {
          breakdown[method] = 0;
        }
        breakdown[method] += txn.mi + txn.dp + txn.cash;
      });
    return breakdown;
  }, [filteredTransactions]);

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
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black bg-clip-text">
                Daily Cash Collection Report
              </h1>
              <p className="text-gray-700 mt-2 font-medium text-lg">RJL Household Trading</p>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-3.5 rounded-xl shadow-md">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold text-sm">{formatDate(selectedDate)}</span>
            </div>
          </div>
        </div>

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
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Cashier Remittance</h2>
              <p className="text-indigo-100 text-sm">Amount to be remitted today</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="h-5 w-5 text-indigo-100" />
                <span className="text-indigo-100 text-sm font-medium">Cash Payment</span>
              </div>
              <div className="text-3xl font-bold">₱{totalCashOnHand.toLocaleString()}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-indigo-100" />
                <span className="text-indigo-100 text-sm font-medium">Other MOP</span>
              </div>
              <div className="text-3xl font-bold">₱{totalOtherMop.toLocaleString()}</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="h-5 w-5 text-white" />
                <span className="text-white text-sm font-semibold">Total Collection</span>
              </div>
              <div className="text-4xl font-bold">₱{netCollection.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-100">Total Transactions</span>
              <span className="font-semibold text-lg">{allTransactions.length}</span>
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
              <div className="text-3xl font-bold text-rose-600">₱{summary.expenses.toLocaleString()}</div>
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