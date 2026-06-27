import { Card, CardContent } from '@/components/ui/card';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { chartColors, compactPeso, formatPeso } from './formatters';
import { SectionTitle } from './section-title';

export function MonthlyTrendChart({
    monthlyTrend,
}: {
    monthlyTrend: { month: string; expected: number; collected: number }[];
}) {
    return (
        <Card>
            <CardContent className="p-4 sm:p-5">
                <SectionTitle>6-Month Expected vs Collected</SectionTitle>
                <div className="mt-4 min-w-0">
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart
                            data={monthlyTrend}
                            margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                            />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={compactPeso}
                            />
                            <Tooltip
                                formatter={(value: number) => formatPeso(value)}
                            />
                            <Legend iconType="circle" iconSize={8} />
                            <Line
                                type="monotone"
                                dataKey="expected"
                                name="Expected"
                                stroke={chartColors.expected}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                                strokeDasharray="5 3"
                            />
                            <Line
                                type="monotone"
                                dataKey="collected"
                                name="Collected"
                                stroke={chartColors.collected}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
