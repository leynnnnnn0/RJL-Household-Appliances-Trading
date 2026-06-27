import { ChevronRight } from 'lucide-react';

export function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 border-b pb-2">
            <ChevronRight className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                {children}
            </h2>
        </div>
    );
}
