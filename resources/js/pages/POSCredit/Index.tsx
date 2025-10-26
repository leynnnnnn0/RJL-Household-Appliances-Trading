import { useState } from 'react';
import { Menu, Plus, X, Upload, FileText, Users, Briefcase, Home, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

interface PaymentPlan {
  months: number;
  interestRate: number;
}

export default function Index() {
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [customPlans, setCustomPlans] = useState<PaymentPlan[]>([
    { months: 3, interestRate: 20 },
    { months: 6, interestRate: 15 },
    { months: 9, interestRate: 10 },
    { months: 12, interestRate: 12 }
  ]);
  const [employmentVerified, setEmploymentVerified] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const calculateMonthlyPayment = (principal: number, months: number, rate: number) => {
    const monthlyRate = rate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Credit Approval System</h1>
              <p className="text-muted-foreground text-xs">Installment Setup</p>
            </div>
          </a>
          
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Quick Actions</SheetTitle>
                <SheetDescription>Manage applications and view history</SheetDescription>
              </SheetHeader>

              <div className="p-5 space-y-4">
   
                <Separator  />
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Today's Applications</h3>
                  <div className="space-y-2">
                    <Card className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Juan Dela Cruz</p>
                          <p className="text-xs text-muted-foreground">₱25,000 - 6 months</p>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Maria Santos</p>
                          <p className="text-xs text-muted-foreground">₱15,000 - 3 months</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Approved</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Credit Approval & Installment Setup</h2>
          <p className="text-muted-foreground">Complete the form to process a new installment application</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" placeholder="Juan Dela Cruz" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input id="contact" placeholder="0912 345 6789" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea 
                  id="address" 
                  placeholder="Street, Barangay, City, Province"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment">Employment/Source of Income *</Label>
                <Input id="employment" placeholder="Company name or business" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                  <Input id="income" type="number" placeholder="15,000" className="pl-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referencesss */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                References
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Reference 1</h3>
                <div className="space-y-2">
                  <Label htmlFor="ref1Name">Name *</Label>
                  <Input id="ref1Name" placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ref1Contact">Contact *</Label>
                  <Input id="ref1Contact" placeholder="0912 345 6789" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Reference 2</h3>
                <div className="space-y-2">
                  <Label htmlFor="ref2Name">Name *</Label>
                  <Input id="ref2Name" placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ref2Contact">Contact *</Label>
                  <Input id="ref2Contact" placeholder="0912 345 6789" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item & Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Item & Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Item Category *</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appliances">Appliances</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="gadgets">Gadgets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input id="itemName" placeholder="e.g. Samsung Refrigerator" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                  <Input id="sellingPrice" type="number" placeholder="25,000" className="pl-7" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="downPayment">Down Payment *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₱</span>
                  <Input id="downPayment" type="number" placeholder="5,000" className="pl-7" />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Payment Term *</Label>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Interest Rate Settings</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {customPlans.map((plan, index) => (
                      <Card key={index} className="p-3 cursor-pointer hover:border-primary transition-colors">
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">{plan.months}</p>
                          <p className="text-xs text-muted-foreground">months</p>
                          <p className="text-sm font-semibold text-primary">{plan.interestRate}% int.</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investigation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Investigation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visitDate">Home Visit Date *</Label>
                <Input id="visitDate" type="date" defaultValue="2025-10-25" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investigator">Investigator Name *</Label>
                <Input id="investigator" placeholder="Field staff name" />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="verified" 
                  checked={employmentVerified}
                  onCheckedChange={(checked) => setEmploymentVerified(checked as boolean)}
                />
                <Label 
                  htmlFor="verified" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Employment Verified
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Investigation Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add notes about the customer, home visit, references verification, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Documents
              </CardTitle>
              <CardDescription>Upload supporting documents (PNG, JPG, PDF up to 10MB each)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileUpload}
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({uploadedFiles.length})</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                          className="shrink-0"
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
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="lg">
            Save as Draft
          </Button>
          <Button size="lg" className="min-w-40">
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}