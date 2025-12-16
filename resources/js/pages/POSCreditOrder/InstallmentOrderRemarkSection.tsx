import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Trash2, AlertCircle, User, Calendar } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';


interface InstallmentOrderRemark {
  id: number;
  installment_order_id: number;
  user_id: number;
  remarks: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    full_name: string;
  };
}


interface RemarksProps {
  transactionId: string | number;
  remarks: InstallmentOrderRemark[];
}

export default function InstallmentOrderRemarksSection({ transactionId, remarks }: RemarksProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [remarkToDelete, setRemarkToDelete] = useState<number | null>(null);

  // Form for creating new remark
  const remarkForm = useForm({
    installment_order_id: transactionId,
    remarks: ''
  });

  // Form for deleting remark
  const deleteForm = useForm({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitRemark = () => {
    remarkForm.post('/pos-installment-orders/remarks', {
              preserveScroll: true,
      onSuccess: () => {
        remarkForm.reset('remarks');
        toast.success('Remark added successfully');
      },
      onError: (errors) => {
        toast.error('Failed to add remark');
        console.log(errors);
      }
    });
  };

  const handleDeleteClick = (remarkId: number) => {
    setRemarkToDelete(remarkId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!remarkToDelete) return;

    deleteForm.delete(`/pos-installment-orders/remarks/${remarkToDelete}`, {
              preserveScroll: true,
      onSuccess: () => {
        setShowDeleteDialog(false);
        setRemarkToDelete(null);
        toast.success('Remark deleted successfully');
      },
      onError: (errors) => {
        toast.error('Failed to delete remark');
        console.log(errors);
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Remarks & Notes
          </CardTitle>
          <CardDescription>
            Add notes and remarks about this installment order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Remark Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">Add Remark</Label>
              <Textarea
                id="remarks"
                placeholder="Enter your remarks or notes here..."
                value={remarkForm.data.remarks}
                onChange={(e) => remarkForm.setData('remarks', e.target.value)}
                rows={4}
                className={remarkForm.errors.remarks ? 'border-red-500' : ''}
              />
              {remarkForm.errors.remarks && (
                <p className="text-xs text-red-500">{remarkForm.errors.remarks}</p>
              )}
            </div>
            <Button 
              onClick={handleSubmitRemark}
              disabled={remarkForm.processing || !remarkForm.data.remarks.trim()}
              className="w-full sm:w-auto"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {remarkForm.processing ? 'Adding...' : 'Add Remark'}
            </Button>
          </div>

          {remarks && remarks.length > 0 && (
            <>
              <Separator />
              
              {/* Remarks List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">All Remarks ({remarks.length})</h4>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {remarks
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((remark) => (
                      <div 
                        key={remark.id}
                        className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex items-center gap-2 flex-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{remark.user.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(remark.created_at)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(remark.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap pl-6">
                          {remark.remarks}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {(!remarks || remarks.length === 0) && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No remarks yet. Add the first one above.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Remark
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this remark? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will permanently remove the remark from the system.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setRemarkToDelete(null);
              }}
              disabled={deleteForm.processing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteForm.processing}
            >
              {deleteForm.processing ? 'Deleting...' : 'Delete Remark'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}