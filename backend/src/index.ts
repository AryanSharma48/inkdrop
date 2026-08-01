import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { pasteRouter } from './routes/pasteRoute.js';

const app = new Hono();

app.use('/api/*', cors({
    origin : ["https://inkdroppaste.vercel.app","http://localhost:5173"]
}));

app.route('/api', pasteRouter);

export default app;