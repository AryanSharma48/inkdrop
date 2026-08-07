import { Hono } from 'hono'

import { addPasteData, deletePasteData, getAllPastes, getPasteData, getRawPasteData, getMyPastes, syncPastes } from '../controllers/pasteController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

type Bindings = {
    PASTE_KV: KVNamespace,
    UPSTASH_REDIS_REST_URL: string,
    UPSTASH_REDIS_REST_TOKEN: string
}

const app = new Hono<{ Bindings : Bindings}>();

app.post('/pastes', optionalAuth, rateLimit(10, '1 m') ,  addPasteData);
app.post('/pastes/sync', requireAuth, syncPastes);
app.get('/pastes', rateLimit(100, '1 m'), getAllPastes);
app.get('/my-pastes', requireAuth, getMyPastes);
app.get('/pastes/:id', rateLimit(10000, '1 m'), getPasteData);
app.delete('/pastes/:id', optionalAuth, deletePasteData);
app.get('/raw/:id', rateLimit(10000, '1 m'), getRawPasteData);

export const pasteRouter = app;