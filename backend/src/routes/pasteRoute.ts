import { Hono } from 'hono'

import { addPasteData, deletePasteData, getAllPastes, getPasteData, getRawPasteData, getMyPastes } from '../controllers/pasteController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

type Bindings = {
    PASTE_KV: KVNamespace
}

const app = new Hono<{ Bindings : Bindings}>();

app.post('/pastes', optionalAuth, addPasteData);
app.get('/pastes', getAllPastes);
app.get('/my-pastes', requireAuth, getMyPastes);
app.get('/pastes/:id', getPasteData);
app.delete('/pastes/:id', deletePasteData);
app.get('/raw/:id', getRawPasteData);

export const pasteRouter = app;