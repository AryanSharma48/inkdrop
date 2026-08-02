import type { UserType } from '../types/types.js'
import { randomUrl } from '../utils/id.js'
 
export async function upsertUser(
    env: any, 
    githubUser: { id: number; login: string; avatar_url: string }
): Promise<UserType> {

    const userData = (await env.ink_drop_db.prepare(`SELECT * FROM users WHERE githubId = ?`)
        .bind(githubUser.id.toString())
        .first()) as UserType | null;
    
    if (userData) {
        await env.ink_drop_db.prepare(`UPDATE users SET userName = ?, avatarUrl = ? WHERE githubId = ?`).bind(
            githubUser.login,
            githubUser.avatar_url,
            githubUser.id.toString()
        ).run();
        
        return {
            ...userData,
            userName: githubUser.login,
            avatarUrl: githubUser.avatar_url
        };
    } else {
        const id = randomUrl();
        const createdAt = Date.now();
        await env.ink_drop_db.prepare(`INSERT INTO users (id, githubId, userName, avatarUrl, createdAt) VALUES (?, ?, ?, ?, ?)`).bind(
            id, 
            githubUser.id.toString(),
            githubUser.login,
            githubUser.avatar_url,
            createdAt
        ).run();

        return {
            id,
            githubId: githubUser.id.toString(),
            userName: githubUser.login,
            avatarUrl: githubUser.avatar_url,
            createdAt
        };
    }
}