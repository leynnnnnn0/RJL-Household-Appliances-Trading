import ShowButton from "@/components/buttons/show-button";
import ModuleHeading from "@/components/cards/module-heading";
import NoResult from "@/components/cards/no-result";
import SearchBox from "@/components/cards/search-box";
import TableBodyRow from "@/components/cards/table-body-row";
import TableContainer from "@/components/cards/table-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import AppLayout from "@/layouts/app-layout";
import { Employee, Paginated } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  employees: Paginated<Employee>;
}

export default function Index({ employees }: PageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const createForm = useForm({
    first_name: "",
    last_name: "",
    remarks: "",
  });

  const editForm = useForm({
    first_name: "",
    last_name: "",
    remarks: "",
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      router.get("/employees", params, {
        preserveState: true,
        replace: true,
      });
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post("/employees", {
      onSuccess: () => {
        setIsCreateOpen(false);
        createForm.reset();
         toast.success("Created Successfully.")
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    editForm.put(`/employees/${selectedEmployee.id}`, {
      onSuccess: () => {
        setIsEditOpen(false);
        editForm.reset();
        setSelectedEmployee(null);
        toast.success("Updated Successfully.")
      },
    });
  };

  const handleDelete = () => {
    if (!selectedEmployee) return;
    router.delete(`/employees/${selectedEmployee.id}`, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedEmployee(null);
         toast.success("Deleted Successfully.")
      },
      onError: (e) => {
          setIsDeleteOpen(false);
        setSelectedEmployee(null);
        toast.success("This user cannot be deleted. Please contact your administrator");
      }
    });
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    editForm.setData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      remarks: employee.remarks || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteOpen(true);
  };

  return (
    <AppLayout>
      <Head title="Employees" />
      <ModuleHeading title="Employees List" description="Manage employees data">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus /> Create New Employee
        </Button>
      </ModuleHeading>

      <SearchBox>
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </SearchBox>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Remarks</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.data.length === 0 ? (
              <NoResult count={3} />
            ) : (
              employees.data.map((item) => (
                <TableBodyRow key={item.id}>
                  <TableCell>{item.full_name}</TableCell>
                  <TableCell>{item.remarks || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => openDeleteDialog(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableBodyRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to the system. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={createForm.data.first_name}
                  onChange={(e) => createForm.setData("first_name", e.target.value)}
                  className={createForm.errors.first_name ? "border-red-500" : ""}
                />
                {createForm.errors.first_name && (
                  <p className="text-sm text-red-500">{createForm.errors.first_name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="last_name">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={createForm.data.last_name}
                  onChange={(e) => createForm.setData("last_name", e.target.value)}
                  className={createForm.errors.last_name ? "border-red-500" : ""}
                />
                {createForm.errors.last_name && (
                  <p className="text-sm text-red-500">{createForm.errors.last_name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={createForm.data.remarks}
                  onChange={(e) => createForm.setData("remarks", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  createForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createForm.processing}>
                {createForm.processing ? "Creating..." : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the employee information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_first_name">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit_first_name"
                  value={editForm.data.first_name}
                  onChange={(e) => editForm.setData("first_name", e.target.value)}
                  className={editForm.errors.first_name ? "border-red-500" : ""}
                />
                {editForm.errors.first_name && (
                  <p className="text-sm text-red-500">{editForm.errors.first_name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_last_name">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit_last_name"
                  value={editForm.data.last_name}
                  onChange={(e) => editForm.setData("last_name", e.target.value)}
                  className={editForm.errors.last_name ? "border-red-500" : ""}
                />
                {editForm.errors.last_name && (
                  <p className="text-sm text-red-500">{editForm.errors.last_name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_remarks">Remarks</Label>
                <Textarea
                  id="edit_remarks"
                  value={editForm.data.remarks}
                  onChange={(e) => editForm.setData("remarks", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  editForm.reset();
                  setSelectedEmployee(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editForm.processing}>
                {editForm.processing ? "Updating..." : "Update Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              {selectedEmployee && ` "${selectedEmployee.full_name}"`} from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedEmployee(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}