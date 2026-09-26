export interface Team {
    id: number;
    name: string;
    slug: string;
    is_personal: boolean;
}

export interface TeamMember {
    id: number;
    user_id: number;
    name: string;
    email: string;
    role: 'owner' | 'member';
}

export interface TeamInvitation {
    id: number;
    email: string;
    invited_by: string | null;
    expires_at: string;
}
