import { z } from 'zod' 
import { Context } from 'hono'
import { createPasteSchema } from '../schemas/pasteSchema.js';
import { randomUrl } from '../utils/id.js';
import type { PasteType } from "../types/types.js";
import { addToDB, deleteFromDB, getFromDB } from '../services/pasteService.js';

export async function addPasteData (c : Context) {
    const id = randomUrl();
    let expiresAt:number | undefined;

    const body = await c.req.json();
    const result = createPasteSchema.safeParse(body);
    if(!result.success){
        return c.json({error: z.flattenError(result.error).fieldErrors}, 400)
    }
    const { title, language, visibility, text, expiresIn }  = result.data;
    const pasteData : PasteType = {
        id: id,
        title: title,
        language: language, // if undefined, JSON.stringify will drop title and language
        text: text,
        visibility: visibility,   
    }
    if(expiresIn){
        expiresAt = Date.now() + expiresIn * 1000;
        pasteData.expiresAt = expiresAt;
    }
    try{
        await addToDB(c.env,id, pasteData);

    }catch (error) {
        console.error("KV Put failed:", error);  
        return c.text("Failed to save data", 500);
    }
    return c.json({ id: id, expiresAt: expiresAt ?? null }, 201);

}

export async function getPasteData (c : Context) {
    const pasteId = c.req.param('id') as string;
    let pastedContent : any;
    try {
        const paste = await getFromDB(c.env, pasteId);
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
        await deleteFromDB(c.env, pasteId);
        return c.json({
            error: "This paste had been expired."
        }, 410);
    }
    
    return c.json(pastedContent);
}

export async function deletePasteData(c: Context) {
    const id = c.req.param('id') as string;
    try {
        await deleteFromDB(c.env, id);
        return c.json({ success: true});
    } catch (error: unknown){
        console.error("Error in deletion: ", error);
        return c.text("Failed to delete data", 500);
    }
}

export async function getRawPasteData(c: Context){
    const id = c.req.param('id') as string;
    const paste = await getFromDB(c.env, id);

    if (!paste) {
        return c.text("Paste not found", 404);
    }

    const text = JSON.parse(paste).text;

    return c.text(text);
}