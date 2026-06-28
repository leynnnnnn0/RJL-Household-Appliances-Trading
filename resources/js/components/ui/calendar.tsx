import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

type CalendarProps = {
    selected?: Date;
    onSelect?: (date: Date) => void;
    month?: Date;
    onMonthChange?: (date: Date) => void;
    className?: string;
};

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function Calendar({
    selected,
    onSelect,
    month,
    onMonthChange,
    className,
}: CalendarProps) {
    const [internalMonth, setInternalMonth] = React.useState(
        month ?? selected ?? new Date(),
    );
    const visibleMonth = month ?? internalMonth;
    const year = visibleMonth.getFullYear();
    const monthIndex = visibleMonth.getMonth();

    const days = React.useMemo(() => {
        const firstDay = new Date(year, monthIndex, 1);
        const startOffset = firstDay.getDay();
        const totalDays = new Date(year, monthIndex + 1, 0).getDate();
        const cells: Array<Date | null> = Array.from(
            { length: startOffset },
            () => null,
        );

        for (let day = 1; day <= totalDays; day += 1) {
            cells.push(new Date(year, monthIndex, day));
        }

        while (cells.length % 7 !== 0) {
            cells.push(null);
        }

        return cells;
    }, [monthIndex, year]);

    const setVisibleMonth = (nextMonth: Date) => {
        setInternalMonth(nextMonth);
        onMonthChange?.(nextMonth);
    };

    const isSameDay = (date: Date) =>
        selected &&
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate();

    return (
        <div className={cn('w-[280px] p-3', className)}>
            <div className="mb-3 flex items-center justify-between">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                        setVisibleMonth(new Date(year, monthIndex - 1, 1))
                    }
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                    {visibleMonth.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                    })}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                        setVisibleMonth(new Date(year, monthIndex + 1, 1))
                    }
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {weekdays.map((day) => (
                    <div key={day} className="py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
                {days.map((date, index) =>
                    date ? (
                        <Button
                            key={date.toISOString()}
                            type="button"
                            variant={isSameDay(date) ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onSelect?.(date)}
                        >
                            {date.getDate()}
                        </Button>
                    ) : (
                        <div key={`empty-${index}`} className="h-8 w-8" />
                    ),
                )}
            </div>
        </div>
    );
}
