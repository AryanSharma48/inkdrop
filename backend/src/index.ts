import { Hono } from 'hono'
import { pasteRouter } from './routes/paste.js';

const app = new Hono();

app.route('/api', pasteRouter);

export default app;