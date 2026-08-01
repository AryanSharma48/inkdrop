import type { PasteType } from "../types/types.js";

export async function addToDB(env: any, id: string, pasteData: PasteType) {
    try {
        await env.ink_drop_db.prepare(
            `INSERT INTO pastes (id, title, language, visibility, text, isBurn, expiresAt, passwordHash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            id, 
            pasteData.title ?? null,
            pasteData.language ?? null,
            pasteData.visibility,
            pasteData.text, 
            pasteData.isBurn ?? null,
            pasteData.expiresAt ?? null,
            pasteData.passwordHash ?? null,
        ).run();

        await env.PASTE_KV.put(id, JSON.stringify(pasteData));
    } catch (error) {
        console.error("KV Put failed: ", error);
        throw new Error("Failed to save data to KV");
    }
}

export async function getFromDB(env: any, id: string){
    let paste =  await env.PASTE_KV.get(id);
    if (!paste){
        const d1_paste = await env.ink_drop_db.prepare(`SELECT * FROM pastes WHERE id = ?`).bind(id).first();
        paste = JSON.stringify(d1_paste);
    }
    return paste;
}

export async function deleteFromDB(env: any, id: string){
    try{

        //Clear from DB in D1 SQL storage
        await env.ink_drop_db.prepare(`DELETE FROM pastes WHERE id = ?`).bind(id).run();

        //Clear from cache in KV storage
        await env.PASTE_KV.delete(id);
    } catch (error: unknown){
        throw error;
    }
}

export async function getAllFromDB(env: any){
    try{
        const allData = await env.ink_drop_db.prepare(`SELECT id, language, isBurn, (passwordHash IS NOT NULL) as isProtected FROM pastes WHERE visibility = 'public' ORDER BY id DESC LIMIT 50`)
        .all();
        return allData;

    } catch (error : unknown){
        throw error;
    }
}