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

  // Don't render if there's only one page
  if (last_page <= 1) return null;

  const handlePageChange = (url: string | null) => {
    if (!url) return;
    router.get(url, {}, { preserveState: true, preserveScroll: true });
  };

  // Filter out "Previous" and "Next" from links for cleaner display
  const pageLinks = links.slice(1, -1);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(links[0]?.url)}
          disabled={current_page === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(links[0]?.url)}
          disabled={current_page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageLinks.map((link, index) => {
            if (link.label === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              );
            }

            return (
              <Button
                key={index}
                variant={link.active ? 'default' : 'outline'}
                size="sm"
                className="h-8 min-w-8 px-3"
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
          onClick={() => handlePageChange(links[links.length - 1]?.url)}
          disabled={current_page === last_page}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(links[links.length - 1]?.url)}
          disabled={current_page === last_page}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
