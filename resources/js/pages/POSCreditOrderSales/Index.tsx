import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface Location {
  id: number;
  name: string;
}

interface Props {
  filters: {
    date_from: string;
    date_to: string;
    item_type: string;
    location_id: string | number;
  };
  locations: Location[];
  summary: {
    total_lcp: number;
    total_down_payment: number;
    total_pnv: number;
    total_amount_due: number;
    total_amount_paid: number;
    total_remaining_balance: number;
    total_orders: number;
    active_accounts: number;
    completed_accounts: number;
    defaulted_accounts: number;
  };
  receivables: {
    current: number;
    "30_days": number;
    "60_days": number;
    "90_days": number;
    "90_plus_days": number;
    total: number;
  };
  collections: {
    current: number;
    "30_days": number;
    "60_days": number;
    "90_days": number;
    "90_plus_days": number;
    total: number;
  };
  accounts_by_item_type: {
    furniture: { count: number; amount: number };
    appliances: { count: number; amount: number };
    gadgets: { count: number; amount: number };
  };
  collections_by_item_type: {
    furniture: number;
    appliances: number;
    gadgets: number;
  };
  advance_by_item_type: {
    furniture: number;
    appliances: number;
    gadgets: number;
  };
  rebate_by_item_type: {
    furniture: number;
    appliances: number;
    gadgets: number;
  };
  collection_performance: {
    collection_rate: number;
    target_rate: number;
    variance: number;
  };
}

export default function Index({
  filters,
  locations,
  summary,
  receivables,
  collections,
  accounts_by_item_type,
  collections_by_item_type,
  advance_by_item_type,
  rebate_by_item_type,
  collection_performance,
}: Props) {
  const [dateFrom, setDateFrom] = useState(filters.date_from);
  const [dateTo, setDateTo] = useState(filters.date_to);
  const [itemType, setItemType] = useState(filters.item_type);
  const [locationId, setLocationId] = useState(filters.location_id.toString());

  const handleFilter = () => {
    router.get('/pos-installment-orders-sales', {
      date_from: dateFrom,
      date_to: dateTo,
      item_type: itemType,
      location_id: locationId,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const receivablesData = [
    { name: 'Current', amount: receivables.current, fill: '#10b981' },
    { name: '1-30 Days', amount: receivables["30_days"], fill: '#f59e0b' },
    { name: '31-60 Days', amount: receivables["60_days"], fill: '#ef4444' },
    { name: '61-90 Days', amount: receivables["90_days"], fill: '#b91c1c' },
    { name: '90+ Days', amount: receivables["90_plus_days"], fill: '#7f1d1d' },
  ];

  const collectionsData = [
    { name: 'Current', amount: collections.current },
    { name: '1-30 Days', amount: collections["30_days"] },
    { name: '31-60 Days', amount: collections["60_days"] },
    { name: '61-90 Days', amount: collections["90_days"] },
    { name: '90+ Days', amount: collections["90_plus_days"] },
  ];

  const itemTypeData = [
    {
      name: 'Furniture',
      accounts: accounts_by_item_type.furniture.count,
      amount: accounts_by_item_type.furniture.amount,
      collections: collections_by_item_type.furniture,
      advance: advance_by_item_type.furniture,
    },
    {
      name: 'Appliances',
      accounts: accounts_by_item_type.appliances.count,
      amount: accounts_by_item_type.appliances.amount,
      collections: collections_by_item_type.appliances,
      advance: advance_by_item_type.appliances,
    },
    {
      name: 'Gadgets',
      accounts: accounts_by_item_type.gadgets.count,
      amount: accounts_by_item_type.gadgets.amount,
      collections: collections_by_item_type.gadgets,
      advance: advance_by_item_type.gadgets,
    },
  ];

  const accountStatusData = [
    { name: 'Active', value: summary.active_accounts, fill: '#3b82f6' },
    { name: 'Completed', value: summary.completed_accounts, fill: '#10b981' },
    { name: 'Defaulted', value: summary.defaulted_accounts, fill: '#ef4444' },
  ];

  return (
    <AppLayout>
      <Head title="POS Credit Order Sales" />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive overview of installment order sales and collections
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter sales data by date range, item type, and location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_from">Date From</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_to">Date To</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_type">Item Type</Label>
                <Select value={itemType} onValueChange={setItemType}>
                  <SelectTrigger id="item_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="appliances">Appliances</SelectItem>
                    <SelectItem value="gadgets">Gadgets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_id">Location</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger id="location_id">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={handleFilter} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_orders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active: {summary.active_accounts} | Completed: {summary.completed_accounts}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PNV</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total_pnv)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Promissory Note Value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total_amount_paid)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {collection_performance.collection_rate}% collection rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total_remaining_balance)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Outstanding receivables
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Loan Contract Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total_lcp)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Down Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total_down_payment)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Amount Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total_amount_due)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Collection Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Performance</CardTitle>
            <CardDescription>Track collection efficiency against target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Collection Rate</p>
                  <p className="text-3xl font-bold">{collection_performance.collection_rate}%</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm font-medium">Target Rate</p>
                  <p className="text-3xl font-bold text-muted-foreground">{collection_performance.target_rate}%</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm font-medium">Variance</p>
                  <div className="flex items-center gap-2">
                    {collection_performance.variance >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <p className={`text-3xl font-bold ${collection_performance.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(collection_performance.variance)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(collection_performance.collection_rate, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Receivables by Aging */}
          <Card>
            <CardHeader>
              <CardTitle>Receivables by Aging</CardTitle>
              <CardDescription>Outstanding balances by age category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={receivablesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {receivablesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Receivables:</span>
                  <span className="font-bold">{formatCurrency(receivables.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actual Collections by Aging */}
          <Card>
            <CardHeader>
              <CardTitle>Actual Collections by Aging</CardTitle>
              <CardDescription>Payments received by age category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={collectionsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Collections:</span>
                  <span className="font-bold">{formatCurrency(collections.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Accounts by Item Type */}
          <Card>
            <CardHeader>
              <CardTitle>Accounts by Item Type</CardTitle>
              <CardDescription>Distribution of accounts and amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={itemTypeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#3b82f6" name="Total Amount" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="collections" fill="#10b981" name="Collections" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Distribution of active, completed, and defaulted accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={accountStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {accountStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Item Type Details */}
        <Card>
          <CardHeader>
            <CardTitle>Item Type Breakdown</CardTitle>
            <CardDescription>Detailed analysis per item category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {itemTypeData.map((item) => (
                <div key={item.name} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">{item.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Accounts</p>
                      <p className="text-xl font-bold">{item.accounts}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold">{formatCurrency(item.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Collections</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(item.collections)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Advance Payments</p>
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(item.advance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rebate</p>
                      <p className="text-xl font-bold text-purple-600">{formatCurrency(rebate_by_item_type[item.name.toLowerCase() as keyof typeof rebate_by_item_type])}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}