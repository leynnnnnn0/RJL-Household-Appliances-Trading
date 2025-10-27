import React, { useState } from 'react';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import Pagination from "@/components/pagination";
import { Head, router, useForm } from "@inertiajs/react";
import { Supplier, Paginated } from '@/types';
import { toast } from 'sonner';

interface PageProps {
  suppliers: Paginated<Supplier>;
}

export default function Index({ suppliers }: PageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(Number);
  const [deleteId, setDeleteId] = useState(null);
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    remarks: ''
  });

  const resetForm = () => {
    reset();
    setIsEditing(false);
  };

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.data.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open dialog for create
  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (supplier: Supplier) => {
    setIsEditing(true);
    setEditId(supplier.id);
    setData('name', supplier.name);
    setData('remarks', supplier.remarks || '');
    setIsDialogOpen(true);
  };

  // Save supplier (create or update)
  const handleSave = () => {
    if (isEditing) {
      put(`/suppliers/${editId}`, {
        onSuccess: () => {
          toast.success("Supplier Updated Successfully.");
          setIsDialogOpen(false);
          resetForm();
        },
        onError: (e) => {
          toast.error(e.error, { duration: 10000 });
        }
      });
    } else {
      post('/suppliers', {
        onSuccess: () => {
          toast.success("Supplier Created Successfully.");
          setIsDialogOpen(false);
          resetForm();
        },
        onError: (e) => {
          toast.error(e.error);
        }
      });
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (id: any) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    router.delete(`/suppliers/${deleteId}`, {
      onSuccess: () => {
        toast.success("Supplier Deleted Successfully.");
        setIsDeleteDialogOpen(false);
      },
      onError: (e: any) => {
        toast.error(e.error);
      }
    });
    setDeleteId(null);
  };

  return (
    <AppLayout>
      <Head title="Suppliers" />
      <ModuleHeading 
        title="Suppliers" 
        description="Manage the suppliers"
      >
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </ModuleHeading>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Slug</TableHead>
                <TableHead className="font-semibold">Remarks</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-8 w-8 mb-2" />
                      <p className="font-medium">No suppliers found</p>
                      <p className="text-sm">Try adjusting your search or create a new supplier</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.slug} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.slug}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{supplier.remarks ?? 'None'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination
          data={suppliers}
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Supplier' : 'Create New Supplier'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the supplier details below.' : 'Enter the details for the new supplier.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter supplier name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value.toUpperCase())}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter remarks (optional)"
                value={data.remarks}
                onChange={(e) => setData('remarks', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={processing}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}