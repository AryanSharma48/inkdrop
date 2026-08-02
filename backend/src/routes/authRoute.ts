import { Hono } from 'hono';
import { postGithubAuth } from '../controllers/authController.js';

type Bindings = {
    PASTE_KV: KVNamespace,
    CLIENT_ID : string,
    CLIENT_SECRET: string,
    JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>();

app.post('/', postGithubAuth );

export const authRouter = app;