import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

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
  const { links, from, to, total, current_page, last_page } = data;

  if (last_page <= 1) return null;

  const handlePageChange = (url: string | null) => {
    if (!url) return;
    router.get(url, {}, { preserveState: true, preserveScroll: true });
  };

  const pageLinks = links.slice(1, -1);
  const firstPageUrl = links[0]?.url;
  const lastPageUrl = links[links.length - 1]?.url;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* Results info */}
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        {/* First page - Hidden on mobile */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:inline-flex"
          onClick={() => handlePageChange(firstPageUrl)}
          disabled={current_page === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(firstPageUrl)}
          disabled={current_page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageLinks.map((link, index) => {
            if (link.label === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-muted-foreground text-sm">
                  ...
                </span>
              );
            }

            return (
              <Button
                key={index}
                variant={link.active ? 'default' : 'outline'}
                size="sm"
                className="h-8 min-w-8 px-2 sm:px-3"
                onClick={() => handlePageChange(link.url)}
                disabled={link.active}
              >
                {link.label}
              </Button>
            );
          })}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(lastPageUrl)}
          disabled={current_page === last_page}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page - Hidden on mobile */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:inline-flex"
          onClick={() => handlePageChange(lastPageUrl)}
          disabled={current_page === last_page}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}