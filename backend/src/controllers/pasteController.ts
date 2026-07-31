import { z } from 'zod' 
import { Context } from 'hono'
import { createPasteSchema } from '../schemas/paste.js';
import { randomUrl } from '../utils/id.js';
import type { PasteType } from "../types/types.js";

export async function addPasteData (c : Context) {
    const id = randomUrl();
    let expiresAt:number | undefined;

    const body = await c.req.json();
    const result = createPasteSchema.safeParse(body);
    if(!result.success){
        return c.json({error: z.flattenError(result.error).fieldErrors}, 400)
    }
    const { text, expiresIn }  = result.data;
    const pasteData : PasteType = {
        id: id,
        text: text,
    }
    if(expiresIn){
        expiresAt = Date.now() + expiresIn * 1000;
        pasteData.expiresAt = expiresAt;
    }
    
    try{
        await c.env.PASTE_KV.put(id, JSON.stringify(pasteData));

    }catch (error) {
        console.error("KV Put failed:", error);  
        return c.text("Failed to save data", 500);
    }

    return c.json({ id: id, expiresAt: expiresAt ?? null }, 201);

}

export async function getPasteData (c : Context) {
    const pasteId = c.req.param('id');
    let pastedContent : any;
    try {
        const paste = await c.env.PASTE_KV.get(pasteId);
        if ( paste === null){
            return c.json({
                error: "Key not found."
            }, 404)
        }
        pastedContent = JSON.parse(paste);

    } catch(error : unknown){
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(`KV Error for key ${pasteId}:`, message)
        return c.json({ error: 'Failed to fetch data from storage' }, 500)
    } 
    
    if(pastedContent.expiresAt < Date.now()){
        await c.env.PASTE_KV.delete(pasteId);
        return c.json({
            error: "This paste had been expired."
        }, 410);
    }
    
    return c.json(pastedContent);
}