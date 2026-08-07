import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { pasteRouter } from './routes/pasteRoute.js';
import { authRouter } from './routes/authRoute.js';

const app = new Hono();

app.use('/api/*', cors({
    origin : ["https://inkdroppaste.vercel.app","http://localhost:5173"]
}));

app.route('/api', pasteRouter);
app.route('/api/auth', authRouter);

app.get('/health', (c) => {
    return c.json({
        status: "ok",
    }, 200);
})

export default {
    fetch: app.fetch,

    async scheduled(event: any, env: any, ctx: any){
        console.log("Running garbage collection..");
        const now = Date.now();

        await env.ink_drop_db.prepare(`DELETE FROM pastes WHERE expiresAt < ?`).bind(now).run();

        console.log("Garbage collection complete");
    }
}