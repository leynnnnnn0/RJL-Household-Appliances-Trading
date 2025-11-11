import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package2, DollarSign, Users, UserCog, ShieldCheck, CreditCard } from 'lucide-react';



const COLORS = ['#8b5cf6', '#3b82f6', '#10b981'];

interface PageProps {
    srpTotal: string;
    unitTotalCost: string;
    customers: string;
    employees: string;
    users: string;
    marginPercent: string;
    potentialProfit: string;
    inventoryData: {
        category: string;
        srp: number;
        unitCost: number;
    }[]
}

export default function Index({inventoryData, potentialProfit, marginPercent, srpTotal, unitTotalCost, customers, employees, users} : PageProps) {
    console.log(inventoryData);
    return (
        <AppLayout>
            <Head title="Super Admin Dashboard" />
            
            <div className="min-h-screen">
                <div className="space-y-8 p-5">
                    
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold">
                            Dashboard Overview
                        </h1>
                        <p className="text-slate-600 text-lg">Real-time business metrics and analytics</p>
                    </div>

                            {/* User Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Customer Accounts
                                </CardTitle>
                                <Users className="h-6 w-6 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-blue-900 dark:text-blue-100">{customers}</div>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">Total registered customers</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-violet-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-violet-900 dark:text-violet-100">
                                    Employees
                                </CardTitle>
                                <UserCog className="h-6 w-6 text-violet-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-violet-900 dark:text-violet-100">{employees}</div>
                                <p className="text-sm text-violet-700 dark:text-violet-300 mt-2">Active staff members</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                    System Users
                                </CardTitle>
                                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-emerald-900 dark:text-emerald-100">{users}</div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-2">Users with access rights</p>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        <Card className="border-l-4 border-l-gray-500 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Inventory (SRP)
                                </CardTitle>
                                <DollarSign className="h-5 w-5 " />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">₱{srpTotal}</div>
                                <p className="text-xs text-slate-500 mt-1">Total retail value</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-gray-500 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Inventory (Cost)
                                </CardTitle>
                                <Package2 className="h-5 w-5" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">₱{unitTotalCost}</div>
                                <p className="text-xs text-slate-500 mt-1">Total unit cost</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-gray-500 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Profit Margin
                                </CardTitle>
                                <TrendingUp className="h-5 w-5 " />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{marginPercent}%</div>
                                <p className="text-xs text-slate-500 mt-1">₱{potentialProfit} potential profit</p>
                            </CardContent>
                        </Card>
                    </div>

                

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <Card className="lg:col-span-3 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl">Inventory Analysis by Category</CardTitle>
                                <p className="text-sm text-slate-600 dark:text-slate-400">SRP vs Unit Cost comparison</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={inventoryData} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="category" tick={{ fill: '#64748b' }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: '10px' }} />
                                        <Tooltip 
                                            formatter={(value) => `₱${value.toLocaleString()}`}
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="srp" fill="#3b82f6" name="SRP Value" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="unitCost" fill="#10b981" name="Unit Cost" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-xl">Category Distribution</CardTitle>
                                <p className="text-sm text-slate-600 dark:text-slate-400">By SRP value</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={inventoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="srp"
                                        >
                                            {inventoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                
                </div>
            </div>
        </AppLayout>
    );
}