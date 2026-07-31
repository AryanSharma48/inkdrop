import { Hono } from 'hono'

import { addPasteData, deletePasteData, getPasteData } from '../controllers/pasteController.js';

type Bindings = {
    PASTE_KV: KVNamespace
}

const app = new Hono<{ Bindings : Bindings}>();

app.post('/pastes', addPasteData);
app.get('/pastes/:id', getPasteData)
app.delete('/pastes/:id', deletePasteData)

export const pasteRouter = app;