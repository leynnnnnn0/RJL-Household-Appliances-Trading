import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import * as React from 'react';

type SearchInputProps = Omit<
    React.ComponentProps<typeof Input>,
    'value' | 'onChange' | 'type'
> & {
    value: string;
    onChange: (value: string) => void;
    inputClassName?: string;
};

export function SearchInput({
    value,
    onChange,
    className,
    inputClassName,
    ...props
}: SearchInputProps) {
    const handleValue = (event: React.FormEvent<HTMLInputElement>) => {
        onChange(event.currentTarget.value);
    };

    return (
        <div className={cn('relative w-full', className)}>
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                {...props}
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onInput={handleValue}
                autoComplete={props.autoComplete ?? 'on'}
                className={cn('pl-9', inputClassName)}
            />
        </div>
    );
}
