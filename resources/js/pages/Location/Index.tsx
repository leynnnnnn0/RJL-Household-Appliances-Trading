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
import { Head } from "@inertiajs/react";

// Dummy data
const initialLocations = [
  { id: 1, name: 'Main Warehouse', address: '123 Industrial Ave, Metro Manila', remarks: 'Primary storage facility' },
  { id: 2, name: 'Branch Office - Makati', address: '456 Ayala Avenue, Makati City', remarks: 'Sales office with small inventory' },
  { id: 3, name: 'Distribution Center', address: '789 EDSA, Quezon City', remarks: 'Regional distribution hub' },
  { id: 4, name: 'Repair Center', address: '321 Shaw Blvd, Mandaluyong', remarks: 'Equipment maintenance and repair' },
  { id: 5, name: 'Storage Facility - North', address: '555 Commonwealth Ave, Quezon City', remarks: 'Overflow storage' },
];

export default function Index() {
  const [locations, setLocations] = useState(initialLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    remarks: ''
  });

  // Filter locations based on search
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.remarks.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open dialog for create
  const handleCreate = () => {
    setEditingLocation(null);
    setFormData({ name: '', address: '', remarks: '' });
    setIsDialogOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      remarks: location.remarks
    });
    setIsDialogOpen(true);
  };

  // Save location (create or update)
  const handleSave = () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Please fill in required fields');
      return;
    }

    if (editingLocation) {
      // Update existing
      setLocations(locations.map(loc =>
        loc.id === editingLocation.id
          ? { ...loc, ...formData }
          : loc
      ));
    } else {
      // Create new
      const newLocation = {
        id: Math.max(...locations.map(l => l.id), 0) + 1,
        ...formData
      };
      setLocations([...locations, newLocation]);
    }

    setIsDialogOpen(false);
    setFormData({ name: '', address: '', remarks: '' });
  };

  // Open delete confirmation
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    setLocations(locations.filter(loc => loc.id !== deleteId));
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <AppLayout>
      <Head title="Locations" />
      <ModuleHeading 
        title="Locations" 
        description="Manage the locations"
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
              placeholder="Search locations..."
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
                <TableHead className="font-semibold">Address</TableHead>
                <TableHead className="font-semibold">Remarks</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-8 w-8 mb-2" />
                      <p className="font-medium">No locations found</p>
                      <p className="text-sm">Try adjusting your search or create a new location</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location) => (
                  <TableRow key={location.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.address}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{location.remarks}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(location)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(location.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Edit Location' : 'Create New Location'}</DialogTitle>
            <DialogDescription>
              {editingLocation ? 'Update the location details below.' : 'Enter the details for the new location.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter location name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter remarks (optional)"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingLocation ? 'Update' : 'Create'}
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
              This action cannot be undone. This will permanently delete the location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
} 