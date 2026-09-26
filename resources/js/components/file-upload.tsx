'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { File, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
    onUploadSuccess: (filePath: string) => void;
    endpoint?: string;
    variant?: 'input' | 'box';
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
}

const FileUpload = ({ onUploadSuccess, endpoint = '/api/upload', variant = 'input', accept = '*', maxSize = 10, className }: Props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file: File) => {
        if (file.size > maxSize * 1024 * 1024) {
            return `File size must be less than ${maxSize}MB`;
        }
        return null;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSelectedFile(file);
        setError('');

        // Generate preview URL for images
        if (file.type.startsWith('image/')) {
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
        } else {
            setPreviewUrl(null);
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const filePath = res.data.file_path;
            onUploadSuccess(filePath);
        } catch (err) {
            console.error('Upload failed', err);
            setError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // useEffect(() => {
    //     return () => {
    //         if (previewUrl) {
    //             URL.revokeObjectURL(previewUrl);
    //         }
    //     };
    // }, [previewUrl]);

    if (variant === 'input') {
        return (
            <div className={cn('space-y-2', className)}>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={handleButtonClick} disabled={isUploading} className="relative">
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {isUploading ? 'Uploading...' : 'Choose File'}
                    </Button>
                    {selectedFile && (
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <File className="h-4 w-4" />
                            <span>{selectedFile.name}</span>
                            <span>({formatFileSize(selectedFile.size)})</span>
                            {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 h-20 rounded border object-contain" />}
                            {!isUploading && (
                                <Button type="button" variant="ghost" size="sm" onClick={clearFile} className="h-6 w-6 p-0">
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />
                {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            <Card className="border-muted-foreground/25 hover:border-muted-foreground/50 border-2 border-dashed transition-colors">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        {!previewUrl && (
                            <div className="bg-muted rounded-full p-4">
                                <Upload className="text-muted-foreground h-8 w-8" />
                            </div>
                        )}

                        {selectedFile ? (
                            <div className="space-y-2">
                                {!previewUrl && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <File className="h-4 w-4" />
                                        <span className="font-medium">{selectedFile.name}</span>
                                    </div>
                                )}
                                <p className="text-muted-foreground text-xs">{formatFileSize(selectedFile.size)}</p>
                                {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 max-h-40 rounded border object-contain" />}
                                {!isUploading && (
                                    <Button type="button" variant="outline" size="sm" onClick={clearFile} className="mt-2">
                                        <X className="mr-1 h-3 w-3" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <h3 className="font-medium">Upload a file</h3>
                                <p className="text-muted-foreground text-sm">Click to browse and select a file</p>
                                <p className="text-muted-foreground text-xs">Maximum file size: {maxSize}MB</p>
                            </div>
                        )}

                        <Button type="button" onClick={handleButtonClick} disabled={isUploading} className="w-full max-w-xs">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {selectedFile ? 'Upload Another' : 'Select File'}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />

            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    );
};

export default FileUpload;
