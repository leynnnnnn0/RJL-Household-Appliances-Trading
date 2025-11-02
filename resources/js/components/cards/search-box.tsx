import { Search } from 'lucide-react';

export default function SearchBox({children} : {children: React.ReactNode}) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                {children}
            </div>
        </div>
    );
}


