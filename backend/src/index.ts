import { Hono } from 'hono'
import { pasteRouter } from './routes/pasteRoute.js';

const app = new Hono();

app.route('/api', pasteRouter);

export default app;