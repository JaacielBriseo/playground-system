import { useRef, useState } from 'react';

import { Upload, X } from 'lucide-react';

import { t } from '@/lib/i18n';
import { ImagePreview } from '@/lib/schemas';

interface Props {
    value?: ImagePreview[];
    onValueChange?: (images: ImagePreview[]) => void;
    maxSize?: number;
    className?: string;
    maxFiles?: number;
    validationRules?: string;
}

export function ImageUploaderInput({ value = [], onValueChange, maxSize = 10, className = '', maxFiles }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        // Check if we're exceeding the maximum number of files
        if (maxFiles && value.length + files.length > maxFiles) {
            setError(t('You cannot upload more than :count files', { count: maxFiles }));
            return;
        }

        const newPreviews: ImagePreview[] = [];
        let hasError = false;

        Array.from(files).forEach((file) => {
            if (!file.type.startsWith('image/')) {
                setError('Please select only image files');
                hasError = true;
                return;
            }

            if (file.size > maxSize * 1024 * 1024) {
                setError(`File size must be less than ${maxSize}MB`);
                hasError = true;
                return;
            }

            newPreviews.push({
                url: URL.createObjectURL(file),
                file,
            });
        });

        if (!hasError) {
            setError(null);
            onValueChange?.([...value, ...newPreviews]);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeNewImage = (index: number) => {
        const imageToRemove = value[index];
        if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.url);
        }
        const updatedImages = value.filter((_, i) => i !== index);
        onValueChange?.(updatedImages);
        setError(null);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* New Images Preview */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {value.map((image, index) => (
                        <div key={index} className="group relative">
                            <img
                                src={image.url || '/placeholder.svg'}
                                alt="Preview"
                                width={200}
                                height={200}
                                className="aspect-square h-auto w-full rounded object-cover shadow"
                            />
                            <button
                                type="button"
                                className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-xs text-white transition-colors hover:bg-red-600"
                                onClick={() => removeNewImage(index)}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            <div
                className="hover:border-primary relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors duration-200"
                onClick={() => fileInputRef.current?.click()}
            >
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="text-gray-600">Click or drag images here to upload</p>
                    <p className="text-xs text-gray-400">Recommended format: JPG or PNG. Max {maxSize}MB each.</p>
                </div>
            </div>

            {/* Error Message */}
            {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        </div>
    );
}
