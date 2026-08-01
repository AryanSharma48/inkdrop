import { Hono } from 'hono'

import { addPasteData, deletePasteData, getAllPastes, getPasteData, getRawPasteData } from '../controllers/pasteController.js';

type Bindings = {
    PASTE_KV: KVNamespace
}

const app = new Hono<{ Bindings : Bindings}>();

app.post('/pastes', addPasteData);
app.get('/pastes', getAllPastes);
app.get('/pastes/:id', getPasteData);
app.delete('/pastes/:id', deletePasteData);
app.get('/raw/:id', getRawPasteData);

export const pasteRouter = app;