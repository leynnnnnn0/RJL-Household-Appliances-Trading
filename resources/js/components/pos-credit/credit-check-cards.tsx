import type { Customer, Employee } from '@/components/pos-credit/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PHPhoneInput } from '@/components/ui/ph-phone-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Home, Users } from 'lucide-react';

interface CreditCheckCardsProps {
    selectedCustomer: Customer | null;
    employees: Employee[];
    ref1Name: string;
    ref1Contact: string;
    visitDate: string;
    investigatorId: string;
    employmentVerified: boolean;
    investigationNotes: string;
    idPresented: string;
    idNumber: string;
    civilStatus: string;
    spouseName: string;
    spouseContactNumber: string;
    onRefNameChange: (value: string) => void;
    onRefContactChange: (value: string) => void;
    onVisitDateChange: (value: string) => void;
    onInvestigatorChange: (value: string) => void;
    onEmploymentVerifiedChange: (checked: boolean) => void;
    onInvestigationNotesChange: (value: string) => void;
    onIdPresentedChange: (value: string) => void;
    onIdNumberChange: (value: string) => void;
    onCivilStatusChange: (value: string) => void;
    onSpouseNameChange: (value: string) => void;
    onSpouseContactNumberChange: (value: string) => void;
}

export function CreditCheckCards({
    selectedCustomer,
    employees,
    ref1Name,
    ref1Contact,
    visitDate,
    investigatorId,
    employmentVerified,
    investigationNotes,
    idPresented,
    idNumber,
    civilStatus,
    spouseName,
    spouseContactNumber,
    onRefNameChange,
    onRefContactChange,
    onVisitDateChange,
    onInvestigatorChange,
    onEmploymentVerifiedChange,
    onInvestigationNotesChange,
    onIdPresentedChange,
    onIdNumberChange,
    onCivilStatusChange,
    onSpouseNameChange,
    onSpouseContactNumberChange,
}: CreditCheckCardsProps) {
    const investigation = selectedCustomer?.investigation_detail;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Reference
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <TextField
                        id="ref1Name"
                        label="Name *"
                        placeholder="Full name"
                        value={ref1Name}
                        disabled={
                            selectedCustomer?.reference?.full_name != null
                        }
                        onChange={onRefNameChange}
                    />
                    <PhoneField
                        id="ref1Contact"
                        label="Contact *"
                        value={ref1Contact}
                        disabled={
                            selectedCustomer?.reference?.phone_number != null
                        }
                        onChange={onRefContactChange}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Investigation Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DateField
                        id="visitDate"
                        label="Home Visit Date *"
                        value={visitDate}
                        disabled={investigation?.home_visit_date != null}
                        onChange={onVisitDateChange}
                    />

                    <div className="space-y-2">
                        <Label htmlFor="investigator">
                            Investigator Name *
                        </Label>
                        <Select
                            disabled={investigation?.employee_id != null}
                            value={investigatorId}
                            onValueChange={onInvestigatorChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select investigator" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem
                                        key={employee.id}
                                        value={employee.id.toString()}
                                    >
                                        {employee.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            disabled={
                                investigation?.is_employment_verified != null
                            }
                            id="verified"
                            checked={employmentVerified}
                            onCheckedChange={onEmploymentVerifiedChange}
                        />
                        <Label
                            htmlFor="verified"
                            className="cursor-pointer text-sm font-normal"
                        >
                            Employment Verified
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Investigation Notes</Label>
                        <Textarea
                            disabled={
                                investigation?.investigation_notes != null
                            }
                            id="notes"
                            placeholder="Add notes about the customer, home visit, references verification, etc."
                            rows={4}
                            value={investigationNotes}
                            onChange={(event) =>
                                onInvestigationNotesChange(event.target.value)
                            }
                        />
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            id="idPresented"
                            label="ID Presented"
                            placeholder="e.g., Driver's License"
                            value={idPresented}
                            disabled={investigation?.id_presented != null}
                            onChange={onIdPresentedChange}
                        />
                        <TextField
                            id="idNumber"
                            label="ID Number"
                            placeholder="Enter ID number"
                            value={idNumber}
                            disabled={investigation?.id_number != null}
                            onChange={onIdNumberChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="civilStatus">Civil Status</Label>
                        <Select
                            disabled={investigation?.civil_status != null}
                            value={civilStatus}
                            onValueChange={onCivilStatusChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select civil status" />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    'Single',
                                    'Married',
                                    'Widowed',
                                    'Separated',
                                    'Divorced',
                                ].map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {civilStatus === 'Married' && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                                id="spouseName"
                                label="Spouse Name"
                                placeholder="Enter spouse name"
                                value={spouseName}
                                disabled={investigation?.spouse_name != null}
                                onChange={onSpouseNameChange}
                            />
                            <PhoneField
                                id="spouseContactNumber"
                                label="Spouse Contact Number"
                                value={spouseContactNumber}
                                disabled={
                                    investigation?.spouse_contact_number != null
                                }
                                onChange={onSpouseContactNumberChange}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function PhoneField({
    id,
    label,
    value,
    disabled,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <PHPhoneInput
                id={id}
                value={value}
                disabled={disabled}
                onChange={onChange}
            />
        </div>
    );
}

function DateField({
    id,
    label,
    value,
    disabled,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <DatePicker
                id={id}
                value={value}
                disabled={disabled}
                onChange={onChange}
            />
        </div>
    );
}

function TextField({
    id,
    label,
    placeholder,
    value,
    disabled,
    type = 'text',
    onChange,
}: {
    id: string;
    label: string;
    placeholder?: string;
    value: string;
    disabled?: boolean;
    type?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                disabled={disabled}
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}
