import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    links: PaginationLink[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}

interface PaginationProps {
    data: PaginationMeta;
}

export default function Pagination({ data }: PaginationProps) {
    const { from, to, total, current_page, last_page } = data;

    if (last_page <= 1) return null;

    const handlePageChange = (page: number) => {
        if (page < 1 || page > last_page || page === current_page) return;

        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());

        router.get(
            url.toString(),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [1];

        if (current_page > 2 && current_page < last_page - 1) {
            if (current_page > 3) pages.push('...');
            pages.push(current_page);
        }

        if (current_page < last_page - 2) pages.push('...');
        if (last_page > 1) pages.push(last_page);

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col items-center justify-between gap-3 px-0 py-4 sm:flex-row sm:gap-4 sm:px-2">
            <div className="order-2 text-center text-xs text-muted-foreground sm:order-1 sm:text-left sm:text-sm">
                Showing <span className="font-medium">{from}</span> to{' '}
                <span className="font-medium">{to}</span> of{' '}
                <span className="font-medium">{total}</span> results
            </div>

            <div className="order-1 flex max-w-full items-center gap-1 overflow-x-auto sm:order-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="hidden h-10 w-10 shrink-0 sm:inline-flex"
                    onClick={() => handlePageChange(1)}
                    disabled={current_page === 1}
                    aria-label="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => handlePageChange(current_page - 1)}
                    disabled={current_page === 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                    {pageNumbers.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-1 text-sm text-muted-foreground sm:px-2"
                                >
                                    ...
                                </span>
                            );
                        }

                        const pageNum = page as number;
                        const isActive = pageNum === current_page;

                        return (
                            <Button
                                key={pageNum}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                className="h-10 min-w-10 shrink-0 px-3 text-sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={isActive}
                                aria-label={`Page ${pageNum}`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => handlePageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="hidden h-10 w-10 shrink-0 sm:inline-flex"
                    onClick={() => handlePageChange(last_page)}
                    disabled={current_page === last_page}
                    aria-label="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
