import { Search } from 'lucide-react';

export function CreditOrderEmptyState() {
    return (
        <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
            <Search className="mb-2 h-10 w-10 opacity-25 sm:h-12 sm:w-12" />
            <p className="font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
        </div>
    );
}
