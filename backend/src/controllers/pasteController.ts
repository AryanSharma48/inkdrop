import { z } from 'zod' 
import { Context } from 'hono'
import { createPasteSchema } from '../schemas/pasteSchema.js';
import { randomUrl } from '../utils/id.js';
import type { PasteType } from "../types/types.js";
import { addToDB, deleteFromDB, getFromDB, getAllFromDB, getPastesByUserId } from '../services/pasteService.js';
import { generateSHA256 } from '../utils/hash.js';

export async function addPasteData (c : Context) {
    const id = randomUrl();
    let expiresAt: number | undefined;
    let passwordHash : string | null;

    const body = await c.req.json();
    const result = createPasteSchema.safeParse(body);
    if(!result.success){
        return c.json({error: z.flattenError(result.error).fieldErrors}, 400)
    }
    const payload = c.get('jwtPayload') as { sub: string; username?: string } | undefined;
    const { title, language, visibility, text, expiresIn, isBurn, password }  = result.data;
    const pasteData : PasteType = {
        id: id,
        userId: payload?.sub ?? null,
        creatorName: payload?.username ?? null,
        title: title,
        language: language, // if undefined, JSON.stringify will drop title and language
        text: text,
        visibility: visibility,
        isBurn: isBurn,
    }

    if(expiresIn){
        expiresAt = Date.now() + expiresIn * 1000;
        pasteData.expiresAt = expiresAt;
    }

    if(password){
        passwordHash = await generateSHA256(password);
        pasteData.passwordHash = passwordHash;
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

    if(pastedContent.passwordHash){
        const providedPassword = c.req.header('x-paste-password');
        if(!providedPassword || providedPassword == undefined){
            return c.json({
                error: "Password required",
                isProtected: true,
            }, 401);
        }

        const hashPassword = await generateSHA256(providedPassword);
        if(hashPassword !== pastedContent.passwordHash){
            return c.json({ error: "Incorrect password." }, 401);
        }
    }

    if(pastedContent.isBurn){
        c.executionCtx.waitUntil(deleteFromDB(c.env, pasteId));
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

    const parsedPaste = JSON.parse(paste);
    const text = parsedPaste.text;

    if(parsedPaste.expiresAt < Date.now()){
        await deleteFromDB(c.env, id);
        return c.text("This paste has been expired.", 410);
    }

    if(parsedPaste.passwordHash){
        const providedPassword = c.req.header('x-paste-password');
        if(!providedPassword || providedPassword == undefined){
            return c.json({
                error: "Password required",
                isProtected: true,
            }, 401);
        }

        const hashPassword = await generateSHA256(providedPassword);
        if(hashPassword !== parsedPaste.passwordHash){
            return c.text("Incorrect password", 401);
        }
    }

    if(parsedPaste.isBurn){
        c.executionCtx.waitUntil(deleteFromDB(c.env, id));
    }

    

    return c.text(text);
}

export async function getAllPastes(c: Context){
    
    try{
        const pastes = await getAllFromDB(c.env);
        if ( pastes === null){
            return c.json({
                error: "No Paste Found",
            }, 404)
        }
        
        return c.json({
            pastes: pastes.results
        }, 200);

    } catch(error : unknown){
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to fetch data:`, message);
        return c.json({ error: 'Failed to fetch data from storage' }, 500)
    }
}

export async function getMyPastes(c: Context) {
    try {
        const payload = c.get('jwtPayload') as { sub: string } | undefined;
        if (!payload) {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        
        const userId = payload.sub;
        const pastes = await getPastesByUserId(c.env, userId);
        return c.json({
            pastes: pastes.results || []
        }, 200);
        
    } catch(error : unknown){
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to fetch user pastes:`, message);
        return c.json({ error: 'Failed to fetch pastes from storage' }, 500)
    }
}