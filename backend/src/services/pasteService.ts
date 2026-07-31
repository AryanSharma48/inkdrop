import type { PasteType } from "../types/types.js";

export async function addToDB(env: any, id: string, pasteData: PasteType) {
    try {
        await env.PASTE_KV.put(id, JSON.stringify(pasteData));
    } catch (error) {
        console.error("KV Put failed:", error);
        throw new Error("Failed to save data to KV"); 
    }
}
