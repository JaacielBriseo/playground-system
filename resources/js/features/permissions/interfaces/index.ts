import type { Nullable } from '@/types';

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: Nullable<string | Date>;
    updated_at: Nullable<string | Date>;
}
