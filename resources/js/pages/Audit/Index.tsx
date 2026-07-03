import AuditEventBadge from '@/components/audits/audit-event-badge';
import {
    formatAuditDate,
    modelName,
    titleCase,
} from '@/components/audits/audit-formatters';
import ModuleHeading from '@/components/cards/module-heading';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchInput } from '@/components/ui/search-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface AuditRecord {
    id: number;
    event: string;
    user: string;
    auditable_type: string;
    auditable_name: string;
    auditable_id: number | string;
    change_count: number;
    url: string | null;
    ip_address: string | null;
    user_agent: string | null;
    tags: string | null;
    created_at: string | null;
}

interface Props {
    audits: Paginated<AuditRecord>;
    filters: {
        search?: string;
        event?: string;
        auditable_type?: string;
    };
    events: string[];
    auditableTypes: string[];
}

export default function Index({
    audits,
    filters,
    events,
    auditableTypes,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [event, setEvent] = useState(filters.event || 'all');
    const [auditableType, setAuditableType] = useState(
        filters.auditable_type || 'all',
    );

    const query = useMemo(
        () => ({
            ...(search ? { search } : {}),
            ...(event !== 'all' ? { event } : {}),
            ...(auditableType !== 'all'
                ? { auditable_type: auditableType }
                : {}),
        }),
        [search, event, auditableType],
    );

    useEffect(() => {
        const timer = window.setTimeout(() => {
            router.get('/audits', query, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [query]);

    return (
        <AppLayout>
            <Head title="Audits" />
            <ModuleHeading
                title="Audits"
                description="Review system activity, data changes, and authentication events"
            />

            <div className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_220px_260px]">
                    <SearchInput
                        placeholder="Search audits..."
                        value={search}
                        onChange={setSearch}
                    />
                    <Select value={event} onValueChange={setEvent}>
                        <SelectTrigger>
                            <SelectValue placeholder="Event" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            {events.map((eventName) => (
                                <SelectItem key={eventName} value={eventName}>
                                    {titleCase(eventName)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={auditableType}
                        onValueChange={setAuditableType}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Models</SelectItem>
                            {auditableTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {modelName(type)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="hidden overflow-hidden rounded-lg border bg-white md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Record</TableHead>
                                <TableHead>Changes</TableHead>
                                <TableHead>IP</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {audits.data.length === 0 ? (
                                <EmptyAuditRow />
                            ) : (
                                audits.data.map((audit) => (
                                    <TableRow key={audit.id}>
                                        <TableCell>
                                            <AuditEventBadge
                                                event={audit.event}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {audit.user}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {audit.auditable_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    #{audit.auditable_id}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <ChangeSummary audit={audit} />
                                        </TableCell>
                                        <TableCell>
                                            {audit.ip_address || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {formatAuditDate(audit.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Link
                                                    href={`/audits/${audit.id}`}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="space-y-3 md:hidden">
                    {audits.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                                    <Search className="h-8 w-8" />
                                    <p className="font-medium">
                                        No audits found
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        audits.data.map((audit) => (
                            <Card key={audit.id}>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold">
                                                {audit.auditable_name} #
                                                {audit.auditable_id}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {audit.user} ·{' '}
                                                {formatAuditDate(
                                                    audit.created_at,
                                                )}
                                            </p>
                                        </div>
                                        <AuditEventBadge event={audit.event} />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                                        <ChangeSummary audit={audit} />
                                        <span>
                                            {audit.ip_address ||
                                                'No IP recorded'}
                                        </span>
                                    </div>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link href={`/audits/${audit.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <Pagination data={audits} />
            </div>
        </AppLayout>
    );
}

function EmptyAuditRow() {
    return (
        <TableRow>
            <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                No audits found
            </TableCell>
        </TableRow>
    );
}

function ChangeSummary({ audit }: { audit: AuditRecord }) {
    return (
        <span className="text-sm text-muted-foreground">
            {audit.change_count > 0
                ? `${audit.change_count} changed ${audit.change_count === 1 ? 'field' : 'fields'}`
                : 'No value changes'}
        </span>
    );
}
