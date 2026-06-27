import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export function StatCard({
    label,
    value,
    sub,
    accent,
    icon: Icon,
}: {
    label: string;
    value: string;
    sub?: string;
    accent?: string;
    icon?: LucideIcon;
}) {
    return (
        <Card>
            <CardContent className="p-4 sm:p-5">
                <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        {label}
                    </p>
                    {Icon && (
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                </div>
                <p
                    className={`text-xl font-bold tracking-tight break-words sm:text-2xl ${accent ?? ''}`}
                >
                    {value}
                </p>
                {sub && (
                    <p className="mt-1 text-xs break-words text-muted-foreground">
                        {sub}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
