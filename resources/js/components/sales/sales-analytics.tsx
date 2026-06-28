import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { compactPeso, formatPeso } from './formatters';
import type { SalesAnalytics } from './types';

const categoryColors = ['#111827', '#16a34a', '#f59e0b', '#dc2626'];

export function SalesAnalyticsCards({ analytics }: { analytics: SalesAnalytics }) {
    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
                <CardHeader>
                    <AnalyticsTitle
                        title="Monthly Customer Demand"
                        tooltip="Shows how many new installment accounts and how much installment sales volume each month produced."
                    />
                    <CardDescription>New installment accounts and sales volume by month</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.monthly_trend} margin={{ left: 0, right: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="left" tickFormatter={(value) => Number(value).toLocaleString('en-PH')} tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="right" orientation="right" tickFormatter={compactPeso} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    formatter={(value: number, name) =>
                                        name === 'Sales'
                                            ? formatPeso(value)
                                            : Number(value).toLocaleString('en-PH')
                                    }
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="accounts" name="Accounts" stroke="#111827" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="sales" name="Sales" stroke="#16a34a" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <AnalyticsTitle
                        title="Best Selling Categories"
                        tooltip="Ranks item categories by installment sale amount for the selected branch/date filter."
                    />
                    <CardDescription>Sales and units sold by item type</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.category_sales} margin={{ left: 0, right: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                                <YAxis tickFormatter={compactPeso} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value: number) => formatPeso(value)} />
                                <Bar dataKey="sales" name="Sales">
                                    {analytics.category_sales.map((entry, index) => (
                                        <Cell key={entry.type} fill={categoryColors[index % categoryColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="xl:col-span-2">
                <CardHeader>
                    <AnalyticsTitle
                        title="Decision Notes"
                        tooltip="Highlights quick business signals from the filtered historical data."
                    />
                    <CardDescription>Quick signals based on the filtered historical data</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-semibold text-muted-foreground">Best Month</p>
                        <p className="mt-2 text-xl font-bold">{analytics.insights.best_month?.month ?? 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{analytics.insights.best_month?.accounts ?? 0} accounts</p>
                    </div>
                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-semibold text-muted-foreground">Worst Active Month</p>
                        <p className="mt-2 text-xl font-bold">{analytics.insights.worst_month?.month ?? 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{analytics.insights.worst_month?.accounts ?? 0} accounts</p>
                    </div>
                    <div className="rounded-xl border p-4">
                        <p className="text-sm font-semibold text-muted-foreground">Top Category</p>
                        <p className="mt-2 text-xl font-bold">{analytics.insights.top_category?.type ?? 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{formatPeso(analytics.insights.top_category?.sales ?? 0)} sales</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function AnalyticsTitle({ title, tooltip }: { title: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <CardTitle>{title}</CardTitle>
            <UiTooltip>
                <TooltipTrigger type="button" className="text-muted-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </UiTooltip>
        </div>
    );
}
