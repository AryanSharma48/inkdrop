import { Hono } from 'hono'
import { z } from 'zod' 
import { createPasteSchema } from '../schemas/paste.js';

const app = new Hono();

app.post('/pastes', async (c) => {
    const body = await c.req.json();
    const result = createPasteSchema.safeParse(body);
    if(!result.success){
        return c.json({error: z.flattenError(result.error).fieldErrors}, 400)
    }
    const { text, expiresIn }  = result.data;

    return c.json({
        id: "TODO",
        text,
        expiresIn: expiresIn ?? null,
    })
})

app.get('/pastes/:id', (c) => {
    return c.json({
        text: "GET Placeholder"
    })
})

app.delete('/pastes/:id', (c) => {
    return c.json({
        text: "DELETE Placeholder"
    })
})

export const pasteRouter = app;