import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Package } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, toCategoryChartData } from './formatters';
import { SalesCategory } from './types';

type Props = {
    categories: Record<string, SalesCategory>;
};

export function CategorySalesChart({ categories }: Props) {
    const data = toCategoryChartData(categories);

    return (
        <Card className="min-w-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Sales by Category
                </CardTitle>
                <CardDescription>
                    Distribution of sales across product categories
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius="72%"
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, props) => [
                                    `${value}% (${formatCurrency(
                                        props.payload.sales,
                                    )})`,
                                    props.payload.name,
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
