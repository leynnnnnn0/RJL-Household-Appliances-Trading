import ModuleHeading from "@/components/cards/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useState } from "react";
import { Archive, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/types";

const roles = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'collector', label: 'Collector' },
  { value: 'investigator', label: 'Investigator' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
];

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: Role[];
  phone_number: string;
  created_at?: string;
  updated_at?: string;
}

interface ShowProps {
  user: User;
}

export default function Show({ user }: ShowProps) {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const getRoleLabel = (roleValue: string) => {
    return roles.find(r => r.value === roleValue)?.label || roleValue;
  };

  const handleArchive = () => {
    setIsArchiving(true);
    router.delete(route('users.destroy', user.id), {
      onFinish: () => {
        setIsArchiving(false);
        setShowArchiveDialog(false);
      },
    });
  };

  const handleEdit = () => {
    router.visit(route('users.edit', user.id));
  };

  return (
    <AppLayout>
      <Head title={`${user.first_name} ${user.last_name}`} />
      <ModuleHeading 
        title="User Details" 
        description="View user information and manage account." 
      />

      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-2xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="mt-1">
                User account information
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowArchiveDialog(true)}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p className="text-base">{user.first_name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p className="text-base">{user.last_name}</p>
              </div>
      

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email Address</p>
              <p className="text-base">{user.email}</p>
            </div>

               <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
              <p className="text-base">{user.phone_number || 'Not provided'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Roles</p>
              <div className="flex flex-wrap gap-2">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {getRoleLabel(role.name)}
                    </Badge>
                  ))
                ) : (
                  <p className="text-base">No roles assigned</p>
                )}
              </div>
            </div>
      </div>
         

            {(user.created_at || user.updated_at) && (
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-6">
                  {user.created_at && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Created At</p>
                      <p className="text-sm">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {user.updated_at && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm">
                        {new Date(user.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {user.first_name} {user.last_name}? This action will remove the user from active listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleArchive} 
              disabled={isArchiving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}