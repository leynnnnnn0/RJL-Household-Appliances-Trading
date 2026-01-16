import React, { useState } from 'react';
import { Search, Eye, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, router, useForm } from "@inertiajs/react";
import { Branch, Paginated } from '@/types';
import { toast } from 'sonner';
import Pagination from '@/components/pagination';

interface PageProps {
  branches: Paginated<Branch>;
}

export default function Index({branches}: PageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(Number);
  const [deleteId, setDeleteId] = useState(null);
  const { data, setData, post, put, processing, errors } = useForm({
    name: '',
    address: '',
    remarks: ''
  });

  const setEditing = () => {
    setData('address', '');
    setData('name', '');
    setData('remarks', '');
  }

  // Filter branches based on search
  const filteredLocations = branches?.data.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) || branch.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open dialog for create
  const handleCreate = () => {
    setEditing();  
    setIsDialogOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (branch : Branch) => {
    setIsEditing(true);
    setEditId(branch.id);
    setData('address', branch.address);
    setData('name', branch.name);
    setData('remarks', branch.remarks || '');
    setIsDialogOpen(true);
  };

  // Save branch (create or update)
  const handleSave = () => {
    if (isEditing) {
      put(`/branches/${editId}`, {
        onSuccess: () => {
          toast.success("Branch Updated Successfully.");
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error("An error occured while trying to update the branch")
        }
      })
    } else {
      post('/branches', {
        onSuccess: () => {
          toast.success("Branch Created Successfully.");
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error("An error occured while trying to create the branch")
        }
      })
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (id : any) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    router.delete(`/branches/${deleteId}`, {
      onSuccess: () => {
        toast.success("Branch Deleted Successfully.");
        setIsDialogOpen(false);
      },
      onError: (e:any) => {
        toast.error(e.error);
      }
    })
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <AppLayout>
      <Head title="Branches" />
      <ModuleHeading 
        title="Branches" 
        description="Manage the branches"
      >
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">Create New</span>
          <span className="xs:hidden">New</span>
        </Button>
      </ModuleHeading>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold min-w-[120px]">Name</TableHead>
                  <TableHead className="font-semibold min-w-[150px] hidden sm:table-cell">Address</TableHead>
                  <TableHead className="font-semibold min-w-[150px] hidden md:table-cell">Remarks</TableHead>
                  <TableHead className="font-semibold text-center min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search className="h-8 w-8 mb-2" />
                        <p className="font-medium">No branches found</p>
                        <p className="text-sm px-4">Try adjusting your search or create a new branch</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocations.map((branch) => (
                    <TableRow key={branch.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{branch.name}</span>
                          <span className="text-xs text-muted-foreground sm:hidden mt-1">{branch.address}</span>
                          <span className="text-xs text-muted-foreground md:hidden mt-1">{branch.remarks ?? 'No remarks'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{branch.address}</TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{branch.remarks ?? 'None'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(branch)}
                            aria-label="Edit branch"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(branch.id)}
                            aria-label="Delete branch"
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
        </div>

        <Pagination data={branches}/>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Branch' : 'Create New Branch'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the branch details below.' : 'Enter the details for the new branch.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter branch name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter address"
                value={data.address}
                onChange={(e) => setData('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter remarks (optional)"
                value={data.remarks}
                onChange={(e) => setData('remarks', e.target.value )}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={processing} className="w-full sm:w-auto">
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the branch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-white w-full sm:w-auto">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}