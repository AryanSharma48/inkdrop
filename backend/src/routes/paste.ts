import { Hono } from 'hono'
import { z } from 'zod' 
import { createPasteSchema } from '../schemas/paste.js';
import { randomUrl } from '../utils/id.js';
import type { PasteType } from "../types/types.js";

type Bindings = {
    PASTE_KV: KVNamespace
}

const app = new Hono<{ Bindings : Bindings}>();

app.post('/pastes', async (c) => {
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
        return c.text("Successfully saved data to KV");
        
    }catch (error) {
        console.error("KV Put failed:", error);  
        return c.text("Failed to save data", 500);
    }

    return c.json({
        id: id ,
        text,
        expiresAt: expiresAt ?? null,
    })
})

app.get('/pastes/:id', (c) => {
    return c.text("GET Placeholder");
})

app.delete('/pastes/:id', (c) => {
    return c.text("DELETE Placeholder");
})

export const pasteRouter = app;