import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { router } from '@inertiajs/react';
import { HelpCircle } from 'lucide-react';
import { salesQueryString } from './formatters';
import type { SalesBranch, SalesFilters } from './types';

interface SalesFiltersProps {
    branches: SalesBranch[];
    filters: SalesFilters;
}

export function SalesFiltersCard({ branches, filters }: SalesFiltersProps) {
    const applyFilter = (key: keyof SalesFilters, value: string) => {
        router.get(
            '/sales',
            {
                ...filters,
                [key]: value,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const downloadAllUrl = `/sales/aging/download-pdf?${salesQueryString(filters, { bucket: 'all' })}`;

    return (
        <Card>
            <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <FilterLabel
                        htmlFor="sales-as-of-date"
                        label="Report Date"
                        tooltip="The report is calculated as of this date. By default, Sales opens on the 7th day of the current month."
                    />
                    <DatePicker
                        id="sales-as-of-date"
                        value={filters.as_of_date}
                        onChange={(value) => applyFilter('as_of_date', value)}
                    />
                </div>
                <div>
                    <FilterLabel label="Branch" tooltip="Limits receivables, collections, and analytics to one business branch." />
                    <Select value={filters.branch_id} onValueChange={(value) => applyFilter('branch_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="All branches" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Branches</SelectItem>
                            {branches.map((branch) => (
                                <SelectItem key={branch.id} value={String(branch.id)}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <FilterLabel label="Item Type" tooltip="Filters accounts and analytics by the primary item category." />
                    <Select value={filters.item_type} onValueChange={(value) => applyFilter('item_type', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="All item types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="appliances">Appliances</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="gadgets">Gadgets</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button asChild className="w-full">
                        <a href={downloadAllUrl}>Download All PDF</a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function FilterLabel({
    htmlFor,
    label,
    tooltip,
}: {
    htmlFor?: string;
    label: string;
    tooltip: string;
}) {
    return (
        <div className="mb-2 flex items-center gap-1.5">
            <Label htmlFor={htmlFor} className="font-semibold">
                {label}
            </Label>
            <Tooltip>
                <TooltipTrigger type="button" className="text-muted-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
        </div>
    );
}
