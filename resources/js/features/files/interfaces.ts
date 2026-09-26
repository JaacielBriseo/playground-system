import { Nullable, User } from '@/types';

export interface File {
    id: number;
    fileable_id: number;
    fileable_type: string;
    filename: string;
    relative_path: string;
    type: string;
    size: string;
    extension: string;
    hash: string;
    url: string;
    metadata?: string; // JSON string with additional metadata
    created_by?: Nullable<User>;
    updated_by?: Nullable<User>;
    deleted_by?: Nullable<User>;
}
