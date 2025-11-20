import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, router } from "@inertiajs/react";
import { toast } from "sonner";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, Eye, Download, Trash2 } from "lucide-react";
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface AdditionalDocument {
    id: number;
    customer_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    created_at: string;
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
    additional_documents?: AdditionalDocument[];
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    file: File;
}

interface EditProps {
    customer: Customer;
    employees: Employee[];
}

export default function Edit({ customer, employees }: EditProps) {
    const { data, setData, post, processing, errors } = useForm({
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
        new_documents: [] as File[],
        _method: 'PUT'
    });

    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                file: file
            }));
            setUploadedFiles([...uploadedFiles, ...newFiles]);
            setData('new_documents', [...data.new_documents, ...Array.from(files)]);
        }
    };

    const removeNewFile = (id: string) => {
        const updatedFiles = uploadedFiles.filter(file => file.id !== id);
        setUploadedFiles(updatedFiles);
        setData('new_documents', updatedFiles.map(f => f.file));
    };

    const handleDeleteDocument = (documentId: number) => {
        router.delete(route('customers.documents.destroy', { customer: customer.id, document: documentId }), {
            onSuccess: () => {
                toast.success("Document deleted successfully!");
                setDocumentToDelete(null);
            },
            onError: () => {
                toast.error("Failed to delete document.");
            }
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('image')) return '🖼️';
        return '📎';
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        post(route('customers.update', customer.id), {
            forceFormData: true,
            onSuccess: () => {
                toast.success("Customer updated successfully!");
                setUploadedFiles([]);
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

                    {/* Documents Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Additional Documents
                            </CardTitle>
                            <CardDescription>Upload or manage supporting documents</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Existing Documents */}
                            {customer.additional_documents && customer.additional_documents.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Existing Documents ({customer.additional_documents.length})</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {customer.additional_documents.map((doc) => (
                                            <div 
                                                key={doc.id} 
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="text-xl">
                                                        {getFileIcon(doc.mime_type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                            <span>{formatFileSize(doc.file_size)}</span>
                                                            <span>•</span>
                                                            <span>{formatDate(doc.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        asChild
                                                        className="h-8"
                                                    >
                                                        <a 
                                                            href={`/storage/${doc.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setDocumentToDelete(doc.id)}
                                                        className="h-8 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload New Documents */}
                            <div className="space-y-2">
                                <Label>Upload New Documents</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                                    <input
                                        type="file"
                                        id="fileUpload"
                                        className="hidden"
                                        multiple
                                        accept=".png,.jpg,.jpeg,.pdf"
                                        onChange={handleFileUpload}
                                    />
                                    <label htmlFor="fileUpload" className="cursor-pointer">
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="font-medium mb-1 text-sm">Click to upload or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                                    </label>
                                </div>
                            </div>

                            {/* New Files to Upload */}
                            {uploadedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <Label>New Files to Upload ({uploadedFiles.length})</Label>
                                    <div className="space-y-2">
                                        {uploadedFiles.map(file => (
                                            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeNewFile(file.id)}
                                                    className="shrink-0 h-8 w-8"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this document? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => documentToDelete && handleDeleteDocument(documentToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}