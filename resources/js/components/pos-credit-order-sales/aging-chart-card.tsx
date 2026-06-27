import { Card, CardContent } from '@/components/ui/card';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { chartColors, compactPeso, formatPeso } from './formatters';
import { SectionTitle } from './section-title';
import { AgingBuckets } from './types';

const agingLabels = [
    'Current',
    '1-30 Days',
    '31-60 Days',
    '61-90 Days',
    '90+ Days',
];
const agingKeys = [
    'current',
    '30_days',
    '60_days',
    '90_days',
    '90_plus_days',
] as const;

export function AgingChartCard({
    title,
    description,
    buckets,
    totalLabel,
    totalClassName,
}: {
    title: string;
    description: string;
    buckets: AgingBuckets;
    totalLabel: string;
    totalClassName: string;
}) {
    const data = agingKeys.map((key, index) => ({
        name: agingLabels[index],
        amount: buckets[key],
        fill: chartColors.aging[index],
    }));

    return (
        <Card>
            <CardContent className="p-4 sm:p-5">
                <SectionTitle>{title}</SectionTitle>
                <p className="mt-2 mb-3 text-xs text-muted-foreground">
                    {description}
                </p>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} barSize={32}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                        />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis
                            tick={{ fontSize: 10 }}
                            tickFormatter={compactPeso}
                        />
                        <Tooltip
                            formatter={(value: number) => formatPeso(value)}
                        />
                        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                            {data.map((item) => (
                                <Cell key={item.name} fill={item.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                    {data.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between gap-3 text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                    style={{ background: item.fill }}
                                />
                                <span className="text-muted-foreground">
                                    {item.name}
                                </span>
                            </div>
                            <span className="font-semibold break-words">
                                {formatPeso(item.amount)}
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between gap-3 border-t pt-2 text-sm font-bold">
                        <span>{totalLabel}</span>
                        <span className={totalClassName}>
                            {formatPeso(buckets.total)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
