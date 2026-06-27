import { formatFileSize } from '@/components/pos-credit/credit-calculations';
import type { UploadedFile } from '@/components/pos-credit/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, Upload, X } from 'lucide-react';

interface DocumentsCardProps {
    files: UploadedFile[];
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (id: string) => void;
}

export function DocumentsCard({
    files,
    onUpload,
    onRemove,
}: DocumentsCardProps) {
    return (
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Documents
                </CardTitle>
                <CardDescription>
                    Upload supporting documents (PNG, JPG, PDF up to 10MB each)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary">
                    <input
                        type="file"
                        id="fileUpload"
                        className="hidden"
                        multiple
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={onUpload}
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                        <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                        <p className="mb-1 font-medium">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground">
                            PNG, JPG, PDF up to 10MB
                        </p>
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="space-y-2">
                        <Label>Uploaded Files ({files.length})</Label>
                        <div className="space-y-2">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemove(file.id)}
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
    );
}
