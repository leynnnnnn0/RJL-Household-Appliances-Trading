import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatCurrency, toLocationChartData } from './formatters';
import { SalesLocation } from './types';

type Props = {
    locations: Record<string, SalesLocation>;
};

export function LocationRevenueChart({ locations }: Props) {
    const data = toLocationChartData(locations);

    return (
        <Card className="min-w-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Revenue by Location
                </CardTitle>
                <CardDescription>
                    Compare performance across branches
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] w-full overflow-x-auto sm:h-[320px]">
                    <div className="h-full min-w-[520px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                />
                                <XAxis
                                    dataKey="location"
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                    height={70}
                                    className="text-muted-foreground"
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    className="text-muted-foreground"
                                />
                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(value as number)
                                    }
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="hsl(var(--primary))"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
