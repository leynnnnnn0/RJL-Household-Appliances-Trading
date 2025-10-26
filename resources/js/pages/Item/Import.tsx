import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, router } from "@inertiajs/react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Item } from "@/types";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportProps {
    items?: any[];
}

export default function Import({items} : ImportProps) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        file: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
        }
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('items.import.upload'), {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
            onError: (errors) => {
                console.error(errors);
            }
        });
    };

    const handleSave = () => {
        router.post(route('items.import.save'));
    };

    const handleCancel = () => {
        router.post(route('items.import.cancel'));
    };

    return <AppLayout>
        <Head title="Import Items" />

         <ModuleHeading title="Import Items from Excel" description="Use the provided excel format">
                <div className="flex gap-2">
                    {items && items.length > 0 && (
                        <>
                            <Button 
                                variant="outline" 
                                onClick={handleCancel}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSave}
                                className="cursor-pointer bg-green-600 hover:bg-green-700"
                            >
                                Save to Database ({items.length} items)
                            </Button>
                        </>
                    )}
                    
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer">Import</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleImport}>
                                <DialogHeader>
                                    <DialogTitle>Import Data</DialogTitle>
                                    <DialogDescription>
                                        Please make sure your excel file follows the correct format.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-3 py-4">
                                    <Label htmlFor="file">Excel File</Label>
                                    <Input 
                                        id="file" 
                                        type="file" 
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        required
                                    />
                                    <a 
                                        href={route('items.export.template')} 
                                        className="underline text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Download Template Format
                                    </a>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing || !data.file}>
                                        {processing ? 'Importing...' : 'Import'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
         </ModuleHeading>

         {items && items.length > 0 && (
             <Alert className="mb-4 bg-blue-50 border-blue-200">
                 <AlertDescription>
                     Preview: {items.length} items imported. Review the data below and click "Save to Database" to confirm.
                 </AlertDescription>
             </Alert>
         )}

         <div className="rounded-lg overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                  <TableHead className="font-light text-[10px]">Row</TableHead>
                    <TableHead className="font-light text-[10px]">Category</TableHead>
                    <TableHead className="font-light text-[10px]">Location ID</TableHead>
                    <TableHead className="font-light text-[10px]">DR Number</TableHead>
                    <TableHead className="font-light text-[10px]">Supplier</TableHead>
                    <TableHead className="font-light text-[10px]">Description</TableHead>
                    <TableHead className="font-light text-[10px]">Model</TableHead>
                    <TableHead className="font-light text-[10px]">Serial</TableHead>
                    <TableHead className="font-light text-[10px]">Quantity</TableHead>
                    <TableHead className="font-light text-[10px]">SRP</TableHead>
                    <TableHead className="font-light text-[10px]">Unit Cost</TableHead>
                    <TableHead className="font-light text-[10px]">Date of Purchase</TableHead>
                    <TableHead className="font-light text-[10px]">Date Out</TableHead>
                    <TableHead className="font-light text-[10px]">Size</TableHead>
                    <TableHead className="font-light text-[10px]">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {!items || items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={14} className="text-center py-10 text-gray-500">
                                Import data to see items here.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item, index) => (
                            <TableRow key={index}>
                                   <TableCell className="text-[10px]">{item.row_number}</TableCell>
                                <TableCell className="text-[10px]">{item.category}</TableCell>
                                <TableCell className="text-[10px]">{item.location_id}</TableCell>
                                <TableCell className="text-[10px]">{item.dr_no}</TableCell>
                                <TableCell className="text-[10px]">{item.supplier}</TableCell>
                                <TableCell className="text-[10px]">{item.description}</TableCell>
                                <TableCell className="text-[10px]">{item.model}</TableCell>
                                <TableCell className="text-[10px]">{item.serial}</TableCell>
                                <TableCell className="text-[10px]">{item.quantity}</TableCell>
                                <TableCell className="text-[10px]">{item.srp}</TableCell>
                                <TableCell className="text-[10px]">{item.unit_cost}</TableCell>
                                <TableCell className="text-[10px]">{item.date_of_purchase}</TableCell>
                                <TableCell className="text-[10px]">{item.date_out}</TableCell>
                                <TableCell className="text-[10px]">{item.size}</TableCell>
                                <TableCell className="text-[10px]">{item.remarks}</TableCell>
                            </TableRow>
                        ))
                    )}       
                </TableBody>
              </Table>
         </div>
    </AppLayout>
}