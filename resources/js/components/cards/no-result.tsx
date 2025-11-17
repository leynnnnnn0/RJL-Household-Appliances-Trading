import { Search } from 'lucide-react';
import { TableCell, TableRow } from '../ui/table';

export default function NoResult({ count }: { count: number }) {
    return (
        <TableRow>
            <TableCell colSpan={count} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="mb-2 h-8 w-8" />
                    <p className="font-medium">No data found</p>
                    <p className="text-sm">
                        There is no data to show for this.
                    </p>
                </div>
            </TableCell>
        </TableRow>
    );
}
