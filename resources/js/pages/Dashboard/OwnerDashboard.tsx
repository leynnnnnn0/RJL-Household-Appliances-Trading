import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, Banknote, Receipt, FileText, Filter, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import ModuleHeading from '@/components/cards/module-heading';
import { IconFileExport } from '@tabler/icons-react';

interface Transaction {
  date: string;
  receipt_number: string;
  customer: string;
  m_i: number | null;
  d_p: number | null;
  amount_paid: number | null;
  payment_method: string;
  reference_number: string;
  is_voided: boolean;
  remarks: string;
  employee_name?: string;
}



interface PageProps {
  allTransactions: Transaction[];
  mops: Record<string, number>;
  miCollection: number;
  dpCollection: number;
  cashCollection: number;
  netCollection: number;
  totalCashOnHand: number;
  totalOtherMop: number;
  expenses: number;
  employees: Array<{ id: number; full_name: string }>;
  filters: {
    from_date: string;
    to_date: string;
    employee_id: string | null;
  };
}

export default function OwnerDashboard({
  expenses,
  totalCashOnHand,
  totalOtherMop,
  allTransactions,
  mops,
  miCollection,
  dpCollection,
  cashCollection,
  netCollection,
  employees,
  filters
}: PageProps) {
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  
  const [fromDate, setFromDate] = useState(filters.from_date || getTodayDate());
  const [toDate, setToDate] = useState(filters.to_date || getTodayDate());
  const [selectedEmployee, setSelectedEmployee] = useState(filters.employee_id || 'all');


  const handleFilter = () => {
    router.get('/dashboard', {
      from_date: fromDate,
      to_date: toDate,
      branch_id: selectedEmployee !== 'all' ? selectedEmployee : null
    }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const formatDateRange = () => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (fromDate === toDate) {
      return from.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return `${from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const selectedEmployeeName = useMemo(() => {
    if (selectedEmployee === 'all') return 'All Employees';
    const employee = employees.find(e => e.id.toString() === selectedEmployee);
    return employee ? employee.full_name : 'All Employees';
  }, [selectedEmployee, employees]);

  return (
    <AppLayout>
      <Head title="Owner Dashboard" />
      <div className="min-h-screen">
        <div className="space-y-6">
            <ModuleHeading title='Dashboard' description='Track your sales performance and revenue across all locations'/>
          {/* Header */}
          {/* <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Sales Overview Dashboard
                </h1>
                <p className="text-gray-700 mt-2 font-medium text-lg">RJL Household Trading</p>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-3.5 rounded-xl shadow-md">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold text-sm">{formatDateRange()}</span>
              </div>
            </div>
          </div> */}

          {/* Filters */}
          <Card className="shadow-lg border-slate-200 rounded-2xl">
            <CardHeader className="rounded-t-2xl">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="fromDate" className="text-slate-700 font-semibold mb-2 block">
                    From Date
                  </Label>
                  <DatePicker
                    id="fromDate"
                    value={fromDate}
                    onChange={setFromDate}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="toDate" className="text-slate-700 font-semibold mb-2 block">
                    To Date
                  </Label>
                  <DatePicker
                    id="toDate"
                    value={toDate}
                    onChange={setToDate}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="employee" className="text-slate-700 font-semibold mb-2 block">
                    Branch
                  </Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleFilter}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold rounded-lg shadow-md"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
             
            </CardContent>
          </Card>

          {/* Total Collection Summary - Featured */}
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
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transaction Details
                </CardTitle>
                <Button variant='link'>
                  <IconFileExport/>
                    <a href={`/transactions/download-pdf?from_date=${fromDate}&to_date=${toDate}&branch_id=${selectedEmployee}`}
   className="btn btn-primary" target='_blank'>
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
                      <th className="p-4 text-left font-bold text-slate-700 text-sm">Date</th>
                      <th className="p-4 text-left font-bold text-slate-700 text-sm">OR/CSI #</th>
                      <th className="p-4 text-left font-bold text-slate-700 text-sm">Customer Name</th>
                      {selectedEmployee === 'all' && (
                        <th className="p-4 text-left font-bold text-slate-700 text-sm">Employee</th>
                      )}
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
                          txn.is_voided ? 'bg-rose-50' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        <td className="p-4 text-sm text-slate-600 font-medium">{txn.date}</td>
                        <td className="p-4 font-semibold text-sm text-slate-900">{txn.receipt_number}</td>
                        <td className="p-4 text-sm text-slate-700 font-medium">{txn.customer}</td>
                        {selectedEmployee === 'all' && (
                          <td className="p-4 text-sm text-slate-700 font-medium">{txn.employee_name || 'N/A'}</td>
                        )}
                        <td className="p-4 text-right text-sm font-semibold text-slate-900">
                          {txn.m_i && txn.m_i > 0 ? `₱${txn.m_i.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-4 text-right text-sm font-semibold text-slate-900">
                          {txn.d_p && txn.d_p > 0 ? `₱${txn.d_p.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-4 text-right text-sm font-semibold text-slate-900">
                          {txn.amount_paid && txn.amount_paid > 0
                            ? `₱${Math.abs(txn.amount_paid).toLocaleString()}`
                            : '-'}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              txn.is_voided
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
                        <td colSpan={selectedEmployee === 'all' ? 9 : 8} className="text-center py-12 text-slate-500">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="h-12 w-12 text-slate-300" />
                            <p className="font-semibold text-lg">No transactions found for the selected filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
