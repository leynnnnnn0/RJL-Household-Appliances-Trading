import { Card, CardContent } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { chartColors } from './formatters';
import { SectionTitle } from './section-title';
import { PortfolioSummary } from './types';

export function AccountStatusChart({
    portfolio,
}: {
    portfolio: PortfolioSummary;
}) {
    const data = [
        {
            name: 'Active',
            value: portfolio.active_accounts,
            fill: chartColors.active,
        },
        {
            name: 'Completed',
            value: portfolio.completed_accounts,
            fill: chartColors.completed,
        },
        {
            name: 'Defaulted',
            value: portfolio.defaulted_accounts,
            fill: chartColors.defaulted,
        },
    ];

    return (
        <Card>
            <CardContent className="p-4 sm:p-5">
                <SectionTitle>Account Status Distribution</SectionTitle>
                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                dataKey="value"
                                paddingAngle={3}
                            >
                                {data.map((item) => (
                                    <Cell key={item.name} fill={item.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) =>
                                    `${value} accounts`
                                }
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3 text-sm">
                        {data.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-2"
                            >
                                <span
                                    className="inline-block h-3 w-3 rounded-full"
                                    style={{ background: item.fill }}
                                />
                                <span className="text-muted-foreground">
                                    {item.name}
                                </span>
                                <span className="ml-auto font-bold">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
