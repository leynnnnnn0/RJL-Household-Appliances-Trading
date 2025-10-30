import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, MapPin, Package, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Location } from '@/types';

type CategoryType = {
  name: string;
  sales: number;
  percentage: number;
  color: string;
};

type LocationType = {
  id: number
  name: string;
  revenue: number;
};

interface PageProps {
  total_sales: number;
  total_expense: number;
  total_profit: number;
  sales_per_category: Record<string, CategoryType>;
  sales_by_location: Record<string, LocationType>;
  locations: Location[];
  filters: {
    date_from: string;
    date_to: string;
    location_id: string;
  };
}

export default function POSSalesDashboard({
  total_expense, 
  total_sales,  
  total_profit, 
  sales_per_category, 
  sales_by_location, 
  locations,
  filters
} : PageProps) {
  const [dateFrom, setDateFrom] = useState(filters.date_from || '2025-10-01');
  const [dateTo, setDateTo] = useState(filters.date_to || '2025-10-28');
  const [selectedLocation, setSelectedLocation] = useState(filters.location_id || 'all');

  // Function to apply filters
  const applyFilters = (newDateFrom?: string, newDateTo?: string, newLocation?: string) => {
    router.get('/pos-cash-order-sales', {
      date_from: newDateFrom || dateFrom,
      date_to: newDateTo || dateTo,
      location_id: newLocation || selectedLocation,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateFrom(newDate);
    applyFilters(newDate, dateTo, selectedLocation);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateTo(newDate);
    applyFilters(dateFrom, newDate, selectedLocation);
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    applyFilters(dateFrom, dateTo, value);
  };

  const categoryData = Object.values(sales_per_category).map(c => ({
    name: c.name,
    value: c.percentage, 
    color: c.color,
    sales: c.sales
  }));

  const locationData = Object.values(sales_by_location).map(loc => ({
    id: loc.id,
    location: loc.name,
    revenue: loc.revenue
  }));

  return (
    <AppLayout>
      <Head title='POS Cash Order Sales'/>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Track your sales performance and revenue across all locations
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={handleDateFromChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={handleDateToChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={selectedLocation} onValueChange={handleLocationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id.toString()}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{total_sales.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{total_expense.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">₱{total_profit.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Category Sales Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sales by Category
              </CardTitle>
              <CardDescription>Distribution of sales across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value}% (₱${props.payload.sales.toLocaleString()})`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Location Revenue */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Revenue by Location
          </CardTitle>
          <CardDescription>Compare performance across branches</CardDescription>
        </CardHeader>
        <CardContent className="relative" style={{ overflow: 'visible' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} style={{ overflow: 'visible' }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="location" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                formatter={(value) => `₱${value.toLocaleString()}`}
              />
              <Bar 
                dataKey="revenue" 
                fill="hsl(var(--primary))" 
                radius={[8, 8, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
        </div>
      </div>
    </AppLayout>
  );
}