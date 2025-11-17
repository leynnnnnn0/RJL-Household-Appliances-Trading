import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, router } from "@inertiajs/react";
import { toast } from "sonner";
import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerReference {
    id?: number;
    full_name: string;
    phone_number: string;
}

interface InvestigationDetail {
    id?: number;
    employee_id: string;
    home_visit_date: string;
    is_employment_verified: boolean;
    investigation_notes: string;
}

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    address: string;
    city: string;
    province: string;
    zipcode: string | null;
    country: string;
    phone_number: string | null;
    customer_reference: CustomerReference | null;
    investigation_detail: InvestigationDetail | null;
}

interface EditProps {
    customer: Customer;
    employees: Employee[]
}

export default function Edit({ customer, employees }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        email: customer.email || "",
        address: customer.address || "",
        city: customer.city || "",
        province: customer.province || "",
        zipcode: customer.zipcode || "",
        country: customer.country || "",
        phone_number: customer.phone_number || "",
        reference_full_name: customer.customer_reference?.full_name || "",
        reference_phone_number: customer.customer_reference?.phone_number || "",
        employee_id: customer.investigation_detail?.employee_id.toString() || "",
        home_visit_date: customer.investigation_detail?.home_visit_date || "",
        is_employment_verified: customer.investigation_detail?.is_employment_verified || false,
        investigation_notes: customer.investigation_detail?.investigation_notes || "",
    });

    console.log(customer);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        put(route('customers.update', customer.id), {
            onSuccess: () => {
                toast.success("Customer updated successfully!");
            },
            onError: () => {
                toast.error("Failed to update customer. Please check the form.");
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Edit Customer Details" />

            <ModuleHeading 
                title="Edit Customer Details" 
                description="Fill up all the required fields" 
            />

            <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                            <CardDescription>Update the customer's basic details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">
                                        First Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData("first_name", e.target.value)}
                                        
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-red-500">{errors.first_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">
                                        Last Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData("last_name", e.target.value)}
                                        
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-red-500">{errors.last_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">Phone Number</Label>
                                    <Input
                                        id="phone_number"
                                        type="tel"
                                        value={data.phone_number}
                                        onChange={(e) => setData("phone_number", e.target.value)}
                                    />
                                    {errors.phone_number && (
                                        <p className="text-sm text-red-500">{errors.phone_number}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">
                                        Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-500">{errors.address}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">
                                        City <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData("city", e.target.value)}
                                        
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-red-500">{errors.city}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="province">
                                        Province <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="province"
                                        type="text"
                                        value={data.province}
                                        onChange={(e) => setData("province", e.target.value)}
                                        
                                    />
                                    {errors.province && (
                                        <p className="text-sm text-red-500">{errors.province}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zipcode">Zip Code</Label>
                                    <Input
                                        id="zipcode"
                                        type="text"
                                        value={data.zipcode}
                                        onChange={(e) => setData("zipcode", e.target.value)}
                                    />
                                    {errors.zipcode && (
                                        <p className="text-sm text-red-500">{errors.zipcode}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">
                                        Country <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="country"
                                        type="text"
                                        value={data.country}
                                        onChange={(e) => setData("country", e.target.value)}
                                        
                                    />
                                    {errors.country && (
                                        <p className="text-sm text-red-500">{errors.country}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Reference */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Reference</CardTitle>
                            <CardDescription>Reference contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reference_full_name">
                                        Reference Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="reference_full_name"
                                        type="text"
                                        value={data.reference_full_name}
                                        onChange={(e) => setData("reference_full_name", e.target.value)}
                                        
                                    />
                                    {errors.reference_full_name && (
                                        <p className="text-sm text-red-500">{errors.reference_full_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference_phone_number">
                                        Reference Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="reference_phone_number"
                                        type="tel"
                                        value={data.reference_phone_number}
                                        onChange={(e) => setData("reference_phone_number", e.target.value)}
                                        
                                    />
                                    {errors.reference_phone_number && (
                                        <p className="text-sm text-red-500">{errors.reference_phone_number}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Investigation Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Investigation Details</CardTitle>
                            <CardDescription>Investigation and verification information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                     <Label htmlFor="investigator">Investigator Name *</Label>
                  <Select value={data.employee_id} onValueChange={value => setData("employee_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investigator" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                                    {errors.employee_id && (
                                        <p className="text-sm text-red-500">{errors.employee_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="home_visit_date">
                                        Home Visit Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="home_visit_date"
                                        type="date"
                                        value={data.home_visit_date}
                                        onChange={(e) => setData("home_visit_date", e.target.value)}
                                        
                                    />
                                    {errors.home_visit_date && (
                                        <p className="text-sm text-red-500">{errors.home_visit_date}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 md:col-span-2">
                                    <Checkbox
                                        id="is_employment_verified"
                                        checked={data.is_employment_verified}
                                        onCheckedChange={(checked) => setData("is_employment_verified", checked as boolean)}
                                    />
                                    <Label 
                                        htmlFor="is_employment_verified" 
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Employment Verified
                                    </Label>
                                    {errors.is_employment_verified && (
                                        <p className="text-sm text-red-500">{errors.is_employment_verified}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="investigation_notes">
                                        Investigation Notes <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="investigation_notes"
                                        value={data.investigation_notes}
                                        onChange={(e) => setData("investigation_notes", e.target.value)}
                                        rows={4}
                                        
                                    />
                                    {errors.investigation_notes && (
                                        <p className="text-sm text-red-500">{errors.investigation_notes}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('customers.index'))}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? "Updating..." : "Update Customer"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}