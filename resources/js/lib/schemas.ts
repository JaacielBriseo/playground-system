import { z } from 'zod';

export const imagePreviewSchema = z.object({
    url: z.string(),
    file: z.instanceof(File),
});

export type ImagePreview = z.infer<typeof imagePreviewSchema>;
