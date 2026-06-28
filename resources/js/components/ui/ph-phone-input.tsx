import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Smartphone } from 'lucide-react';
import * as React from 'react';

type PHPhoneInputProps = Omit<
    React.ComponentProps<typeof Input>,
    'value' | 'onChange'
> & {
    value: string;
    onChange: (value: string) => void;
};

export function PHPhoneInput({
    value,
    onChange,
    className,
    ...props
}: PHPhoneInputProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const digits = event.target.value.replace(/\D/g, '').slice(0, 11);
        onChange(digits);
    };

    return (
        <div className="relative">
            <Smartphone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                {...props}
                type="tel"
                inputMode="numeric"
                maxLength={11}
                pattern="09[0-9]{9}"
                autoComplete="tel-national"
                value={value}
                onChange={handleChange}
                placeholder={props.placeholder ?? '09XXXXXXXXX'}
                className={cn('pl-9', className)}
            />
        </div>
    );
}
