import ModuleHeading from '@/components/cards/module-heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';

type PeopleColumn<TRecord> = {
    header: string;
    className?: string;
    cellClassName?: string;
    render: (record: TRecord) => ReactNode;
};

type PeopleIndexPageProps<TRecord extends { id: number | string }> = {
    title: string;
    description: string;
    records: Paginated<TRecord>;
    routeBase: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
    filters?: {
        search?: string | null;
    };
    columns: PeopleColumn<TRecord>[];
    action?: {
        label: string;
        href: string;
        can?: boolean;
    };
};

export default function PeopleIndexPage<
    TRecord extends { id: number | string },
>({
    title,
    description,
    records,
    routeBase,
    searchPlaceholder,
    emptyTitle,
    emptyDescription,
    filters,
    columns,
    action,
}: PeopleIndexPageProps<TRecord>) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const hasMounted = useRef(false);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        const timer = window.setTimeout(() => {
            router.get(routeBase, search ? { search } : {}, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [routeBase, search]);

    return (
        <AppLayout>
            <Head title={title} />
            <ModuleHeading title={title} description={description}>
                {action && action.can !== false && (
                    <Button
                        onClick={() => router.visit(action.href)}
                        className="min-h-11 w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {action.label}
                    </Button>
                )}
            </ModuleHeading>

            <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column.header}
                                            className={
                                                column.className ??
                                                'font-semibold'
                                            }
                                        >
                                            {column.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={100}
                                            className="h-56 w-full p-0 whitespace-normal"
                                        >
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                                                <Search className="mb-2 h-8 w-8" />
                                                <p className="font-medium">
                                                    {emptyTitle}
                                                </p>
                                                <p className="px-4 text-sm">
                                                    {emptyDescription}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.data.map((record) => (
                                        <TableRow
                                            key={record.id}
                                            className="transition-colors hover:bg-muted/50"
                                        >
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.header}
                                                    className={
                                                        column.cellClassName
                                                    }
                                                >
                                                    {column.render(record)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Pagination data={records} />
            </div>
        </AppLayout>
    );
}
