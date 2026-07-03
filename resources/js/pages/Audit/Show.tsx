import AuditEventBadge from '@/components/audits/audit-event-badge';
import {
    formatAuditDate,
    formatAuditValue,
    modelName,
} from '@/components/audits/audit-formatters';
import BackButton from '@/components/buttons/back-button';
import ModuleHeading from '@/components/cards/module-heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowUpRight, Database, Monitor, User } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuditDetail {
    id: number;
    event: string;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    auditable: {
        type: string | null;
        name: string;
        id: number | string | null;
    };
    old_values: Record<string, unknown>;
    new_values: Record<string, unknown>;
    url: string | null;
    ip_address: string | null;
    user_agent: string | null;
    tags: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface Props {
    audit: AuditDetail;
}

export default function Show({ audit }: Props) {
    const changes = getChanges(audit.old_values, audit.new_values);

    return (
        <AppLayout>
            <Head title={`Audit #${audit.id}`} />
            <ModuleHeading
                title={`Audit #${audit.id}`}
                description="Complete system activity details and recorded values"
            >
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <BackButton backUrl="/audits" label="Back to Audits" />
                    <Button asChild variant="outline">
                        <Link href="/audits">
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Audit List
                        </Link>
                    </Button>
                </div>
            </ModuleHeading>

            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Activity Summary
                            </CardTitle>
                            <CardDescription>
                                Who performed the action and which record was
                                affected.
                            </CardDescription>
                        </div>
                        <AuditEventBadge event={audit.event} />
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Detail
                            icon={<User className="h-4 w-4" />}
                            label="User"
                            value={
                                audit.user
                                    ? `${audit.user.name} (${audit.user.email})`
                                    : 'System'
                            }
                        />
                        <Detail
                            icon={<Database className="h-4 w-4" />}
                            label="Record"
                            value={`${audit.auditable.name || modelName(audit.auditable.type)} #${audit.auditable.id ?? '-'}`}
                        />
                        <Detail
                            label="Date"
                            value={formatAuditDate(audit.created_at)}
                        />
                        <Detail label="Tags" value={audit.tags || '-'} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Changed Values</CardTitle>
                        <CardDescription>
                            Before and after values captured by the audit log.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {changes.length === 0 ? (
                            <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
                                No field-level values were recorded for this
                                audit.
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto rounded-lg border md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-44">
                                                    Field
                                                </TableHead>
                                                <TableHead className="min-w-64">
                                                    Old Value
                                                </TableHead>
                                                <TableHead className="min-w-64">
                                                    New Value
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {changes.map((change) => (
                                                <TableRow key={change.field}>
                                                    <TableCell className="font-medium">
                                                        {change.field}
                                                    </TableCell>
                                                    <TableCell>
                                                        <ValueText
                                                            value={change.old}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <ValueText
                                                            value={change.new}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="space-y-3 md:hidden">
                                    {changes.map((change) => (
                                        <div
                                            key={change.field}
                                            className="rounded-lg border p-4"
                                        >
                                            <p className="font-semibold">
                                                {change.field}
                                            </p>
                                            <div className="mt-3 space-y-3 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        Old Value
                                                    </p>
                                                    <ValueText
                                                        value={change.old}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        New Value
                                                    </p>
                                                    <ValueText
                                                        value={change.new}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Request Context
                        </CardTitle>
                        <CardDescription>
                            Where the action came from when the event was
                            captured.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Detail
                                label="IP Address"
                                value={audit.ip_address || '-'}
                            />
                            <Detail
                                label="Auditable Type"
                                value={audit.auditable.type || '-'}
                            />
                        </div>
                        <Detail label="URL" value={audit.url || '-'} />
                        <Detail
                            label="User Agent"
                            value={audit.user_agent || '-'}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function Detail({
    icon,
    label,
    value,
}: {
    icon?: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0 rounded-lg border bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {icon}
                <span>{label}</span>
            </div>
            <p className="break-words font-semibold">{value}</p>
        </div>
    );
}

function ValueText({ value }: { value: unknown }) {
    const formattedValue = formatAuditValue(value);
    const isLong = formattedValue.length > 80 || formattedValue.includes('\n');

    if (isLong) {
        return (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-xs">
                {formattedValue}
            </pre>
        );
    }

    return <span className="break-words">{formattedValue}</span>;
}

function getChanges(
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
) {
    const fields = Array.from(
        new Set([...Object.keys(oldValues), ...Object.keys(newValues)]),
    );

    return fields.map((field) => ({
        field,
        old: oldValues[field],
        new: newValues[field],
    }));
}
