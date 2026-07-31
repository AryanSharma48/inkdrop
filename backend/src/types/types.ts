export interface PasteType {
    id: string,
    title?: string | undefined,
    language?: string | undefined,
    visibility: string,
    text: string,
    expiresAt?: number,    
}