import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import type { DashboardBranchOption } from './collection-dashboard-types';

interface CollectionFilterCardProps {
    branches: DashboardBranchOption[];
    fromDate: string;
    selectedBranch: string;
    toDate: string;
    onApply: () => void;
    onFromDateChange: (value: string) => void;
    onSelectedBranchChange: (value: string) => void;
    onToDateChange: (value: string) => void;
}

const branchLabel = (branch: DashboardBranchOption) => branch.name ?? branch.full_name ?? `Branch #${branch.id}`;

export function CollectionFilterCard({
    branches,
    fromDate,
    selectedBranch,
    toDate,
    onApply,
    onFromDateChange,
    onSelectedBranchChange,
    onToDateChange,
}: CollectionFilterCardProps) {
    return (
        <Card className="rounded-2xl border-slate-200 shadow-lg">
            <CardHeader className="rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Filter className="h-5 w-5" />
                    Filter Options
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                        <Label htmlFor="fromDate" className="mb-2 block font-semibold text-slate-700">
                            From Date
                        </Label>
                        <DatePicker id="fromDate" value={fromDate} onChange={onFromDateChange} className="w-full" />
                    </div>
                    <div>
                        <Label htmlFor="toDate" className="mb-2 block font-semibold text-slate-700">
                            To Date
                        </Label>
                        <DatePicker id="toDate" value={toDate} onChange={onToDateChange} className="w-full" />
                    </div>
                    <div>
                        <Label htmlFor="branch" className="mb-2 block font-semibold text-slate-700">
                            Branch
                        </Label>
                        <Select value={selectedBranch} onValueChange={onSelectedBranchChange}>
                            <SelectTrigger id="branch" className="w-full">
                                <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Branches</SelectItem>
                                {branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                        {branchLabel(branch)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button onClick={onApply} className="w-full bg-slate-800 font-semibold text-white hover:bg-slate-900">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
