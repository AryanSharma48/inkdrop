import type { UserType } from '../types/types.js'
import { randomUrl } from '../utils/id.js'
 
export async function upsertUser(
    env: any, 
    provider: string,
    providerId: string,
    userName: string,
    avatarUrl: string
): Promise<UserType> {

    const userData = (await env.ink_drop_db.prepare(`SELECT * FROM users WHERE provider = ? AND providerId = ?`)
        .bind(provider, providerId)
        .first()) as UserType | null;
    
    if (userData) {
        await env.ink_drop_db.prepare(`UPDATE users SET userName = ?, avatarUrl = ? WHERE provider = ? AND providerId = ?`).bind(
            userName,
            avatarUrl,
            provider,
            providerId
        ).run();
        
        return {
            ...userData,
            userName: userName,
            avatarUrl: avatarUrl
        };
    } else {
        const id = randomUrl();
        const createdAt = Date.now();
        await env.ink_drop_db.prepare(`INSERT INTO users (id, provider, providerId, userName, avatarUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)`).bind(
            id, 
            provider,
            providerId,
            userName,
            avatarUrl,
            createdAt
        ).run();

        return {
            id,
            provider,
            providerId,
            userName,
            avatarUrl,
            createdAt
        };
    }
}