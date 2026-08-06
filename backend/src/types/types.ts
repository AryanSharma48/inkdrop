export interface PasteType {
    id: string,
    userId?: string | null,
    creatorName?: string | null,
    title?: string | undefined,
    language?: string | undefined,
    visibility: string,
    text: string,
    isBurn?: boolean,
    expiresAt?: number,
    passwordHash?: string | null,
}

export interface UserType {
    id: string;
    provider: string;
    providerId: string;
    userName: string;
    avatarUrl: string;
    createdAt: number;
}